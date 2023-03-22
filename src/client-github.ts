import * as core from '@actions/core';
import { graphql } from '@octokit/graphql';

interface EdgeItems<T> {
  edges: [
    {
      node: T;
    },
  ];
}

interface Commit {
  commit: {
    message: string;
  };
}

interface Comment {
  author: {
    login: string;
  };
  body: string;
  url: string;
}

interface Label {
  name: string;
}

interface PullRequest {
  url: string;
  title: string;
  author: string;
  commits: Commit[];
  comments: Comment[];
  labels: Label[];
}

interface GetPullRequest {
  repository: {
    pullRequest: {
      url: string;
      title: string;
      author: {
        login: string;
      };
      commits: EdgeItems<Commit>;
      comments: EdgeItems<Comment>;
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
      query commitMessages(
        $repositoryOwner: String!
        $repositoryName: String!
        $pullRequestNumber: Int!
        $numberOfCommits: Int = 250
        $numberOfComments: Int = 100
        $numberOfLabels: Int = 50
      ) {
        repository(owner: $repositoryOwner, name: $repositoryName) {
          pullRequest(number: $pullRequestNumber) {
            url
            title
            author {
              login
            }
            commits(last: $numberOfCommits) {
              edges {
                node {
                  commit {
                    message
                  }
                }
              }
            }
            comments(last: $numberOfComments) {
              edges {
                node {
                  author {
                    login
                  }
                  body
                  url
                }
              }
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
      author: response.repository.pullRequest.author.login,
      commits: response.repository.pullRequest.commits.edges.map((e) => e.node),
      comments: response.repository.pullRequest.comments.edges.map((e) => e.node),
      labels: response.repository.pullRequest.labels.edges.map((e) => e.node),
    };
  }
}

export { GitHubClient, GitHubClientI, Commit, Comment, Label, PullRequest };
