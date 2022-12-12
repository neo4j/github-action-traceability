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
  getNoIdShortLinkPattern(): RegExp;
  getTrelloApiKey(): string;
  getTrelloApiToken(): string;
  getGitHubApiToken(): string;
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

  getNoIdShortLinkPattern(): RegExp {
    core.info('Get noid_short_link_pattern.');
    return new RegExp(core.getInput('noid_short_link_pattern'));
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
}

export { InputsClient, InputsClientI, GlobalVerificationStrategy, ShortLinkVerificationStrategy };
