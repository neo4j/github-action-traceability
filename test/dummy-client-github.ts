import { GitHubClientI, Commit, Comment } from '../src/client-github';

class GitHubClientBuilder {
  pullRequestUrl: string = 'https://www.github.com/neo4j/apoc';
  pullRequestTitle: string = 'Install Traceability GitHub Action';
  pullRequestCommits: Commit[] = [];
  pullRequestComments: Comment[] = [];

  public withPullRequestUrl(pullRequestUrl: string): GitHubClientBuilder {
    this.pullRequestUrl = pullRequestUrl;
    return this;
  }

  public withPullRequestTitle(pullRequestTitle: string): GitHubClientBuilder {
    this.pullRequestTitle = pullRequestTitle;
    return this;
  }

  public withPullRequestCommitMessage(pullRequestCommitMessage: string): GitHubClientBuilder {
    this.pullRequestCommits.push({ commit: { message: pullRequestCommitMessage } });
    return this;
  }

  public withPullRequestComment(author: string, body: string, url: string): GitHubClientBuilder {
    this.pullRequestComments.push({
      author: {
        login: author,
      },
      body,
      bodyHTML: body,
      bodyText: body,
      url,
    });
    return this;
  }

  public build(): GitHubClientI {
    return new DummyGitHubClient(
      this.pullRequestUrl,
      this.pullRequestTitle,
      this.pullRequestCommits,
      this.pullRequestComments,
    );
  }
}

class DummyGitHubClient implements GitHubClientI {
  pullRequestUrl: string;
  pullRequestTitle: string;
  pullRequestCommits: Commit[];
  pullRequestComments: Comment[];

  constructor(
    pullRequestUrl: string,
    pullRequestTitle: string,
    pullRequestCommitMessages: Commit[],
    pullRequestComments: Comment[],
  ) {
    this.pullRequestUrl = pullRequestUrl;
    this.pullRequestTitle = pullRequestTitle;
    this.pullRequestCommits = pullRequestCommitMessages;
    this.pullRequestComments = pullRequestComments;
  }

  getPullRequestCommits(): Promise<Commit[]> {
    return Promise.resolve(this.pullRequestCommits);
  }

  getPullRequestComments(): Promise<Comment[]> {
    return Promise.resolve(this.pullRequestComments);
  }

  getPullRequestTitle(): string {
    return this.pullRequestTitle;
  }

  getPullRequestUrl(): string {
    return this.pullRequestUrl;
  }
}

export { GitHubClientBuilder };
