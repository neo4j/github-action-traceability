import { NoIdShortLink, ShortLink, TrelloCard, TrelloClientI } from './client-trello';
import * as core from '@actions/core';
import { ERR_CLOSED_CARD, ERR_INVALID_NOID } from './errors';

class ValidationsService {
  trello: TrelloClientI;

  constructor(trello: TrelloClientI) {
    this.trello = trello;
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
