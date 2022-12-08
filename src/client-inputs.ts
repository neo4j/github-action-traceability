import * as core from '@actions/core';

enum NoIdVerificationStrategy {
  CaseInsensitive,
  UpperCase,
  LowerCase,
  Never,
}

enum CommitVerificationStrategy {
  AllCommits,
  Never,
}

enum TitleVerificationStrategy {
  Always,
  Never,
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
        return NoIdVerificationStrategy.CaseInsensitive;
      case 'UPPER_CASE':
        return NoIdVerificationStrategy.UpperCase;
      case 'LOWER_CASE':
        return NoIdVerificationStrategy.LowerCase;
      case 'NEVER':
        return NoIdVerificationStrategy.Never;
      default:
        throw new Error(`Unrecognised value ${input} for "noid_verification_strategy"`);
    }
  }

  getCommitVerificationStrategy(): CommitVerificationStrategy {
    const input = core.getInput('commit_verification_strategy');
    switch (input) {
      case 'ALL_COMMITS':
        return CommitVerificationStrategy.AllCommits;
      case 'NEVER':
        return CommitVerificationStrategy.Never;
      default:
        throw new Error(`Unrecognised value ${input} for "commit_verification_strategy"`);
    }
  }

  getTitleVerificationStrategy(): TitleVerificationStrategy {
    const input = core.getInput('title_verification_strategy');
    switch (input) {
      case 'ALWAYS':
        return TitleVerificationStrategy.Always;
      case 'NEVER':
        return TitleVerificationStrategy.Never;
      default:
        throw new Error(`Unrecognised value ${input} for "title_verification_strategy"`);
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
