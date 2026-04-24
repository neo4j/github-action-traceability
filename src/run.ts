import * as core from '@actions/core';

import { GitHubClientI } from './client-github';
import { GlobalVerificationStrategy, InputsClientI } from './client-inputs';
import { LinearIssueLink } from './client-trello';
import { UtilsService } from './service-utils';
import { ERR_NO_VALID_COMMENTS } from './errors';

const run = async (inputs: InputsClientI, github: GitHubClientI) => {
  const utils = new UtilsService(inputs);

  switch (inputs.getGlobalVerificationStrategy()) {
    case GlobalVerificationStrategy.Title: {
      const pullRequest = await github.getPullRequest(
        inputs.getPullRequestNumber(),
        inputs.getGithubRepositoryOwner(),
        inputs.getGitHubRepositoryName(),
      );
      utils.extractShortLink(pullRequest.title);
      break;
    }
    case GlobalVerificationStrategy.Commits: {
      const pullRequest = await github.getPullRequest(
        inputs.getPullRequestNumber(),
        inputs.getGithubRepositoryOwner(),
        inputs.getGitHubRepositoryName(),
      );
      const commitMessages = pullRequest.commits.map((c) => c.commit.message);
      commitMessages.forEach((msg) => utils.extractShortLink(msg));
      break;
    }
    case GlobalVerificationStrategy.Comments: {
      const pullRequest = await github.getPullRequest(
        inputs.getPullRequestNumber(),
        inputs.getGithubRepositoryOwner(),
        inputs.getGitHubRepositoryName(),
      );
      const noIdLabels = pullRequest.labels.filter((l) => l.name === 'No Linear');
      if (noIdLabels.length > 0) return;

      const linearIssueLinks = pullRequest.comments
        .map((comment) => utils.extractShortLinkFromComment(comment))
        .filter((shortLink) => shortLink instanceof LinearIssueLink);

      if (linearIssueLinks.length === 0) throw new Error(ERR_NO_VALID_COMMENTS());
      break;
    }
    case GlobalVerificationStrategy.Disabled:
      break;
  }

  core.info('Pull request validated successfully.');
};

export { run };
