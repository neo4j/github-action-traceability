import fetch from 'node-fetch';
import { RequestInit } from 'node-fetch';
import { TrelloAttachment, TrelloCard } from './types';
import { getTrelloApiKey, getTrelloApiToken } from './utils';

const buildApiUrl = (path: string, query?: URLSearchParams): string => {
  const params = query ? query : new URLSearchParams();
  const apiKey = getTrelloApiKey();
  const apiToken = getTrelloApiToken();

  if (!apiKey || !apiToken) {
    throw Error('Trello API key and/or token ID is missing.');
  }

  params.append('key', apiKey);
  params.append('token', apiToken);

  return `https://api.trello.com/1${path}?${params.toString()}`;
};

// https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/#authorizing-a-client
const apiBaseHeaders = (): object => {
  return {
    Accept: 'application/json',
    method: 'GET',
  };
};

// https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get
const getCard = (shortLink: string): Promise<TrelloCard> => {
  const path = `/cards/${shortLink}`;
  const options = { ...apiBaseHeaders() };

  return fetch(buildApiUrl(path), options as RequestInit)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
      }

      return (await response.json()) as unknown as TrelloCard;
    })
    .catch((error) => error);
};

// https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-get
const getCardAttachments = (shortLink: string): Promise<TrelloAttachment[]> => {
  const path = `/cards/${shortLink}/attachments`;
  const options = { ...apiBaseHeaders() };

  return fetch(buildApiUrl(path), options as RequestInit)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
      }

      return (await response.json()) as unknown as TrelloAttachment[];
    })
    .catch((error) => error);
};

// https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-post
const addUrlAttachmentToCard = (
  shortLink: string,
  attachmentUrl: string,
): Promise<TrelloAttachment> => {
  const path = `/cards/${shortLink}/attachments`;
  const options = {
    ...apiBaseHeaders(),
    method: 'POST',
  };
  const queryParams = new URLSearchParams();
  queryParams.append('url', attachmentUrl);

  return fetch(buildApiUrl(path, queryParams), options as RequestInit)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
      }

      return (await response.json()) as unknown as TrelloAttachment[];
    })
    .catch((error) => error);
};

export { getCard, getCardAttachments, addUrlAttachmentToCard };
