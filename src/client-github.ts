import * as core from '@actions/core';
import { graphql } from '@octokit/graphql';

interface EdgeItems<T> {
  edges: [
    {
      node: T;
    },
  ];
}

interface Label {
  name: string;
}

interface PullRequest {
  url: string;
  title: string;
  body: string;
  author: string;
  headRefName: string;
  labels: Label[];
}

interface GetPullRequest {
  repository: {
    pullRequest: {
      url: string;
      title: string;
      body: string;
      headRefName: string;
      author: {
        login: string;
      };
      labels: EdgeItems<Label>;
    };
  };
}

interface GitHubClientI {
  getPullRequest(
    pullRequestNumber: number,
    repositoryOwner: string,
    repositoryName: string,
  ): Promise<PullRequest>;
}

class GitHubClient implements GitHubClientI {
  githubApiToken: string;

  constructor(githubApiToken: string) {
    this.githubApiToken = githubApiToken;
  }

  // https://docs.github.com/en/graphql/reference/objects#pullrequest
  async getPullRequest(
    pullRequestNumber: number,
    repositoryOwner: string,
    repositoryName: string,
  ): Promise<PullRequest> {
    core.info(`Get pull request #${pullRequestNumber} for ${repositoryOwner}/${repositoryName}.`);
    const variables = {
      baseUrl: 'https://api.github.com',
      pullRequestNumber,
      repositoryOwner,
      repositoryName,
      headers: {
        authorization: `token ${this.githubApiToken}`,
      },
    };

    const query = `
      query pullRequestForTraceability(
        $repositoryOwner: String!
        $repositoryName: String!
        $pullRequestNumber: Int!
        $numberOfLabels: Int = 50
      ) {
        repository(owner: $repositoryOwner, name: $repositoryName) {
          pullRequest(number: $pullRequestNumber) {
            url
            title
            body
            headRefName
            author {
              login
            }
            labels(last: $numberOfLabels) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    `;

    const response = await graphql<GetPullRequest>(query, variables);
    return {
      url: response.repository.pullRequest.url,
      title: response.repository.pullRequest.title,
      body: response.repository.pullRequest.body,
      headRefName: response.repository.pullRequest.headRefName,
      author: response.repository.pullRequest.author.login,
      labels: response.repository.pullRequest.labels.edges.map((e) => e.node),
    };
  }
}

export { GitHubClient, GitHubClientI, Label, PullRequest };
