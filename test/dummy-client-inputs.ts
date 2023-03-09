import {
  GlobalVerificationStrategy,
  ShortLinkVerificationStrategy,
  InputsClientI,
} from '../src/client-inputs';

class InputsClientBuilder {
  globalVerificationStrategy: GlobalVerificationStrategy = GlobalVerificationStrategy.Commits;
  shortLinkVerificationStrategy: ShortLinkVerificationStrategy =
    ShortLinkVerificationStrategy.TrelloOrNoId;

  withGlobalVerificationStrategy(strategy: GlobalVerificationStrategy): InputsClientBuilder {
    this.globalVerificationStrategy = strategy;
    return this;
  }

  withShortLinkVerificationStrategy(strategy: ShortLinkVerificationStrategy): InputsClientBuilder {
    this.shortLinkVerificationStrategy = strategy;
    return this;
  }

  build(): InputsClientI {
    return new DummyInputsClient(
      this.globalVerificationStrategy,
      this.shortLinkVerificationStrategy,
    );
  }
}

class DummyInputsClient implements InputsClientI {
  globalVerificationStrategy: GlobalVerificationStrategy;
  shortLinkVerificationStrategy: ShortLinkVerificationStrategy;

  constructor(
    globalVerificationStrategy: GlobalVerificationStrategy,
    shortLinkVerificationStrategy: ShortLinkVerificationStrategy,
  ) {
    this.globalVerificationStrategy = globalVerificationStrategy;
    this.shortLinkVerificationStrategy = shortLinkVerificationStrategy;
  }

  getGlobalVerificationStrategy(): GlobalVerificationStrategy {
    return this.globalVerificationStrategy;
  }

  getShortLinkVerificationStrategy(): ShortLinkVerificationStrategy {
    return this.shortLinkVerificationStrategy;
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
