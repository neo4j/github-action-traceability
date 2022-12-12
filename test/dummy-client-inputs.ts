import {
  GlobalVerificationStrategy,
  ShortLinkVerificationStrategy,
  InputsClientI,
} from '../src/client-inputs';

class InputsClientBuilder {
  globalVerificationStrategy: GlobalVerificationStrategy = GlobalVerificationStrategy.Commits;
  shortLinkVerificationStrategy: ShortLinkVerificationStrategy =
    ShortLinkVerificationStrategy.TrelloOrNoId;
  noIdShortLinkPattern: RegExp = new RegExp('\\[(NOID)\\]');

  withGlobalVerificationStrategy(strategy: GlobalVerificationStrategy): InputsClientBuilder {
    this.globalVerificationStrategy = strategy;
    return this;
  }

  withShortLinkVerificationStrategy(strategy: ShortLinkVerificationStrategy): InputsClientBuilder {
    this.shortLinkVerificationStrategy = strategy;
    return this;
  }

  withNoIdShortLinkPattern(pattern: string): InputsClientBuilder {
    this.noIdShortLinkPattern = new RegExp(pattern);
    return this;
  }

  build(): InputsClientI {
    return new DummyInputsClient(
      this.globalVerificationStrategy,
      this.shortLinkVerificationStrategy,
      this.noIdShortLinkPattern,
    );
  }
}

class DummyInputsClient implements InputsClientI {
  globalVerificationStrategy: GlobalVerificationStrategy;
  shortLinkVerificationStrategy: ShortLinkVerificationStrategy;
  noIdPattern: RegExp;

  constructor(
    globalVerificationStrategy: GlobalVerificationStrategy,
    shortLinkVerificationStrategy: ShortLinkVerificationStrategy,
    noIdPattern: RegExp,
  ) {
    this.globalVerificationStrategy = globalVerificationStrategy;
    this.shortLinkVerificationStrategy = shortLinkVerificationStrategy;
    this.noIdPattern = noIdPattern;
  }

  getGlobalVerificationStrategy(): GlobalVerificationStrategy {
    return this.globalVerificationStrategy;
  }

  getShortLinkVerificationStrategy(): ShortLinkVerificationStrategy {
    return this.shortLinkVerificationStrategy;
  }

  getNoIdShortLinkPattern(): RegExp {
    return this.noIdPattern;
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
}

export { InputsClientBuilder };
