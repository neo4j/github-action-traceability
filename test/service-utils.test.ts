import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { NoIdShortLink, LinearIssueLink } from '../src/client-trello';
import { UtilsService } from '../src/service-utils';
import { ERR_NO_SHORT_LINK } from '../src/errors';

describe('UtilsService', () => {
  const inputs = new InputsClientBuilder().build();
  const service = new UtilsService(inputs);

  describe('.extractShortLink', () => {
    it('extracts a Linear issue link', () => {
      expect(service.extractShortLink('[NEO-123] Foobar')).toEqual(new LinearIssueLink('NEO-123'));
    });

    it('extracts a NOID short link', () => {
      expect(service.extractShortLink('[NOID] Foobar')).toEqual(new NoIdShortLink('NOID'));
    });

    it('throws when it cannot extract a short link because of missing brackets', () => {
      expect(() => service.extractShortLink('Foobar')).toThrow(ERR_NO_SHORT_LINK('Foobar'));
    });

    it('throws when it cannot extract a short link because of lowercase letters', () => {
      expect(() => service.extractShortLink('[neo-123] Foobar')).toThrow(
        ERR_NO_SHORT_LINK('[neo-123] Foobar'),
      );
    });

    it('throws when it cannot extract a short link because of missing number', () => {
      expect(() => service.extractShortLink('[NEO-] Foobar')).toThrow(
        ERR_NO_SHORT_LINK('[NEO-] Foobar'),
      );
    });
  });

  describe('.extractShortLinkFromComment', () => {
    it('does not parse comment that contains no Linear URL', () => {
      expect(
        service.extractShortLinkFromComment({
          author: { login: '' },
          body: 'Some regular comment text',
          url: 'github.com/comments/123',
        }),
      ).toEqual(new NoIdShortLink(''));
    });

    it('parses comment that contains a Linear issue URL', () => {
      expect(
        service.extractShortLinkFromComment({
          author: { login: '' },
          body: 'https://linear.app/neo4j/issue/NEO-123/my-linear-issue',
          url: 'github.com/comments/123',
        }),
      ).toEqual(new LinearIssueLink('NEO-123'));
    });

    it('parses comment that contains a Linear URL along with other content', () => {
      expect(
        service.extractShortLinkFromComment({
          author: { login: '' },
          body: 'Linked to https://linear.app/neo4j/issue/NEO-456/some-issue for context',
          url: 'github.com/comments/123',
        }),
      ).toEqual(new LinearIssueLink('NEO-456'));
    });

    it('does not parse comment that contains a non-issue Linear URL', () => {
      expect(
        service.extractShortLinkFromComment({
          author: { login: '' },
          body: 'https://linear.app/neo4j/team/NEO',
          url: 'github.com/comments/123',
        }),
      ).toEqual(new NoIdShortLink(''));
    });
  });
});
