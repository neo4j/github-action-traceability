import { GitHubClientI } from '../src/client-github';

class GitHubClientBuilder {
  event: string = 'pull_request';
  action: string = 'opened';
  pullRequestUrl: string = 'https://www.github.com/neo4j/apoc';
  pullRequestTitle: string = 'Install Traceability GitHub Action';
  pullRequestCommitMessages: string[] = [];

  public withEvent(event: string): GitHubClientBuilder {
    this.event = event;
    return this;
  }

  public withAction(action: string): GitHubClientBuilder {
    this.action = action;
    return this;
  }

  public withPullRequestUrl(pullRequestUrl: string): GitHubClientBuilder {
    this.pullRequestUrl = pullRequestUrl;
    return this;
  }

  public withPullRequestTitle(pullRequestTitle: string): GitHubClientBuilder {
    this.pullRequestTitle = pullRequestTitle;
    return this;
  }

  public withPullRequestCommitMessage(pullRequestCommitMessage: string): GitHubClientBuilder {
    this.pullRequestCommitMessages.push(pullRequestCommitMessage);
    return this;
  }

  public build(): GitHubClientI {
    return new DummyGitHubClient(
      this.event,
      this.action,
      this.pullRequestUrl,
      this.pullRequestTitle,
      this.pullRequestCommitMessages,
    );
  }
}

class DummyGitHubClient implements GitHubClientI {
  event: string;
  action: string;
  pullRequestUrl: string;
  pullRequestTitle: string;
  pullRequestCommitMessages: string[];

  constructor(
    event: string = 'pull_request',
    action: string = 'opened',
    pullRequestUrl: string = 'https://www.github.com/neo4j/apoc',
    pullRequestTitle: string = 'Install Traceability GitHub Action',
    pullRequestCommitMessages: string[] = [],
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

export { GitHubClientBuilder };
