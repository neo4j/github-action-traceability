import * as core from '@actions/core';
import { InputsClientI } from './client-inputs';
import { fetchLinearAppActorToken } from './client-linear';
import { ERR_NO_LINEAR_AUTH } from './errors';

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
  if (clientId && clientSecret) {
    core.info('Authenticating to Linear with OAuth client credentials.');
    const token = await fetchLinearAppActorToken(clientId, clientSecret);
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
