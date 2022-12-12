import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './dummy-client-inputs';
import { NoIdShortLink, TrelloShortLink } from '../src/client-trello';
import { UtilsService } from '../src/service-utils';

describe('UtilsService', () => {
  describe('.extractShortLink', () => {
    it('extracts a Trello short link', () => {
      const inputs = new InputsClientBuilder().build();
      const service = new UtilsService(inputs);
      expect(service.extractShortLink('[abc123] Foobar')).toEqual(new TrelloShortLink('abc123'));
    });

    it('extracts a NOID short link', () => {
      const inputs = new InputsClientBuilder().build();
      const service = new UtilsService(inputs);
      expect(service.extractShortLink('[NOID] Foobar')).toEqual(new NoIdShortLink('NOID'));
    });

    it('extracts a NOID short link with a custom pattern', () => {
      const inputs = new InputsClientBuilder().withNoIdShortLinkPattern('\\[(NULL)\\]').build();
      const service = new UtilsService(inputs);
      expect(service.extractShortLink('[NULL] Foobar')).toEqual(new NoIdShortLink('NULL'));
    });

    it('throws when it cannot extract a short link', () => {
      const inputs = new InputsClientBuilder().build();
      const service = new UtilsService(inputs);
      expect(() => service.extractShortLink('Foobar')).toThrow(
        'Description "Foobar" did not contain a valid short link. Please include one like in the ' +
          'following examples: "[abc123] My work description" or "[NOID] My work description".',
      );
    });
  });
});
