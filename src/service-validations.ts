import { NoIdShortLink, ShortLink } from './client-trello';
import * as core from '@actions/core';
import { ERR_INVALID_NOID } from './errors';

class ValidationsService {
  validateExclusivelyLinearIssueLinks(shortLinks: ShortLink[]): void {
    core.info('Verify short links only contain Linear issue links.');
    shortLinks.forEach((shortLink) => {
      if (shortLink instanceof NoIdShortLink) {
        throw new Error(ERR_INVALID_NOID(shortLink.id));
      }
    });
  }
}

export { ValidationsService };
