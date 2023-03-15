import { describe, it } from '@jest/globals';
import { TrelloClientBuilder } from './utils/dummy-client-trello';
import { ValidationsService } from '../src/service-validations';
import { NoIdShortLink, TrelloShortLink } from '../src/client-trello';
import { ERR_INVALID_NOID } from '../src/errors';

describe('ValidationsService', () => {
  const trello = new TrelloClientBuilder().build();
  const service = new ValidationsService(trello);

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
