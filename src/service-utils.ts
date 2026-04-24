import * as core from '@actions/core';
import { InputsClientI } from './client-inputs';
import { NoIdShortLink, ShortLink, LinearIssueLink } from './client-trello';
import { Comment } from './client-github';
import { ERR_NO_SHORT_LINK } from './errors';

class UtilsService {
  inputs: InputsClientI;

  constructor(inputs: InputsClientI) {
    this.inputs = inputs;
  }

  private extractLinearIssueLink(description: string): LinearIssueLink | void {
    const pattern = new RegExp(`^\\[([A-Z]+-[0-9]+)\\].+`);
    const match = pattern.exec(description);
    if (match !== null) {
      return new LinearIssueLink(match[1]);
    }
  }

  private extractNoIdShortLink(description: string): NoIdShortLink | void {
    const pattern = new RegExp(`^\\[(NOID)\\].+`);
    const match = pattern.exec(description);
    if (match !== null) {
      return new NoIdShortLink(match[1]);
    }
  }

  extractShortLink(description: string): ShortLink {
    core.info(`Extracting potential short links from "${description}".`);
    const noIdShortLink = this.extractNoIdShortLink(description);
    const linearIssueLink = this.extractLinearIssueLink(description);

    if (noIdShortLink) {
      return noIdShortLink;
    } else if (linearIssueLink) {
      return linearIssueLink;
    } else {
      throw new Error(ERR_NO_SHORT_LINK(description));
    }
  }

  extractShortLinkFromComment(comment: Comment): ShortLink {
    core.info(`Extracting potential short link from comment ${comment.url}.`);

    const linearUrlPattern = new RegExp(`https://linear\\.app/[^/]+/issue/([A-Z]+-[0-9]+)`);
    const match = linearUrlPattern.exec(comment.body);
    return match ? new LinearIssueLink(match[1]) : new NoIdShortLink('');
  }
}

export { UtilsService };
