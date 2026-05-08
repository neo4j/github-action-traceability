import { GitHubClientI, Label, PullRequest } from '../../src/client-github';

class GitHubClientBuilder {
  url: string = 'https://github.com/neo4j/apoc/pull/1';
  title: string = 'Install Traceability GitHub Action';
  body: string = '';
  author: string = 'Alice';
  headRefName: string = 'feature/install-action';
  baseRefName: string = 'dev';
  labels: Label[] = [];

  public withPullRequestUrl(url: string): GitHubClientBuilder {
    this.url = url;
    return this;
  }

  public withPullRequestTitle(title: string): GitHubClientBuilder {
    this.title = title;
    return this;
  }

  public withPullRequestBody(body: string): GitHubClientBuilder {
    this.body = body;
    return this;
  }

  public withHeadRefName(headRefName: string): GitHubClientBuilder {
    this.headRefName = headRefName;
    return this;
  }

  public withBaseRefName(baseRefName: string): GitHubClientBuilder {
    this.baseRefName = baseRefName;
    return this;
  }

  public withPullRequestLabel(name: string): GitHubClientBuilder {
    this.labels.push({ name });
    return this;
  }

  public build(): GitHubClientI {
    return new DummyGitHubClient(
      this.url,
      this.title,
      this.body,
      this.author,
      this.headRefName,
      this.baseRefName,
      this.labels,
    );
  }
}

class DummyGitHubClient implements GitHubClientI {
  url: string;
  title: string;
  body: string;
  author: string;
  headRefName: string;
  baseRefName: string;
  labels: Label[];

  constructor(
    url: string,
    title: string,
    body: string,
    author: string,
    headRefName: string,
    baseRefName: string,
    labels: Label[],
  ) {
    this.url = url;
    this.title = title;
    this.body = body;
    this.author = author;
    this.headRefName = headRefName;
    this.baseRefName = baseRefName;
    this.labels = labels;
  }

  getPullRequest(
    _pullRequestNumber: number,
    _repositoryOwner: string,
    _repositoryName: string,
  ): Promise<PullRequest> {
    return Promise.resolve({
      url: this.url,
      title: this.title,
      body: this.body,
      author: this.author,
      headRefName: this.headRefName,
      baseRefName: this.baseRefName,
      labels: this.labels,
    });
  }
}

export { GitHubClientBuilder };
