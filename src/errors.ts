export const ERR_CARD_GET_API = (status: number) => `Failed: GET Trello card returned ${status}`
export const ERR_CARD_NOT_FOUND = () => `Failed: unable to get Trello card.`
export const ERR_CARD_ATTACHMENT_GET_API = (status: number) => `Failed: GET Trello card attachments returned ${status}.`
export const ERR_CARD_ATTACHMENT_POST_API = (status: number) => `Failed: POST Trello card attachment returned ${status}`
export const ERR_CARD_ATTACHMENT_NOT_FOUND = () => `Failed: unable to get Trello card attachment.`
export const ERR_CLOSED_CARD = (shortLink: string) => `Failed: Trello card "${shortLink}" needs to be in an open state, but it is currently marked as closed.`
export const ERR_INVALID_NOID = (shortLinkId: string) => `Failed: unexpected NOID short link "${shortLinkId}". Only Trello short links are allowed in your project, please provide one in the form of "[a2bd4d] My change description".`
export const ERR_INVALID_INPUT = (setting: string, value: string) => `Failed: unrecognised value ${value} for "${setting}".`
export const ERR_NO_ATTACHMENT = (commentUrl: string, shortLink: string, prUrl: string, ) => `Failed: although the comment ${commentUrl} contained the link https://trello.com/c/${shortLink}, when checking the Trello card we could not find an attachment for pull request ${prUrl}. This can be a genuine user error on your behalf. However, this step can also sometimes fail when a comment in the pull request accidentally contains a naked Trello URL which isn't intended to be parsed as the traced Trello card. In such cases, please consider editing the comment so that it contains more than just a naked Trello link.`
export const ERR_NO_VALID_COMMENTS = () => `Failed: there were no comments in this PR that contained a valid Trello URL. This is likely either intentional or because you forgot to attach this PR a Trello card. In order for this CI check to pass, you need to either attach this PR to a Trello card, or to label your PR with the 'No Trello' label.`
export const ERR_NO_SHORT_LINK = (description: string) => `Failed: description "${description}" did not contain a valid short link. Please include one like in the following examples: "[abc123] My work description" or "[NOID] My work description".`

export const ERR_UNEXPECTED = (error: any) => `Failed: unexpected error ${error}`