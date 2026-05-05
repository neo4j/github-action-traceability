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
  )}. The Linear GitHub integration may not be installed for this repository, or the workspace of the linear_api_key may not match the integration's workspace.`;
export const ERR_LINEAR_AUTH = () =>
  `The Linear API rejected the request as unauthorised. Verify the linear_api_key secret is set and has access to the workspace where issues live.`;
export const ERR_LINEAR_RATE_LIMITED = () =>
  `The Linear API rate-limited the request. The action will retry on the next pull_request event.`;
export const ERR_UNEXPECTED = (error: unknown) => `Unexpected: ${error}`;
