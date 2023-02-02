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

    it('throws when it cannot extract a short link because of missing brackets', () => {
      const inputs = new InputsClientBuilder().build();
      const service = new UtilsService(inputs);
      expect(() => service.extractShortLink('Foobar')).toThrow(
        'Description "Foobar" did not contain a valid short link. Please include one like in the ' +
          'following examples: "[abc123] My work description" or "[NOID] My work description".',
      );
    });

    it('throws when it cannot extract a short link because of special characters', () => {
      const inputs = new InputsClientBuilder().build();
      const service = new UtilsService(inputs);
      expect(() => service.extractShortLink('[abc-123] Foobar')).toThrow(
        'Description "[abc-123] Foobar" did not contain a valid short link. Please include one like in the ' +
          'following examples: "[abc123] My work description" or "[NOID] My work description".',
      );
    });
  });
});
