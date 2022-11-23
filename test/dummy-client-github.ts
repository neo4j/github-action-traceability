import { GithubClientI } from '../src/client-github';

class DummyGithubClientBuilder {
  event: string = 'pull_request';
  action: string = 'opened';
  pullRequestUrl: string = 'https://www.github.com/neo4j/apoc';
  pullRequestTitle: string = 'Install Traceability Github Action';
  pullRequestCommitMessages: string[] = ['Install Traceability Github Action'];

  public withEvent(event: string): DummyGithubClientBuilder {
    this.event = event;
    return this;
  }

  public withAction(action: string): DummyGithubClientBuilder {
    this.action = action;
    return this;
  }

  public withPullRequestUrl(pullRequestUrl: string): DummyGithubClientBuilder {
    this.pullRequestUrl = pullRequestUrl;
    return this;
  }

  public withPullRequestTitle(pullRequestTitle: string): DummyGithubClientBuilder {
    this.pullRequestTitle = 'Install Traceability Github Action';
    return this;
  }

  public withPullRequestCommitMessages(
    pullRequestCommitMessages: string[],
  ): DummyGithubClientBuilder {
    this.pullRequestCommitMessages = pullRequestCommitMessages;
    return this;
  }

  public build(): GithubClientI {
    return new DummyGithubClient(
      this.event,
      this.action,
      this.pullRequestUrl,
      this.pullRequestTitle,
      this.pullRequestCommitMessages,
    );
  }
}

class DummyGithubClient implements GithubClientI {
  event: string;
  action: string;
  pullRequestUrl: string;
  pullRequestTitle: string;
  pullRequestCommitMessages: string[];

  constructor(
    event: string = 'pull_request',
    action: string = 'opened',
    pullRequestUrl: string = 'https://www.github.com/neo4j/apoc',
    pullRequestTitle: string = 'Install Traceability Github Action',
    pullRequestCommitMessages: string[] = ['Install Traceability Github Action'],
  ) {
    this.event = event;
    this.action = action;
    this.pullRequestUrl = pullRequestUrl;
    this.pullRequestTitle = pullRequestTitle;
    this.pullRequestCommitMessages = pullRequestCommitMessages;
  }

  getContextAction(): string {
    return this.action;
  }

  getContextEvent(): string {
    return this.event;
  }

  getPullRequestCommitMessages(): Promise<string[]> {
    return Promise.resolve(this.pullRequestCommitMessages);
  }

  getPullRequestTitle(): string {
    return this.pullRequestTitle;
  }

  getPullRequestUrl(): string {
    return this.pullRequestUrl;
  }
}

export { DummyGithubClientBuilder };
