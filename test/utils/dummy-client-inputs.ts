import { GlobalVerificationStrategy, InputsClientI } from '../../src/client-inputs';

class InputsClientBuilder {
  globalVerificationStrategy: GlobalVerificationStrategy = GlobalVerificationStrategy.Commits;

  withGlobalVerificationStrategy(strategy: GlobalVerificationStrategy): InputsClientBuilder {
    this.globalVerificationStrategy = strategy;
    return this;
  }

  build(): InputsClientI {
    return new DummyInputsClient(this.globalVerificationStrategy);
  }
}

class DummyInputsClient implements InputsClientI {
  globalVerificationStrategy: GlobalVerificationStrategy;

  constructor(globalVerificationStrategy: GlobalVerificationStrategy) {
    this.globalVerificationStrategy = globalVerificationStrategy;
  }

  getGlobalVerificationStrategy(): GlobalVerificationStrategy {
    return this.globalVerificationStrategy;
  }

  getGitHubApiToken(): string {
    return '';
  }

  getTrelloApiKey(): string {
    return '';
  }

  getTrelloApiToken(): string {
    return '';
  }

  getGithubRepositoryOwner(): string {
    return '';
  }

  getGitHubRepositoryName(): string {
    return '';
  }

  getPullRequestNumber(): number {
    return -1;
  }
}

export { InputsClientBuilder };
