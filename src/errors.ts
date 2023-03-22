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
export const ERR_INPUT_NOT_FOUND = (input: string) => `Input not found "${input}".`;
export const ERR_INPUT_INVALID = (input: string, value: string) =>
  `Unrecognised value ${value} for input "${input}".`;
export const ERR_NO_VALID_COMMENTS = () =>
  `There were no comments in this PR that contained a valid Trello URL. This is likely either intentional or because you forgot to attach this PR to a Trello card. In order for this CI check to pass, you need to either attach this PR to a Trello card, or to label your PR with the 'No Trello' label.`;
export const ERR_NO_SHORT_LINK = (description: string) =>
  `Description "${description}" did not contain a valid short link. Please include one like in the following examples: "[abc123] My work description" or "[NOID] My work description".`;
export const ERR_UNEXPECTED = (error: any) => `Unexpected: ${error}`;
