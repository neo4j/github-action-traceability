import * as core from '@actions/core';
import { ERR_LINEAR_AUTH, ERR_LINEAR_RATE_LIMITED } from './errors';

interface LinearClientI {
  /**
   * Returns the URLs of all attachments on the issue with the given identifier,
   * or null if no such issue exists. Throws on auth or rate-limit errors.
   */
  getIssueAttachmentUrls(identifier: string): Promise<string[] | null>;
}

const LINEAR_GRAPHQL_ENDPOINT = 'https://api.linear.app/graphql';

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
  constructor(private readonly apiKey: string) {}

  async getIssueAttachmentUrls(identifier: string): Promise<string[] | null> {
    core.info(`Fetching Linear issue ${identifier}.`);

    const response = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey,
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

export { LinearClient, LinearClientI };
