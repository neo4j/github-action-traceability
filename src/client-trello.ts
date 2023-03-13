import * as core from '@actions/core';

import fetch, { RequestInit } from 'node-fetch';
import {
  ERR_CARD_ATTACHMENT_GET_API,
  ERR_CARD_ATTACHMENT_NOT_FOUND,
  ERR_CARD_ATTACHMENT_POST_API,
  ERR_CARD_GET_API,
  ERR_CARD_NOT_FOUND,
} from './errors';

class ShortLink {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

class NoIdShortLink extends ShortLink {
  constructor(id: string) {
    super(id);
  }
}

class TrelloShortLink extends ShortLink {
  constructor(id: string) {
    super(id);
  }
}

interface TrelloCard {
  shortLink: string;
  closed: boolean;
}

interface TrelloAttachment {
  shortLink: string;
  url: string;
}

interface TrelloClientI {
  getCard(shortLink: string): Promise<TrelloCard>;
  getCardAttachments(shortLink: string): Promise<TrelloAttachment[]>;
  addUrlAttachmentToCard(shortLink: string, urlAttachment: string): Promise<TrelloAttachment>;
}

class TrelloClient implements TrelloClientI {
  apiKey: string;
  apiToken: string;
  apiBaseHeaders: object;

  constructor(apiKey: string, apiToken: string) {
    this.apiKey = apiKey;
    this.apiToken = apiToken;
    this.apiBaseHeaders = {
      Accept: 'application/json',
      method: 'GET',
    };
  }

  // https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/#authorizing-a-client
  private buildApiUrl(path: string, query?: URLSearchParams): string {
    const params = query ? query : new URLSearchParams();

    params.append('key', this.apiKey);
    params.append('token', this.apiToken);

    return `https://api.trello.com/1${path}?${params.toString()}`;
  }

  // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get
  async getCard(shortLink: string): Promise<TrelloCard> {
    core.info('Get Trello card.');
    const path = `/cards/${shortLink}`;
    const options = { ...this.apiBaseHeaders };

    return fetch(this.buildApiUrl(path), options as RequestInit)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(ERR_CARD_GET_API(response.status));
        }
        return (await response.json()) as unknown as TrelloCard;
      })
      .catch(() => {
        throw new Error(ERR_CARD_NOT_FOUND(shortLink));
      });
  }

  // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-get
  async getCardAttachments(shortLink: string): Promise<TrelloAttachment[]> {
    core.info('Get Trello card attachments.');
    const path = `/cards/${shortLink}/attachments`;
    const options = { ...this.apiBaseHeaders };

    return fetch(this.buildApiUrl(path), options as RequestInit)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(ERR_CARD_ATTACHMENT_GET_API(response.status));
        }
        return (await response.json()) as unknown as TrelloAttachment[];
      })
      .catch(() => {
        throw new Error(ERR_CARD_ATTACHMENT_NOT_FOUND(shortLink));
      });
  }

  // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-post
  async addUrlAttachmentToCard(
    shortLink: string,
    attachmentUrl: string,
  ): Promise<TrelloAttachment> {
    core.info('Add attachment to Trello card.');
    const path = `/cards/${shortLink}/attachments`;
    const options = {
      ...this.apiBaseHeaders,
      method: 'POST',
    };
    const queryParams = new URLSearchParams();
    queryParams.append('url', attachmentUrl);

    return fetch(this.buildApiUrl(path, queryParams), options as RequestInit)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(ERR_CARD_ATTACHMENT_POST_API(response.status));
        }

        return (await response.json()) as unknown as TrelloAttachment[];
      })
      .catch((error) => error);
  }
}

export {
  ShortLink,
  NoIdShortLink,
  TrelloShortLink,
  TrelloCard,
  TrelloAttachment,
  TrelloClient,
  TrelloClientI,
};
