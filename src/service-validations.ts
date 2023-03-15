import {
  NoIdShortLink,
  ShortLink,
  TrelloCard,
  TrelloClientI,
  TrelloShortLink,
} from './client-trello';
import * as core from '@actions/core';
import { ERR_CLOSED_CARD, ERR_INVALID_NOID, ERR_NO_MATCHING_ATTACHMENT } from './errors';

class ValidationsService {
  trello: TrelloClientI;

  constructor(trello: TrelloClientI) {
    this.trello = trello;
  }

  async validateCommentContainsTrelloAttachment(
    shortLink: TrelloShortLink,
    commentUrl: string,
    pullRequestUrl: string,
  ): Promise<void> {
    const attachments = await this.trello.getCardAttachments(shortLink.id);
    const pullRequestAttachments = attachments.filter((attachment) =>
      attachment.url.startsWith(pullRequestUrl),
    );
    if (pullRequestAttachments.length === 0) {
      throw new Error(ERR_NO_MATCHING_ATTACHMENT(commentUrl, shortLink.id, pullRequestUrl));
    }
  }

  validateExclusivelyTrelloShortLinks(shortLinks: ShortLink[]): void {
    core.info('Verify short links only contain Trello short links.');
    shortLinks.forEach((shortLink) => {
      if (shortLink instanceof NoIdShortLink) {
        throw new Error(ERR_INVALID_NOID(shortLink.id));
      }
    });
  }

  validateCardOpen(card: TrelloCard): void {
    core.info('Verify Trello card is open.');
    if (card.closed) {
      throw new Error(ERR_CLOSED_CARD(card.shortLink));
    }
  }
}

export { ValidationsService };
