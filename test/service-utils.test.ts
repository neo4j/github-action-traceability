import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { NoIdShortLink, TrelloShortLink } from '../src/client-trello';
import { UtilsService } from '../src/service-utils';
import { ERR_NO_SHORT_LINK } from '../src/errors';

describe('UtilsService', () => {
  const inputs = new InputsClientBuilder().build();
  const service = new UtilsService(inputs);

  describe('.extractShortLink', () => {
    it('extracts a Trello short link', () => {
      expect(service.extractShortLink('[abc123] Foobar')).toEqual(new TrelloShortLink('abc123'));
    });

    it('extracts a NOID short link', () => {
      expect(service.extractShortLink('[NOID] Foobar')).toEqual(new NoIdShortLink('NOID'));
    });

    it('throws when it cannot extract a short link because of missing brackets', () => {
      expect(() => service.extractShortLink('Foobar')).toThrow(ERR_NO_SHORT_LINK('Foobar'));
    });

    it('throws when it cannot extract a short link because of special characters', () => {
      expect(() => service.extractShortLink('[abc-123] Foobar')).toThrow(
        ERR_NO_SHORT_LINK('[abc-123] Foobar'),
      );
    });
  });

  describe('.extractShortLinkFromComment', () => {
    describe('plain url', () => {
      it('does not parse comment that contains only a plain url in short form', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: 'https://trello.com/c/xwxZBfVu',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));
      });

      it('does not parse comment that contains only a plain url in long form', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: 'https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));
      });

      it('does not parse comment with a plain url along with other content', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: 'you can find more information at https://trello.com/c/xwxZBfVu',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));

        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: 'https://trello.com/c/xwxZBfVu where you can find more information',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));

        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: 'more information be found at https://trello.com/c/xwxZBfVu should you wish',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));
      });
    });

    describe('markdown url', () => {
      it('parses comment that contains only a markdown url in long form', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: '![](https://github.trello.services/images/mini-trello-icon.png) [Implement Traceability Proposal](https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal)',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new TrelloShortLink('YbW6f2xn'));
      });

      it('does not parse comment that contains only a markdown url in short form', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: '![](https://github.trello.services/images/mini-trello-icon.png) [Implement Traceability Proposal](https://trello.com/c/YbW6f2xn)',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));
      });

      it('does not parse comment with a markdown url along with other content', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: 'you can find more information at ![](https://github.trello.services/images/mini-trello-icon.png) [Implement Traceability Proposal](https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal)',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));

        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: '![](https://github.trello.services/images/mini-trello-icon.png) [Implement Traceability Proposal](https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal) where you can find more information',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));

        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: 'more information be found at ![](https://github.trello.services/images/mini-trello-icon.png) [Implement Traceability Proposal](https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal) should you wish',
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));
      });
    });

    describe('neonora url', () => {
      it('parses comment from neonora that contains a plain url', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: 'neonora',
            },
            body: "### :wave: Neo-Nora here. I'll update this comment when a release is made.\r\n\r\n\r\n----------\r\n<details open><summary>PRs linked to this through Cherry Picks have been attatched to the following Trello cards:</summary>\r\n\r\n![](https://github.trello.services/images/mini-trello-icon.png)[https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW)\r\n\r\n</details>\r\n\r\n\r\n----------\r\n:speaking_head: Report 🐞 or feature requests [here](https://trello.com/b/P5EyEhac/neonora).\r\nThis comment was last updated (Mon, 06 Mar 2023 13:34:10 GMT).",
            url: 'github.com/comments/123',
          }),
        ).toEqual(new TrelloShortLink('BnBwoWsW'));
      });

      it('does not parse comment that contains a plain url if the aura is not neonora', () => {
        expect(
          service.extractShortLinkFromComment({
            author: {
              login: '',
            },
            body: "### :wave: Neo-Nora here. I'll update this comment when a release is made.\r\n\r\n\r\n----------\r\n<details open><summary>PRs linked to this through Cherry Picks have been attatched to the following Trello cards:</summary>\r\n\r\n![](https://github.trello.services/images/mini-trello-icon.png)[https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW)\r\n\r\n</details>\r\n\r\n\r\n----------\r\n:speaking_head: Report 🐞 or feature requests [here](https://trello.com/b/P5EyEhac/neonora).\r\nThis comment was last updated (Mon, 06 Mar 2023 13:34:10 GMT).",
            url: 'github.com/comments/123',
          }),
        ).toEqual(new NoIdShortLink(''));
      });
    });
  });
});
