import { InputsClientI, ShortLinkVerificationStrategy } from './client-inputs';
import { NoIdShortLink, ShortLink, TrelloCard, TrelloClientI } from './client-trello';
import { GitHubClientI } from './client-github';
import * as core from '@actions/core';

class AssertionsService {
  inputs: InputsClientI;
  github: GitHubClientI;
  trello: TrelloClientI;

  constructor(inputs: InputsClientI, github: GitHubClientI, trello: TrelloClientI) {
    this.github = github;
    this.inputs = inputs;
    this.trello = trello;
  }

  validateExclusivelyTrelloShortLinks(shortLinks: ShortLink[]): void {
    core.info('Verify short links only contain Trello short links.');
    shortLinks.forEach((shortLink) => {
      if (shortLink instanceof NoIdShortLink) {
        throw new Error(
          `Unexpected NOID short link "${shortLink.id}". Only Trello short links are allowed in your ` +
            'project, please provide one in the form of "[a2bd4d] My change description".',
        );
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
      throw new Error(
        `Trello card "${card.shortLink}" needs to be in an open state, ` +
          'but it is currently marked as closed.',
      );
    }
  }
}

export { AssertionsService };
