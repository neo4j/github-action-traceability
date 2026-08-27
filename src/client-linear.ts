import * as core from '@actions/core';
import { ERR_LINEAR_AUTH, ERR_LINEAR_RATE_LIMITED, ERR_LINEAR_TOKEN_REQUEST } from './errors';

interface LinearClientI {
  /**
   * Returns the URLs of all attachments on the issue with the given identifier,
   * or null if no such issue exists. Throws on auth or rate-limit errors.
   */
  getIssueAttachmentUrls(identifier: string): Promise<string[] | null>;
}

const LINEAR_GRAPHQL_ENDPOINT = 'https://api.linear.app/graphql';
const LINEAR_OAUTH_TOKEN_ENDPOINT = 'https://api.linear.app/oauth/token';
// `read` is sufficient to query issues and their attachments. Note that an app
// actor token only sees public teams plus any private teams the OAuth app has
// been explicitly granted access to on its details page.
const LINEAR_APP_TOKEN_SCOPE = 'read';

/**
 * Complete happy path example from the Linear documentation:
 *
 * ```json
 * {
 *   "access_token": "fxra4u0msw3bagb9rdn2i621bs52m9zo8ksoxljouygcu31nh8s2jf8fygbepy16",
 *   "token_type": "Bearer",
 *   "expires_in": 2591999,
 *   "scope": "read write",
 * }
 *
 * But so far, we only need to read the access_token.
 * ```
 */
interface TokenResponse {
  access_token?: string;
}

interface OAuthErrorResponse {
  error?: string;
  error_description?: string;
}

/**
 * Extracts the OAuth `error` / `error_description` from a failed token
 * response. The token endpoint's status code alone is not actionable in a CI
 * log — `invalid_client` and `invalid_scope` both surface as HTTP 400, and the
 * latter is what Linear returns when "client credentials tokens" has not been
 * toggled on for the application. Returns an empty string when the body is
 * missing or unparseable, so a broken gateway still reports its status.
 */
async function oauthErrorDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as OAuthErrorResponse;
    const detail = [body.error, body.error_description].filter(Boolean).join(': ');
    return detail ? ` (${detail})` : '';
  } catch {
    return '';
  }
}

/**
 * Exchanges an OAuth application's client_id/client_secret for a Linear "app
 * actor" access token via the client_credentials grant. The returned token is
 * valid for 30 days and must be sent as `Authorization: Bearer <token>`.
 * Fetched fresh on every run, so the 30-day lifetime never matters in practice.
 *
 * This is based on https://linear.app/developers/oauth-2-0-authentication#client-credentials-tokens
 */
async function fetchLinearAppActorToken(clientId: string, clientSecret: string): Promise<string> {
  core.info('Requesting Linear app token via client credentials.');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: LINEAR_APP_TOKEN_SCOPE,
  });

  const response = await fetch(LINEAR_OAUTH_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error(ERR_LINEAR_AUTH());
  }
  if (!response.ok) {
    throw new Error(
      ERR_LINEAR_TOKEN_REQUEST(`HTTP ${response.status}${await oauthErrorDetail(response)}`),
    );
  }

  const json = (await response.json()) as TokenResponse;
  if (!json.access_token) {
    throw new Error(ERR_LINEAR_TOKEN_REQUEST('the response did not include an access_token'));
  }
  return json.access_token;
}

const ISSUE_ATTACHMENTS_QUERY = `
  query IssueAttachments($id: String!) {
    issue(id: $id) {
      id
      attachments(first: 250) {
        nodes { url }
      }
    }
  }
`;

interface GraphQLError {
  message: string;
  extensions?: { type?: string; code?: string };
}

interface IssueAttachmentsResponse {
  data?: {
    issue: {
      id: string;
      attachments: { nodes: { url: string }[] };
    } | null;
  };
  errors?: GraphQLError[];
}

class LinearClient implements LinearClientI {
  /**
   * @param authorization what to set as header `Authorization`: either the API key or a Bearer token
   */
  constructor(private readonly authorization: string) {}

  async getIssueAttachmentUrls(identifier: string): Promise<string[] | null> {
    core.info(`Fetching Linear issue ${identifier}.`);

    const response = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authorization,
      },
      body: JSON.stringify({
        query: ISSUE_ATTACHMENTS_QUERY,
        variables: { id: identifier },
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(ERR_LINEAR_AUTH());
    }
    if (response.status === 429) {
      throw new Error(ERR_LINEAR_RATE_LIMITED());
    }
    if (!response.ok) {
      throw new Error(`Linear API returned HTTP ${response.status}.`);
    }

    const body = (await response.json()) as IssueAttachmentsResponse;

    if (body.errors?.length) {
      const notFound = body.errors.some(
        (e) => e.extensions?.type === 'NotFound' || /not found/i.test(e.message),
      );
      if (notFound) return null;

      const authFailed = body.errors.some(
        (e) =>
          e.extensions?.code === 'AUTHENTICATION_ERROR' ||
          /authentication|forbidden|unauthor/i.test(e.message),
      );
      if (authFailed) throw new Error(ERR_LINEAR_AUTH());

      const rateLimited = body.errors.some(
        (e) => e.extensions?.code === 'RATELIMITED' || /rate limit/i.test(e.message),
      );
      if (rateLimited) throw new Error(ERR_LINEAR_RATE_LIMITED());

      throw new Error(`Linear API error: ${body.errors.map((e) => e.message).join('; ')}`);
    }

    if (!body.data?.issue) return null;

    return body.data.issue.attachments.nodes.map((n) => n.url);
  }
}

export { LinearClient, LinearClientI, fetchLinearAppActorToken };
