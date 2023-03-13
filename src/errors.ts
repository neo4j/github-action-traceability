export const ERR_CARD_GET_API = (status: number) => `GET Trello card returned ${status}`;
export const ERR_CARD_NOT_FOUND = (shortLink: string) => `Unable to get Trello card ${shortLink}.`;
export const ERR_CARD_ATTACHMENT_GET_API = (status: number) =>
  `GET Trello card attachments returned ${status}.`;
export const ERR_CARD_ATTACHMENT_POST_API = (status: number) =>
  `POST Trello card attachment returned ${status}`;
export const ERR_CARD_ATTACHMENT_NOT_FOUND = (shortLink: string) =>
  `Unable to get attachment for Trello card ${shortLink}.`;
export const ERR_CLOSED_CARD = (shortLink: string) =>
  `Trello card "${shortLink}" needs to be in an open state, but it is currently marked as closed.`;
export const ERR_INVALID_NOID = (shortLinkId: string) =>
  `Unexpected NOID short link "${shortLinkId}". Only Trello short links are allowed in your project, please provide one in the form of "[a2bd4d] My change description".`;
export const ERR_INVALID_INPUT = (setting: string, value: string) =>
  `Unrecognised value ${value} for "${setting}".`;
export const ERR_NO_MATCHING_ATTACHMENT = (commentUrl: string, shortLink: string, prUrl: string) =>
  `Although the comment ${commentUrl} contained the link https://trello.com/c/${shortLink}, when checking the Trello card we could not find an attachment for pull request ${prUrl}. This can be due to a genuine user error on your behalf, if so then please attach ${prUrl} to https://trello.com/c/${shortLink}. In rarer cases, this step may also fail when a comment in a pull request accidentally matches one of the job's regex patterns, if so then please consider updating the offending comment (or adding the 'No Trello' PR label).`;
export const ERR_NO_VALID_COMMENTS = () =>
  `There were no comments in this PR that contained a valid Trello URL. This is likely either intentional or because you forgot to attach this PR to a Trello card. In order for this CI check to pass, you need to either attach this PR to a Trello card, or to label your PR with the 'No Trello' label.`;
export const ERR_NO_SHORT_LINK = (description: string) =>
  `Description "${description}" did not contain a valid short link. Please include one like in the following examples: "[abc123] My work description" or "[NOID] My work description".`;
export const ERR_UNEXPECTED = (error: any) => `Unexpected: ${error}`;
