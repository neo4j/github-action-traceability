import * as core from '@actions/core';

import { GitHubClientI } from './client-github';
import { GlobalVerificationStrategy, InputsClientI } from './client-inputs';
import { AssertionsService } from './service-assertions';
import { TrelloClientI, TrelloShortLink } from './client-trello';
import { UtilsService } from './service-utils';

const attachPullRequestToTrello = async (
  inputs: InputsClientI,
  trello: TrelloClientI,
  github: GitHubClientI,
  trelloShortLink: TrelloShortLink,
): Promise<void> => {
  core.info('Start attaching pull request to Trello card.');
  const assertions = new AssertionsService(inputs, github, trello);
  const url = github.getPullRequestUrl();
  const card = await trello.getCard(trelloShortLink.id);
  assertions.validateCardOpen(card);

  const attachments = await trello.getCardAttachments(trelloShortLink.id);
  if (attachments.find((attachment) => attachment.url === url)) {
    core.info('Trello card already has an attachment for this pull request. Skipping.');
  } else {
    await trello.addUrlAttachmentToCard(trelloShortLink.id, url);
  }
  return;
};

const run = async (inputs: InputsClientI, github: GitHubClientI, trello: TrelloClientI) => {
  const assertions = new AssertionsService(inputs, github, trello);
  const utils = new UtilsService(inputs);

  core.info('Start global verification strategy.');
  switch (inputs.getGlobalVerificationStrategy()) {
    case GlobalVerificationStrategy.CommitsAndPRTitle: {
      const title = github.getPullRequestTitle();
      const titleShortLinks = utils.extractShortLink(title);
      const commits = await github.getPullRequestCommits();
      const commitShortLinks = commits
        .map((c) => c.commit.message)
        .map(utils.extractShortLink.bind(utils));
      const shortLinks = [...new Set([titleShortLinks, ...commitShortLinks])];
      assertions.validateShortLinksStrategy(shortLinks);
      for (const shortLink of shortLinks) {
        if (shortLink instanceof TrelloShortLink) {
          await attachPullRequestToTrello(inputs, trello, github, shortLink);
        }
      }
      return;
    }
    case GlobalVerificationStrategy.Commits: {
      console.log(JSON.stringify({ comments: await github.getPullRequestComments() }, null, 2)); // daniel
      const commits = await github.getPullRequestCommits();
      const shortLinks = [
        ...new Set(commits.map((c) => c.commit.message).map(utils.extractShortLink.bind(utils))),
      ];
      assertions.validateShortLinksStrategy(shortLinks);
      for (const shortLink of shortLinks) {
        if (shortLink instanceof TrelloShortLink) {
          await attachPullRequestToTrello(inputs, trello, github, shortLink);
        }
      }
      return;
    }
    case GlobalVerificationStrategy.Disabled:
      return;
  }

  core.info('Pull request validated successfully.');
};

export { run };
