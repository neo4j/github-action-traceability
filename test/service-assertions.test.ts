import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './dummy-client-inputs';
import { GitHubClientBuilder } from './dummy-client-github';
import { TrelloClientBuilder } from './dummy-client-trello';
import { AssertionsService } from '../src/service-assertions';
import { NoIdShortLink, TrelloShortLink } from '../src/client-trello';

describe('AssertionService', () => {
  describe('.validateExclusivelyTrelloShortLinks', () => {
    it('succeeds if there are no short links', () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder().build();
      const trello = new TrelloClientBuilder().build();
      const service = new AssertionsService(inputs, github, trello);
      expect(() => service.validateExclusivelyTrelloShortLinks([])).not.toThrow();
    });

    it('succeeds if there are only Trello short links', () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder().build();
      const trello = new TrelloClientBuilder().build();
      const service = new AssertionsService(inputs, github, trello);
      expect(() =>
        service.validateExclusivelyTrelloShortLinks([
          new TrelloShortLink('abc123'),
          new TrelloShortLink('def345'),
        ]),
      ).not.toThrow();
    });

    it('fails if there are any NOID short links', () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder().build();
      const trello = new TrelloClientBuilder().build();
      const service = new AssertionsService(inputs, github, trello);
      expect(() =>
        service.validateExclusivelyTrelloShortLinks([
          new TrelloShortLink('abc123'),
          new NoIdShortLink('NOID'),
        ]),
      ).toThrow(
        'Unexpected NOID short link "NOID". Only Trello short links are allowed in your project, ' +
          'please provide one in the form of "[a2bd4d] My change description".',
      );
    });
  });

  describe('.validateTrelloShortLinksAreIdentical', () => {
    it('succeeds if there are no Trello short links', () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder().build();
      const trello = new TrelloClientBuilder().build();
      const service = new AssertionsService(inputs, github, trello);
      expect(() => service.validateTrelloShortLinksAreIdentical([])).not.toThrow();
    });

    it('succeeds if all Trello short links are the same', () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder().build();
      const trello = new TrelloClientBuilder().build();
      const service = new AssertionsService(inputs, github, trello);
      expect(() =>
        service.validateTrelloShortLinksAreIdentical([
          new TrelloShortLink('abc123'),
          new TrelloShortLink('abc123'),
        ]),
      ).not.toThrow();
    });

    it('throws if some Trello short links are different', () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder().build();
      const trello = new TrelloClientBuilder().build();
      const service = new AssertionsService(inputs, github, trello);
      expect(() =>
        service.validateTrelloShortLinksAreIdentical([
          new TrelloShortLink('abc123'),
          new TrelloShortLink('abc123'),
          new TrelloShortLink('def345'),
        ]),
      ).toThrow(
        'All Trello short links must be identical, but "def345" and "abc123" were different.',
      );
    });
  });
});
