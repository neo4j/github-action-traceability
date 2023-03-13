import * as core from '@actions/core';

import { GitHubClientI } from './client-github';
import { GlobalVerificationStrategy, InputsClientI } from './client-inputs';
import { ValidationsService } from './service-validations';
import { TrelloClientI, TrelloShortLink } from './client-trello';
import { UtilsService } from './service-utils';
import {ERR_NO_VALID_COMMENTS} from "./errors";

const run = async (inputs: InputsClientI, github: GitHubClientI, trello: TrelloClientI) => {
  const validations = new ValidationsService(inputs, github, trello);
  const utils = new UtilsService(inputs);
  const pullRequest = await github.getPullRequest(
    inputs.getPullRequestNumber(),
    inputs.getGithubRepositoryOwner(),
    inputs.getGitHubRepositoryName(),
  );

  core.info('Start global verification strategy.');
  switch (inputs.getGlobalVerificationStrategy()) {
    case GlobalVerificationStrategy.CommitsAndPRTitle: {
      const titleShortLinks = utils.extractShortLink(pullRequest.title);
      const commitShortLinks = pullRequest.commits
        .map((c) => c.commit.message)
        .map(utils.extractShortLink.bind(utils));
      const shortLinks = [...new Set([titleShortLinks, ...commitShortLinks])];
      validations.validateShortLinksStrategy(shortLinks);
      for (const shortLink of shortLinks) {
        if (shortLink instanceof TrelloShortLink) {
          await utils.attachPullRequestToTrello(inputs, trello, github, pullRequest, shortLink);
        }
      }
      break;
    }
    case GlobalVerificationStrategy.Commits: {
      const commitMessages = pullRequest.commits.map((c) => c.commit.message);
      const shortLinks = [...new Set(commitMessages.map(utils.extractShortLink.bind(utils)))];
      validations.validateShortLinksStrategy(shortLinks);
      for (const shortLink of shortLinks) {
        if (shortLink instanceof TrelloShortLink) {
          await utils.attachPullRequestToTrello(inputs, trello, github, pullRequest, shortLink);
        }
      }
      break;
    }
    case GlobalVerificationStrategy.Comments: {
      const noIdLabels = pullRequest.labels.filter((l) => l.name === 'No Trello')
      if (noIdLabels.length > 0) return;

      const shortLinks = pullRequest.comments.map((comment) => ({
        comment,
        shortLink: utils.extractShortLinkFromComment(comment),
      }));
      const trelloShortLinks = shortLinks.filter((sl) => sl.comment instanceof TrelloShortLink);
      if (trelloShortLinks.length === 0) {
        throw new Error(ERR_NO_VALID_COMMENTS());
      }

      trelloShortLinks.map(
        async (sl) =>
          await validations.validateCommentContainsTrelloAttachment(
            sl.shortLink,
            sl.comment.url,
            pullRequest.url,
          ),
      );
      break;
    }
    case GlobalVerificationStrategy.Disabled:
      break;
  }

  core.info('Pull request validated successfully.');
};

export { run };
