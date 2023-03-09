import { GitHubClientI, Commit, Comment, Label, PullRequest } from '../src/client-github';

class GitHubClientBuilder {
  url: string = 'https://www.github.com/neo4j/apoc';
  title: string = 'Install Traceability GitHub Action';
  author: string = 'Alice';
  commits: Commit[] = [];
  comments: Comment[] = [];
  labels: Label[] = [];

  public withPullRequestUrl(url: string): GitHubClientBuilder {
    this.url = url;
    return this;
  }

  public withPullRequestTitle(title: string): GitHubClientBuilder {
    this.title = title;
    return this;
  }

  public withPullRequestAuthor(author: string): GitHubClientBuilder {
    this.author = author;
    return this;
  }

  public withPullRequestCommitMessage(message: string): GitHubClientBuilder {
    this.commits.push({ commit: { message: message } });
    return this;
  }

  public withPullRequestComment(author: string, body: string, url: string): GitHubClientBuilder {
    this.comments.push({
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
      this.url,
      this.title,
      this.author,
      this.commits,
      this.comments,
      this.labels,
    );
  }
}

class DummyGitHubClient implements GitHubClientI {
  url: string;
  title: string;
  author: string;
  commits: Commit[];
  comments: Comment[];
  labels: Label[];

  constructor(
    url: string,
    title: string,
    author: string,
    commits: Commit[],
    comments: Comment[],
    labels: Label[],
  ) {
    this.url = url;
    this.title = title;
    this.author = author;
    this.commits = commits;
    this.comments = comments;
    this.labels = labels;
  }

  getPullRequest(
    pullRequestNumber: number,
    repositoryOwner: string,
    repositoryName: string,
  ): Promise<PullRequest> {
    return Promise.resolve({
      url: this.url,
      title: this.title,
      author: this.author,
      commits: this.commits,
      comments: this.comments,
      labels: this.labels,
    });
  }
}

export { GitHubClientBuilder };
