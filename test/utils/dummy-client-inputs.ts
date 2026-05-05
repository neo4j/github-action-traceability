import { GlobalVerificationStrategy, InputsClientI } from '../../src/client-inputs';

class InputsClientBuilder {
  globalVerificationStrategy: GlobalVerificationStrategy = GlobalVerificationStrategy.Linked;
  linearApiKey: string = 'fake-linear-api-key';

  withGlobalVerificationStrategy(strategy: GlobalVerificationStrategy): InputsClientBuilder {
    this.globalVerificationStrategy = strategy;
    return this;
  }

  withLinearApiKey(key: string): InputsClientBuilder {
    this.linearApiKey = key;
    return this;
  }

  build(): InputsClientI {
    return new DummyInputsClient(this.globalVerificationStrategy, this.linearApiKey);
  }
}

class DummyInputsClient implements InputsClientI {
  globalVerificationStrategy: GlobalVerificationStrategy;
  linearApiKey: string;

  constructor(globalVerificationStrategy: GlobalVerificationStrategy, linearApiKey: string) {
    this.globalVerificationStrategy = globalVerificationStrategy;
    this.linearApiKey = linearApiKey;
  }

  getGlobalVerificationStrategy(): GlobalVerificationStrategy {
    return this.globalVerificationStrategy;
  }

  getGitHubApiToken(): string {
    return '';
  }

  getLinearApiKey(): string {
    return this.linearApiKey;
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
