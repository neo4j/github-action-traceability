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

class AssertionsService {
  inputs: InputsClientI;
  github: GitHubClientI;
  trello: TrelloClientI;

  constructor(inputs: InputsClientI, github: GitHubClientI, trello: TrelloClientI) {
    this.github = github;
    this.inputs = inputs;
    this.trello = trello;
  }

  validateSupportedEvent(githubClient: GitHubClientI): void {
    core.info('Verify Github event type.');
    if (githubClient.getContextEvent() !== 'pull_request')
      throw new Error(
        `GitHub event "${githubClient.getContextEvent()}" is unsupported. ` +
          'Only "pull_request" is supported.',
      );
  }

  validateSupportedAction(githubClient: GitHubClientI): void {
    core.info('Verify Github action type.');
    if (
      !['opened', 'reopened', 'edited', 'synchronize'].some(
        (el) => el === githubClient.getContextAction(),
      )
    )
      throw new Error(
        `GitHub action "${githubClient.getContextAction()}" is unsupported. Only "opened", "reopened", ` +
          '"edited", "synchronize" are supported.',
      );
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

  validateTrelloShortLinksAreIdentical(shortLinks: TrelloShortLink[]): void {
    core.info('Verify all Trello short links are identical.');
    if (shortLinks.length === 0) {
      return;
    }
    const head = shortLinks[0];
    shortLinks.forEach((shortLink) => {
      if (head.id !== shortLink.id) {
        throw new Error(
          `All Trello short links must be identical, but "${shortLink.id}" and "${shortLink.id}" ` +
            'were different.',
        );
      }
    });
  }

  validateShortLinksStrategy(shortLinks: ShortLink[]): void {
    core.info('Verify short link strategy.');
    const trelloShortLinks = shortLinks.filter((shortLink) => shortLink instanceof TrelloShortLink);

    switch (this.inputs.getShortLinkVerificationStrategy()) {
      case ShortLinkVerificationStrategy.Trello: {
        this.validateExclusivelyTrelloShortLinks(shortLinks);
        this.validateTrelloShortLinksAreIdentical(trelloShortLinks);
        return;
      }
      case ShortLinkVerificationStrategy.TrelloOrNoId: {
        this.validateTrelloShortLinksAreIdentical(trelloShortLinks);
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
