import * as core from '@actions/core';
import * as github from '@actions/github';
import { graphql } from '@octokit/graphql';

interface EdgeItem<T> {
  node: T;
}

interface Commit {
  commit: {
    message: string;
  };
}

interface GetCommitsResponse {
  repository: {
    pullRequest: {
      commits: {
        edges: [EdgeItem<Commit>];
      };
    };
  };
}

interface Comment {
  author: {
    login: string;
  };
  body: string;
  bodyText: string; // daniel
  bodyHTML: string; // daniel
  url: string;
}

interface GetCommentsResponse {
  repository: {
    pullRequest: {
      comments: {
        edges: [EdgeItem<Comment>];
      };
    };
  };
}

interface GitHubClientI {
  getContextEvent(): string;
  getContextAction(): string;
  getPullRequestUrl(): string;
  getPullRequestTitle(): string;
  getPullRequestCommits(): Promise<Commit[]>;
  getPullRequestComments(): Promise<Comment[]>;
}

class GitHubClient implements GitHubClientI {
  githubApiToken: string;

  constructor(githubApiToken: string) {
    this.githubApiToken = githubApiToken;
  }

  getContextEvent(): string {
    if (!github.context.eventName) throw new Error('No event in the payload');
    return github.context.eventName;
  }

  getContextAction(): string {
    if (!github.context.payload.action) throw new Error('No action in the payload');
    return github.context.payload.action;
  }

  getPullRequestUrl(): string {
    core.info('Get pull request URL.');

    if (!github.context.payload) throw new Error('No payload found in the context.');
    if (!github.context.payload.pull_request) throw new Error('No PR found in the payload.');
    if (!github.context.payload.pull_request.html_url)
      throw new Error('No PR url found in the payload.');

    return github.context.payload.pull_request.html_url;
  }

  getPullRequestTitle(): string {
    core.info('Get pull request title.');

    if (!github.context.payload) throw new Error('No payload found in the context.');
    if (!github.context.payload.pull_request) throw new Error('No PR found in the payload.');
    if (!github.context.payload.pull_request.title) throw new Error('No title found in the PR.');

    return github.context.payload.pull_request.title;
  }

  // https://docs.github.com/en/graphql/reference/objects#pullrequest
  async getPullRequestCommits(): Promise<Commit[]> {
    core.info('Get pull request commits.');

    if (!github.context.payload) throw new Error('No payload found in the context.');
    if (!github.context.payload.pull_request) throw new Error('No PR found in the payload.');
    if (!github.context.payload.pull_request.number) throw new Error('No number found in the PR.');
    if (!github.context.payload.repository) throw new Error('No repository found in the payload.');
    if (!github.context.payload.repository.name)
      throw new Error('No name found in the repository.');
    if (
      !github.context.payload.repository.owner ||
      (!github.context.payload.repository.owner.login &&
        !github.context.payload.repository.owner.name)
    )
      throw new Error('No owner found in the repository.');

    const variables = {
      baseUrl: 'https://api.github.com',
      repositoryOwner:
        github.context.payload.repository.owner.name ||
        github.context.payload.repository.owner.login,
      repositoryName: github.context.payload.repository.name,
      pullRequestNumber: github.context.payload.pull_request.number,
      headers: {
        authorization: `token ${this.githubApiToken}`,
      },
    };

    const query = `
      query commitMessages(
        $repositoryOwner: String!
        $repositoryName: String!
        $pullRequestNumber: Int!
        $numberOfCommits: Int = 100
      ) {
        repository(owner: $repositoryOwner, name: $repositoryName) {
          pullRequest(number: $pullRequestNumber) {
            commits(last: $numberOfCommits) {
              edges {
                node {
                  commit {
                    message
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await graphql<GetCommitsResponse>(query, variables);
    const repository = response.repository;
    return repository.pullRequest.commits.edges.map((edge: EdgeItem<Commit>) => edge.node);
  }

  // https://docs.github.com/en/graphql/reference/objects#pullrequest
  async getPullRequestComments(): Promise<Comment[]> {
    core.info('Get pull request comments.');

    if (!github.context.payload) throw new Error('No payload found in the context.');
    if (!github.context.payload.pull_request) throw new Error('No PR found in the payload.');
    if (!github.context.payload.pull_request.number) throw new Error('No number found in the PR.');
    if (!github.context.payload.repository) throw new Error('No repository found in the payload.');
    if (!github.context.payload.repository.name)
      throw new Error('No name found in the repository.');
    if (
      !github.context.payload.repository.owner ||
      (!github.context.payload.repository.owner.login &&
        !github.context.payload.repository.owner.name)
    )
      throw new Error('No owner found in the repository.');

    const variables = {
      baseUrl: 'https://api.github.com',
      repositoryOwner:
        github.context.payload.repository.owner.name ||
        github.context.payload.repository.owner.login,
      repositoryName: github.context.payload.repository.name,
      pullRequestNumber: github.context.payload.pull_request.number,
      headers: {
        authorization: `token ${this.githubApiToken}`,
      },
    };

    const query = `
      query comments(
        $pullRequestNumber: Int!
        $repositoryName: String!
        $repositoryOwner: String!
        $numberOfComments: Int = 100
      ) {
        repository(owner: $repositoryOwner, name: $repositoryName) {
          pullRequest(number: $pullRequestNumber) {
            comments(last: $numberOfComments) {
              edges {
                node {
                  author {
                    login
                  }
                  body,
                  bodyText,
                  bodyHTML,
                  url
                }
              }
            }
          }
        }
      }
    `;

    const response = await graphql<GetCommentsResponse>(query, variables);
    const repository = response.repository;
    return repository.pullRequest.comments.edges.map((edge: EdgeItem<Comment>) => edge.node);
  }
}

export { GitHubClient, GitHubClientI, Commit, Comment };
