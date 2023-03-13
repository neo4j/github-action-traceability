import { InputsClientI, ShortLinkVerificationStrategy } from './client-inputs';
import {
  NoIdShortLink,
  ShortLink,
  TrelloCard,
  TrelloClientI,
  TrelloShortLink,
} from './client-trello';
import { GitHubClientI } from './client-github';
import * as core from '@actions/core';
import {ERR_CLOSED_CARD, ERR_INVALID_NOID, ERR_NO_ATTACHMENT} from "./errors";

class ValidationsService {
  inputs: InputsClientI;
  github: GitHubClientI;
  trello: TrelloClientI;

  constructor(inputs: InputsClientI, github: GitHubClientI, trello: TrelloClientI) {
    this.github = github;
    this.inputs = inputs;
    this.trello = trello;
  }

  async validateCommentContainsTrelloAttachment(
    shortLink: TrelloShortLink,
    commentUrl: string,
    pullRequestUrl: string,
  ): Promise<void> {
    const attachments = await this.trello.getCardAttachments(shortLink.id);
    const hasAttachment = !!attachments.filter((attachment) =>
      attachment.url.startsWith(pullRequestUrl),
    );
    if (hasAttachment) {
      throw new Error(ERR_NO_ATTACHMENT(commentUrl, shortLink.id, pullRequestUrl));
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

  validateShortLinksStrategy(shortLinks: ShortLink[]): void {
    core.info('Verify short link strategy.');

    switch (this.inputs.getShortLinkVerificationStrategy()) {
      case ShortLinkVerificationStrategy.Trello: {
        this.validateExclusivelyTrelloShortLinks(shortLinks);
        return;
      }
      case ShortLinkVerificationStrategy.TrelloOrNoId: {
        return;
      }
    }
  }

  validateCardOpen(card: TrelloCard): void {
    core.info('Verify Trello card is open.');
    if (card.closed) {
      throw new Error(ERR_CLOSED_CARD(card.shortLink));
    }
  }
}

export { ValidationsService };
