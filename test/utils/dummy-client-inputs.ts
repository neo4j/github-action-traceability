import { GlobalVerificationStrategy, InputsClientI } from '../../src/client-inputs';

class InputsClientBuilder {
  globalVerificationStrategy: GlobalVerificationStrategy = GlobalVerificationStrategy.Linked;
  linearApiKey: string = 'fake-linear-api-key';
  linearClientId: string = '';
  linearClientSecret: string = '';
  targetBranches: string[] = [];

  withGlobalVerificationStrategy(strategy: GlobalVerificationStrategy): InputsClientBuilder {
    this.globalVerificationStrategy = strategy;
    return this;
  }

  withLinearApiKey(key: string): InputsClientBuilder {
    this.linearApiKey = key;
    return this;
  }

  withLinearClientCredentials(clientId: string, clientSecret: string): InputsClientBuilder {
    this.linearClientId = clientId;
    this.linearClientSecret = clientSecret;
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
      this.linearClientId,
      this.linearClientSecret,
      this.targetBranches,
    );
  }
}

class DummyInputsClient implements InputsClientI {
  globalVerificationStrategy: GlobalVerificationStrategy;
  linearApiKey: string;
  linearClientId: string;
  linearClientSecret: string;
  targetBranches: string[];

  constructor(
    globalVerificationStrategy: GlobalVerificationStrategy,
    linearApiKey: string,
    linearClientId: string,
    linearClientSecret: string,
    targetBranches: string[],
  ) {
    this.globalVerificationStrategy = globalVerificationStrategy;
    this.linearApiKey = linearApiKey;
    this.linearClientId = linearClientId;
    this.linearClientSecret = linearClientSecret;
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

  getLinearClientId(): string {
    return this.linearClientId;
  }

  getLinearClientSecret(): string {
    return this.linearClientSecret;
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
