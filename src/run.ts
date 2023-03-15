import * as core from '@actions/core';

import { GitHubClientI } from './client-github';
import { GlobalVerificationStrategy, InputsClientI } from './client-inputs';
import { ValidationsService } from './service-validations';
import { TrelloClientI, TrelloShortLink } from './client-trello';
import { UtilsService } from './service-utils';
import { ERR_NO_VALID_COMMENTS } from './errors';

const run = async (inputs: InputsClientI, github: GitHubClientI, trello: TrelloClientI) => {
  const validations = new ValidationsService(trello);
  const utils = new UtilsService(inputs);

  switch (inputs.getGlobalVerificationStrategy()) {
    case GlobalVerificationStrategy.Title: {
      const pullRequest = await github.getPullRequest(
        inputs.getPullRequestNumber(),
        inputs.getGithubRepositoryOwner(),
        inputs.getGitHubRepositoryName(),
      );
      const shortLink = utils.extractShortLink(pullRequest.title);
      if (shortLink instanceof TrelloShortLink) {
        await utils.attachPullRequestToTrello(inputs, trello, github, pullRequest, shortLink);
      }
      break;
    }
    case GlobalVerificationStrategy.Commits: {
      const pullRequest = await github.getPullRequest(
        inputs.getPullRequestNumber(),
        inputs.getGithubRepositoryOwner(),
        inputs.getGitHubRepositoryName(),
      );
      const commitMessages = pullRequest.commits.map((c) => c.commit.message);
      const shortLinks = [...new Set(commitMessages.map(utils.extractShortLink.bind(utils)))];

      await Promise.all(
        shortLinks.map(async (shortLink) => {
          if (shortLink instanceof TrelloShortLink) {
            await utils.attachPullRequestToTrello(inputs, trello, github, pullRequest, shortLink);
          }
        }),
      );
      break;
    }
    case GlobalVerificationStrategy.Comments: {
      const pullRequest = await github.getPullRequest(
        inputs.getPullRequestNumber(),
        inputs.getGithubRepositoryOwner(),
        inputs.getGitHubRepositoryName(),
      );
      const noIdLabels = pullRequest.labels.filter((l) => l.name === 'No Trello');
      if (noIdLabels.length > 0) return;

      const shortLinks = pullRequest.comments.map((comment) => ({
        comment,
        shortLink: utils.extractShortLinkFromComment(comment),
      }));
      const trelloShortLinks = shortLinks.filter(
        (shortLink) => shortLink.shortLink instanceof TrelloShortLink,
      );
      if (trelloShortLinks.length === 0) throw new Error(ERR_NO_VALID_COMMENTS());

      await Promise.all(
        trelloShortLinks.map(
          async (sl) =>
            await validations.validateCommentContainsTrelloAttachment(
              sl.shortLink,
              sl.comment.url,
              pullRequest.url,
            ),
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
