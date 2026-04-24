export const ERR_INVALID_NOID = (shortLinkId: string) =>
  `Unexpected NOID short link "${shortLinkId}". Only Linear issue links are allowed in your project, please provide one in the form of "[TEAM-123] My change description".`;
export const ERR_INPUT_NOT_FOUND = (input: string) => `Input not found "${input}".`;
export const ERR_INPUT_INVALID = (input: string, value: string) =>
  `Unrecognised value ${value} for input "${input}".`;
export const ERR_NO_LINEAR_ISSUE_TITLE_OR_DESCRIPTION = () =>
  `No Linear issue ID found in the PR title or description. Please include a Linear issue ID in the PR title using the format "[TEAM-123] My PR title", or include it anywhere in the PR description.`;
export const ERR_NO_VALID_COMMENTS = () =>
  `There were no comments in this PR that contained a valid Linear issue URL. This is likely either intentional or because you forgot to link this PR to a Linear issue. In order for this CI check to pass, you need to either link this PR to a Linear issue, or label your PR with the 'No Linear' label.`;
export const ERR_NO_SHORT_LINK = (description: string) =>
  `Description "${description}" did not contain a valid short link. Please include one like in the following examples: "[TEAM-123] My work description" or "[NOID] My work description".`;
export const ERR_UNEXPECTED = (error: any) => `Unexpected: ${error}`;
