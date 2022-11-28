import * as core from '@actions/core';

enum NoIdVerificationStrategy {
  CASE_INSENSITIVE = 'CASE_INSENSITIVE',
  UPPER_CASE = 'UPPER_CASE',
  LOWER_CASE = 'LOWER_CASE',
  NEVER = 'NEVER',
}

enum CommitVerificationStrategy {
  ALL_COMMITS = 'ALL_COMMITS',
  NEVER = 'NEVER',
}

enum TitleVerificationStrategy {
  ALWAYS = 'ALWAYS',
  NEVER = 'NEVER',
}

interface InputsClientI {
  getNoIdVerificationStrategy(): NoIdVerificationStrategy;
  getCommitVerificationStrategy(): CommitVerificationStrategy;
  getTitleVerificationStrategy(): TitleVerificationStrategy;
  getTrelloApiKey(): string;
  getTrelloApiToken(): string;
  getGitHubApiToken(): string;
}

class InputsClient implements InputsClientI {
  getNoIdVerificationStrategy(): NoIdVerificationStrategy {
    const input = core.getInput('noid_verification_strategy');
    switch (input) {
      case 'CASE_INSENSITIVE':
        return NoIdVerificationStrategy.CASE_INSENSITIVE;
      case 'UPPER_CASE':
        return NoIdVerificationStrategy.UPPER_CASE;
      case 'LOWER_CASE':
        return NoIdVerificationStrategy.LOWER_CASE;
      case 'NEVER':
        return NoIdVerificationStrategy.NEVER;
      default:
        throw `Unrecognised value ${input} for "noid_verification_strategy"`;
    }
  }

  getCommitVerificationStrategy(): CommitVerificationStrategy {
    const input = core.getInput('commit_verification_strategy');
    switch (input) {
      case 'ALL_COMMITS':
        return CommitVerificationStrategy.ALL_COMMITS;
      case 'NEVER':
        return CommitVerificationStrategy.NEVER;
      default:
        throw `Unrecognised value ${input} for "commit_verification_strategy"`;
    }
  }

  getTitleVerificationStrategy(): TitleVerificationStrategy {
    const input = core.getInput('title_verification_strategy');
    switch (input) {
      case 'ALWAYS':
        return TitleVerificationStrategy.ALWAYS;
      case 'NEVER':
        return TitleVerificationStrategy.NEVER;
      default:
        throw `Unrecognised value ${input} for "title_verification_strategy"`;
    }
  }

  getTrelloApiKey(): string {
    return core.getInput('trello_api_key', { required: true });
  }

  getTrelloApiToken(): string {
    return core.getInput('trello_api_token', { required: true });
  }

  getGitHubApiToken(): string {
    return core.getInput('github_api_token', { required: true });
  }
}

export {
  InputsClient,
  InputsClientI,
  NoIdVerificationStrategy,
  TitleVerificationStrategy,
  CommitVerificationStrategy,
};
