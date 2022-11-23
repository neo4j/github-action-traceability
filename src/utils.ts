import { InputsClient, NoIdVerificationStrategy } from './client-inputs';
import { TrelloCard } from './client-trello';
import { GithubClientI } from './client-github';

const assertSupportedEvent = (githubClient: GithubClientI): void => {
  if (githubClient.getContextEvent() !== 'pull_request')
    throw new Error(
      `Event ${githubClient.getContextEvent()} is unsupported. Only 'pull_request' events are supported.`,
    );
};

const assertSupportedAction = (githubClient: GithubClientI): void => {
  if (['opened', 'reopened', 'edited'].some((el) => el === githubClient.getContextAction()))
    throw new Error(
      `Action ${githubClient.getContextAction()} is unsupported. Only 'opened', 'reopened', 'edited' actions are supported.`,
    );
};

const extractTrelloShortLink = (commitMessage: string): string => {
  const REGEX_TRELLO_SHORT_LINK = new RegExp('^\\[([a-z0-9]+|NOID)\\].+');
  const match = REGEX_TRELLO_SHORT_LINK.exec(commitMessage);

  if (match === null)
    throw new Error(`Commit message ${commitMessage} does not contain a valid trello short link.`);

  return match[1];
};

const assertNoIdShortLinkStrategy = (
  strategy: NoIdVerificationStrategy,
  trelloShortLinks: string[],
): void => {
  const REGEX_TRELLO_NOID_CASE_INSENSITIVE = new RegExp('^\\[NOID\\]', 'i');
  const REGEX_TRELLO_NOID_UPPERCASE = new RegExp('^\\[NOID\\]');
  const REGEX_TRELLO_NOID_LOWERCASE = new RegExp('^\\[noid\\]');

  trelloShortLinks.forEach((trelloShortLink) => {
    switch (strategy) {
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

export {
  assertSupportedEvent,
  assertSupportedAction,
  assertCardNotClosed,
  assertAllShortLinksAreIdentical,
  assertNoIdShortLinkStrategy,
  extractTrelloShortLink,
};
