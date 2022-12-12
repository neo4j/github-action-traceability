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

  core.info('Start GitHub event verification.');
  assertions.validateSupportedEvent(github);
  assertions.validateSupportedAction(github);

  core.info('Start global verification verification.');
  switch (inputs.getGlobalVerificationStrategy()) {
    case GlobalVerificationStrategy.CommitsAndPRTitle: {
      const commits = await github.getPullRequestCommitMessages();
      const commitShortLinks = commits.map(utils.extractShortLink.bind(utils));
      const title = github.getPullRequestTitle();
      const titleShortLinks = utils.extractShortLink(title);
      const shortLinks = [titleShortLinks, ...commitShortLinks];
      const trelloShortLinks = shortLinks.filter(
        (shortLink) => shortLink instanceof TrelloShortLink,
      );
      assertions.validateShortLinksStrategy(shortLinks);
      if (trelloShortLinks.length > 0) {
        await attachPullRequestToTrello(inputs, trello, github, trelloShortLinks[0]);
      }
      return;
    }
    case GlobalVerificationStrategy.Commits: {
      const commits = await github.getPullRequestCommitMessages();
      const shortLinks = commits.map(utils.extractShortLink.bind(utils));
      const trelloShortLinks = shortLinks.filter(
        (shortLink) => shortLink instanceof TrelloShortLink,
      );
      assertions.validateShortLinksStrategy(shortLinks);
      if (trelloShortLinks.length > 0) {
        await attachPullRequestToTrello(inputs, trello, github, trelloShortLinks[0]);
      }
      return;
    }
    case GlobalVerificationStrategy.Disabled:
      return;
  }

  core.info('Pull request validated successfully.');
};

export { run };
