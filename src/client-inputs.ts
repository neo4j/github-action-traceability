import * as core from '@actions/core';

enum GlobalVerificationStrategy {
  Commits = 'commits',
  CommitsAndPRTitle = 'commits_and_pr_title',
  Disabled = 'disabled',
}

enum ShortLinkVerificationStrategy {
  Trello = 'trello',
  TrelloOrNoId = 'trello_or_noid',
}

interface InputsClientI {
  getGlobalVerificationStrategy(): GlobalVerificationStrategy;
  getShortLinkVerificationStrategy(): ShortLinkVerificationStrategy;
  getTrelloApiKey(): string;
  getTrelloApiToken(): string;
  getGitHubApiToken(): string;
  getGitHubRepositoryName(): string;
  getGithubRepositoryOwner(): string;
  getPullRequestNumber(): number;
}

class InputsClient implements InputsClientI {
  getGlobalVerificationStrategy(): GlobalVerificationStrategy {
    core.info('Get global_verification_strategy.');
    const input = core.getInput('global_verification_strategy');
    switch (input) {
      case 'commits':
        return GlobalVerificationStrategy.Commits;
      case 'commits_and_pr_title':
        return GlobalVerificationStrategy.CommitsAndPRTitle;
      case 'disabled':
        return GlobalVerificationStrategy.Disabled;
      default:
        throw new Error(`Unrecognised value ${input} for "global_verification_strategy"`);
    }
  }

  getShortLinkVerificationStrategy(): ShortLinkVerificationStrategy {
    core.info('Get short_link_verification_strategy.');
    const input = core.getInput('short_link_verification_strategy');
    switch (input) {
      case 'trello':
        return ShortLinkVerificationStrategy.Trello;
      case 'trello_or_noid':
        return ShortLinkVerificationStrategy.TrelloOrNoId;
      default:
        throw new Error(`Unrecognised value ${input} for "short_link_verification_strategy"`);
    }
  }

  getTrelloApiKey(): string {
    core.info('Get trello_api_key.');
    return core.getInput('trello_api_key', { required: true });
  }

  getTrelloApiToken(): string {
    core.info('Get trello_api_token.');
    return core.getInput('trello_api_token', { required: true });
  }

  getGitHubApiToken(): string {
    core.info('Get github_api_token.');
    return core.getInput('github_api_token', { required: true });
  }

  // daniel document three inputs below
  getGitHubRepositoryName(): string {
    core.info('Get github_repository_name.');
    return core.getInput('github_repository_name', { required: true });
  }

  getGithubRepositoryOwner(): string {
    core.info('Get github_repository_owner.');
    return core.getInput('github_repository_owner', { required: true });
  }

  getPullRequestNumber(): number {
    core.info('Get pull_request_number.');
    return Number(core.getInput('pull_request_number', { required: true }));
  }
}

export { InputsClient, InputsClientI, GlobalVerificationStrategy, ShortLinkVerificationStrategy };
