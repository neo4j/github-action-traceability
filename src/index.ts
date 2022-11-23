import * as core from '@actions/core';

import { GithubClient, GithubClientI } from './client-github';
import {
  CommitVerificationStrategy,
  InputsClient,
  InputsClientI,
  TitleVerificationStrategy,
} from './client-inputs';
import { TrelloClient, TrelloClientI } from './client-trello';
import {
  assertAllShortLinksAreIdentical,
  assertCardNotClosed,
  assertNoIdShortLinkStrategy,
  assertSupportedAction,
  assertSupportedEvent,
  extractTrelloShortLink,
} from './utils';

const run = async (inputs: InputsClientI, github: GithubClientI, trello: TrelloClientI) => {
  assertSupportedEvent(github);
  assertSupportedAction(github);

  const pullRequestUrl = github.getPullRequestUrl();

  switch (inputs.getCommitVerificationStrategy()) {
    case CommitVerificationStrategy.ALL_COMMITS:
      const commitMessages = await github.getPullRequestCommitMessages();
      const commitMessageShortLinks = commitMessages.map(extractTrelloShortLink);
      assertAllShortLinksAreIdentical(commitMessageShortLinks);
      assertNoIdShortLinkStrategy(inputs.getNoIdVerificationStrategy(), commitMessageShortLinks);

      const shortLink = commitMessageShortLinks[0];
      const card = await trello.getCard(shortLink);
      assertCardNotClosed(card);

      const attachments = await trello.getCardAttachments(shortLink);
      if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
        core.info('Trello card already has an attachment for this pull request. Skipping');
      } else {
        await trello.addUrlAttachmentToCard(shortLink, pullRequestUrl);
      }
      return;
    case CommitVerificationStrategy.HEAD_COMMIT_ONLY:
      throw new Error('HEAD_COMMIT_ONLY implementation missing');
    case CommitVerificationStrategy.NEVER:
      core.info('Skipping commit verification strategy.');
  }

  switch (inputs.getTitleVerificationStrategy()) {
    case TitleVerificationStrategy.ALWAYS:
      const pullRequestTitle = github.getPullRequestTitle();
      const titleShortLink = extractTrelloShortLink(pullRequestTitle);
      assertNoIdShortLinkStrategy(inputs.getNoIdVerificationStrategy(), [titleShortLink]);

      const card = await trello.getCard(titleShortLink);
      assertCardNotClosed(card);

      const attachments = await trello.getCardAttachments(titleShortLink);
      if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
        core.info('Trello card already has an attachment for this pull request. Skipping');
      } else {
        await trello.addUrlAttachmentToCard(titleShortLink, pullRequestUrl);
      }
      return;
    case TitleVerificationStrategy.IF_EXISTS:
      throw new Error('IF_EXISTS implementation missing.');
    case TitleVerificationStrategy.NEVER:
      return;
  }
};

(async () => {
  const inputs = new InputsClient();
  const github = new GithubClient(inputs.getGitHubApiToken());
  const trello = new TrelloClient(inputs.getTrelloApiKey(), inputs.getGitHubApiToken());

  await run(inputs, github, trello);
})();

export { run };
