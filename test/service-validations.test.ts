import { describe, it } from '@jest/globals';
import { ValidationsService } from '../src/service-validations';
import { NoIdShortLink, LinearIssueLink } from '../src/client-trello';
import { ERR_INVALID_NOID } from '../src/errors';

describe('ValidationsService', () => {
  const service = new ValidationsService();

  describe('.validateExclusivelyLinearIssueLinks', () => {
    it('succeeds if there are no short links', () => {
      expect(() => service.validateExclusivelyLinearIssueLinks([])).not.toThrow();
    });

    it('succeeds if there are only Linear issue links', () => {
      expect(() =>
        service.validateExclusivelyLinearIssueLinks([
          new LinearIssueLink('NEO-123'),
          new LinearIssueLink('ENG-456'),
        ]),
      ).not.toThrow();
    });

    it('fails if there are any NOID short links', () => {
      expect(() =>
        service.validateExclusivelyLinearIssueLinks([
          new LinearIssueLink('NEO-123'),
          new NoIdShortLink('NOID'),
        ]),
      ).toThrow(ERR_INVALID_NOID('NOID'));
    });
  });
});
