import * as core from '@actions/core';
import { InputsClientI } from './client-inputs';
import { NoIdShortLink, ShortLink, TrelloShortLink } from './client-trello';

class UtilsService {
  inputs: InputsClientI;

  constructor(inputs: InputsClientI) {
    this.inputs = inputs;
  }

  private extractTrelloShortLink(description: string): TrelloShortLink | void {
    const pattern = new RegExp(`^\\[([a-zA-Z0-9]+)\\].+`);
    const match = pattern.exec(description);
    if (match !== null) {
      return new TrelloShortLink(match[1]);
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
    core.info(`Extracting short links from "${description}".`);
    const noIdShortLink = this.extractNoIdShortLink(description);
    const trelloShortLink = this.extractTrelloShortLink(description);

    if (noIdShortLink) {
      return noIdShortLink;
    } else if (trelloShortLink) {
      return trelloShortLink;
    } else {
      throw new Error(
        `Description "${description}" did not contain a valid short link. Please include one ` +
          'like in the following examples: "[abc123] My work description" or "[NOID] My work description".',
      );
    }
  }
}

export { UtilsService };
