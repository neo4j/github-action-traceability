import { GlobalVerificationStrategy, InputsClientI } from '../../src/client-inputs';

class InputsClientBuilder {
  globalVerificationStrategy: GlobalVerificationStrategy = GlobalVerificationStrategy.Linked;
  linearApiKey: string = 'fake-linear-api-key';
  targetBranches: string[] = [];

  withGlobalVerificationStrategy(strategy: GlobalVerificationStrategy): InputsClientBuilder {
    this.globalVerificationStrategy = strategy;
    return this;
  }

  withLinearApiKey(key: string): InputsClientBuilder {
    this.linearApiKey = key;
    return this;
  }

  withTargetBranches(branches: string[]): InputsClientBuilder {
    this.targetBranches = branches;
    return this;
  }

  build(): InputsClientI {
    return new DummyInputsClient(
      this.globalVerificationStrategy,
      this.linearApiKey,
      this.targetBranches,
    );
  }
}

class DummyInputsClient implements InputsClientI {
  globalVerificationStrategy: GlobalVerificationStrategy;
  linearApiKey: string;
  targetBranches: string[];

  constructor(
    globalVerificationStrategy: GlobalVerificationStrategy,
    linearApiKey: string,
    targetBranches: string[],
  ) {
    this.globalVerificationStrategy = globalVerificationStrategy;
    this.linearApiKey = linearApiKey;
    this.targetBranches = targetBranches;
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

  getTargetBranches(): string[] {
    return this.targetBranches;
  }
}

export { InputsClientBuilder };
