import * as core from '@actions/core';
import { InputsClientI } from './client-inputs';
import { fetchLinearAppActorToken } from './client-linear';
import { ERR_NO_LINEAR_AUTH, ERR_PARTIAL_LINEAR_CLIENT_CREDENTIALS } from './errors';

/**
 * Resolves the value for the Linear `Authorization` header from the configured
 * credentials. Prefers OAuth client credentials — these are minted fresh on
 * every run, so the 30-day app-actor token lifetime never bites — and falls
 * back to a static personal API key. Personal API keys are sent verbatim; app
 * actor tokens require a `Bearer` prefix.
 */
async function resolveLinearAuthorization(inputs: InputsClientI): Promise<string> {
  const clientId = inputs.getLinearClientId();
  const clientSecret = inputs.getLinearClientSecret();

  // Half-configured client credentials are always a mistake: an unset GitHub
  // secret expands to an empty string, so a typo in the secret name would
  // otherwise fall through to the personal API key (or to a misleading "no
  // credential configured" error) instead of naming the real problem.
  if (clientId && !clientSecret) {
    throw new Error(ERR_PARTIAL_LINEAR_CLIENT_CREDENTIALS('linear_client_secret'));
  }
  if (clientSecret && !clientId) {
    throw new Error(ERR_PARTIAL_LINEAR_CLIENT_CREDENTIALS('linear_client_id'));
  }

  if (clientId && clientSecret) {
    core.info('Authenticating to Linear with OAuth client credentials.');
    const token = await fetchLinearAppActorToken(clientId, clientSecret);
    // The runner only masks values it received as `secrets.*`. This token is
    // minted at runtime, so it is unknown to the log masker until we register
    // it — without this, any future log line or stack trace carrying the token
    // would print a live 30-day workspace credential in plaintext.
    core.setSecret(token);
    return `Bearer ${token}`;
  }

  const apiKey = inputs.getLinearApiKey();
  if (apiKey) {
    core.info('Authenticating to Linear with a personal API key.');
    return apiKey;
  }

  throw new Error(ERR_NO_LINEAR_AUTH());
}

export { resolveLinearAuthorization };
