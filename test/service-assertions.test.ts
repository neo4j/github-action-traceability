import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { TrelloClientBuilder } from './utils/dummy-client-trello';
import { ValidationsService } from '../src/service-validations';
import { NoIdShortLink, TrelloShortLink } from '../src/client-trello';
import { ERR_INVALID_NOID } from '../src/errors';

describe('ValidationsService', () => {
  const inputs = new InputsClientBuilder().build();
  const github = new GitHubClientBuilder().build();
  const trello = new TrelloClientBuilder().build();
  const service = new ValidationsService(inputs, github, trello);

  describe('.validateExclusivelyTrelloShortLinks', () => {
    it('succeeds if there are no short links', () => {
      expect(() => service.validateExclusivelyTrelloShortLinks([])).not.toThrow();
    });

    it('succeeds if there are only Trello short links', () => {
      expect(() =>
        service.validateExclusivelyTrelloShortLinks([
          new TrelloShortLink('abc123'),
          new TrelloShortLink('def345'),
        ]),
      ).not.toThrow();
    });

    it('fails if there are any NOID short links', () => {
      expect(() =>
        service.validateExclusivelyTrelloShortLinks([
          new TrelloShortLink('abc123'),
          new NoIdShortLink('NOID'),
        ]),
      ).toThrow(ERR_INVALID_NOID('NOID'));
    });
  });
});
