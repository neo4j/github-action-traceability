export const ERR_INPUT_NOT_FOUND = (input: string) => `Input not found "${input}".`;
export const ERR_INPUT_INVALID = (input: string, value: string) =>
  `Unrecognised value ${value} for input "${input}".`;
export const ERR_STRATEGY_REMOVED = (value: string) =>
  `The global_verification_strategy "${value}" was removed in a previous release. Use "linked" (verifies the PR is linked to a Linear issue via title, description, or branch name) or "disabled". See README.md for migration details.`;
export const ERR_NO_ISSUE_REFERENCE = () =>
  `No Linear issue reference found in the pull request title, description, or branch name. Linear auto-links a PR when any of these contains an issue ID like "NEO-123". To intentionally skip the check, prefix the title with "[NOID]" or apply the "No Linear" label.`;
export const ERR_ISSUE_NOT_FOUND = (identifiers: string[]) =>
  `None of the referenced Linear issues exist: ${identifiers.join(
    ', ',
  )}. Check for typos in the issue identifier.`;
export const ERR_ATTACHMENT_NOT_FOUND = (identifiers: string[], prUrl: string) =>
  `Linear has not registered ${prUrl} as an attachment on any of: ${identifiers.join(
    ', ',
  )}. The Linear GitHub integration may not be installed for this repository, or the configured Linear credential (linear_api_key, or linear_client_id/linear_client_secret) may not have access to the integration's workspace or the team that owns the issue. App tokens obtained via client credentials only see private teams the OAuth application has been explicitly granted access to.`;
export const ERR_LINEAR_AUTH = () =>
  `The Linear API rejected the request as unauthorised. Verify the configured Linear credential (linear_api_key, or linear_client_id/linear_client_secret) is set and has access to the workspace where issues live.`;
export const ERR_LINEAR_RATE_LIMITED = () =>
  `The Linear API rate-limited the request. The action will retry on the next pull_request event.`;
export const ERR_LINEAR_TOKEN_REQUEST = (detail: string) =>
  `Failed to obtain a Linear app token via client credentials: ${detail}. Verify the linear_client_id and linear_client_secret inputs match an OAuth application in your Linear workspace, and that "client credentials tokens" is toggled on for that application in Linear's application settings.`;
export const ERR_NO_LINEAR_AUTH = () =>
  `No Linear credential configured. Set either linear_api_key (a personal API key) or both linear_client_id and linear_client_secret (OAuth client credentials).`;
export const ERR_PARTIAL_LINEAR_CLIENT_CREDENTIALS = (missing: string) =>
  `Incomplete Linear OAuth client credentials: ${missing} is empty. OAuth client credentials require both linear_client_id and linear_client_secret. Note that an unset GitHub secret expands to an empty string, so check the secret name is spelled correctly and that the secret is available to this workflow.`;
export const ERR_UNEXPECTED = (error: unknown) => `Unexpected: ${error}`;
