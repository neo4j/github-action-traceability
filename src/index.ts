import * as core from '@actions/core';

import {
  getContextAction,
  getContextEvent,
  getPullRequestCommitMessages,
  getPullRequestTitle,
  getPullRequestUrl,
  getSupportedActions,
  getSupportedEvent,
  isSupportedAction,
  isSupportedEvent,
} from './api-github';

import {
  getCommitVerificationStrategy,
  getNoIdVerificationStrategy,
  getTitleVerificationStrategy,
  REGEX_TRELLO_NOID_CASE_INSENSITIVE,
  REGEX_TRELLO_NOID_LOWERCASE,
  REGEX_TRELLO_NOID_UPPERCASE,
  REGEX_TRELLO_SHORT_LINK,
} from './utils';

import {
  CommitVerificationStrategy,
  NoIdVerificationStrategy,
  TitleVerificationStrategy,
  TrelloCard,
} from './types';

import { addUrlAttachmentToCard, getCard, getCardAttachments } from './api-trello';

const getTrelloShortLink = (commitMessage: string): string => {
  const match = REGEX_TRELLO_SHORT_LINK.exec(commitMessage);

  if (match === null)
    throw new Error(`Commit message ${commitMessage} does not contain a valid trello short link.`);

  return match[1];
};

const assertNoIdShortLinkStrategy = (trelloShortLinks: string[]): void => {
  trelloShortLinks.forEach((trelloShortLink) => {
    switch (getNoIdVerificationStrategy()) {
      case NoIdVerificationStrategy.CASE_INSENSITIVE:
        return;
      case NoIdVerificationStrategy.UPPER_CASE:
        if (
          REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
          !REGEX_TRELLO_NOID_UPPERCASE.test(trelloShortLink)
        ) {
          throw new Error(`NOID short link needed to be upper case but was ${trelloShortLink}`);
        }
        return;
      case NoIdVerificationStrategy.LOWER_CASE:
        if (
          REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
          !REGEX_TRELLO_NOID_LOWERCASE.test(trelloShortLink)
        ) {
          throw new Error(`NOID short link needed to be lower case but was ${trelloShortLink}`);
        }
        return;
      case NoIdVerificationStrategy.NEVER:
        if (REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink)) {
          throw new Error(`NOID short link is not allowed.`);
        }
        return;
    }
  });
};

const assertAllShortLinksAreIdentical = (shortLinks: string[]): void => {
  if (shortLinks.length === 0) return;

  const head = shortLinks[0];
  shortLinks.forEach((shortLink) => {
    if (shortLink !== head) {
      throw new Error('');
    }
  });
};

const assertCardNotClosed = (card: TrelloCard): void => {
  if (card.closed) throw new Error(`Expected card ${card.shortUrl} to not be closed.`);
};

(async () => {
  if (!isSupportedEvent()) {
    throw new Error(
      `Event ${getContextEvent()} is unsupported. Only ${getSupportedEvent()} events are supported.`,
    );
  }

  if (!isSupportedAction()) {
    core.info(
      `Action ${getContextAction()} is unsupported. Only ${getSupportedActions()} actions are supported. Skipping.`,
    );
    return;
  }

  const pullRequestUrl = getPullRequestUrl();

  switch (getCommitVerificationStrategy()) {
    case CommitVerificationStrategy.ALL_COMMITS:
      const commitMessages = await getPullRequestCommitMessages();
      const commitMessageShortLinks = commitMessages.map(getTrelloShortLink);
      assertAllShortLinksAreIdentical(commitMessageShortLinks);
      assertNoIdShortLinkStrategy(commitMessageShortLinks);

      const shortLink = commitMessageShortLinks[0];
      const card = await getCard(shortLink);
      assertCardNotClosed(card);

      const attachments = await getCardAttachments(shortLink);
      if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
        core.info('Trello card already has an attachment for this pull request. Skipping');
      } else {
        await addUrlAttachmentToCard(shortLink, pullRequestUrl);
      }
      return;
    case CommitVerificationStrategy.HEAD_COMMIT_ONLY:
      throw new Error('HEAD_COMMIT_ONLY implementation missing');
    case CommitVerificationStrategy.NEVER:
      core.info('Skipping commit verification strategy.');
  }

  switch (getTitleVerificationStrategy()) {
    case TitleVerificationStrategy.ALWAYS:
      const pullRequestTitle = getPullRequestTitle();
      const titleShortLink = getTrelloShortLink(pullRequestTitle);
      assertNoIdShortLinkStrategy([titleShortLink]);

      const card = await getCard(titleShortLink);
      assertCardNotClosed(card);

      const attachments = await getCardAttachments(titleShortLink);
      if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
        core.info('Trello card already has an attachment for this pull request. Skipping');
      } else {
        await addUrlAttachmentToCard(titleShortLink, pullRequestUrl);
      }
      return;
    case TitleVerificationStrategy.IF_EXISTS:
      throw new Error('IF_EXISTS implementation missing.');
    case TitleVerificationStrategy.NEVER:
      return;
  }
})();
