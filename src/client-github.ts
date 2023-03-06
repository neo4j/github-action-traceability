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

// daniel
/**
 *
 * {
 *   "comments": [
 *     {
 *       "author": {
 *         "login": "AzuObs"
 *       },
 *       "body": "https://trello.com/c/xwxZBfVu/1673-review-cip-78-rbac-for-load",
 *       "bodyText": "https://trello.com/c/xwxZBfVu/1673-review-cip-78-rbac-for-load",
 *       "bodyHTML": "<p dir=\"auto\"><a href=\"https://trello.com/c/xwxZBfVu/1673-review-cip-78-rbac-for-load\" rel=\"nofollow\">https://trello.com/c/xwxZBfVu/1673-review-cip-78-rbac-for-load</a></p>",
 *       "url": "https://github.com/neo4j/github-action-traceability/pull/6#issuecomment-1456277806"
 *     },
 *     {
 *       "author": {
 *         "login": "AzuObs"
 *       },
 *       "body": "### :wave: Neo-Nora here. I'll update this comment when a release is made.\r\n\r\n\r\n----------\r\n<details open><summary>PRs linked to this through Cherry Picks have been attatched to the following Trello cards:</summary>\r\n\r\n![](https://github.trello.services/images/mini-trello-icon.png)[https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW)\r\n\r\n</details>\r\n\r\n\r\n----------\r\n:speaking_head: Report 🐞 or feature requests [here](https://trello.com/b/P5EyEhac/neonora).\r\nThis comment was last updated (Mon, 06 Mar 2023 13:34:10 GMT).",
 *       "bodyText": "👋 Neo-Nora here. I'll update this comment when a release is made.\n\nPRs linked to this through Cherry Picks have been attatched to the following Trello cards:\nhttps://trello.com/c/BnBwoWsW\n\n\n🗣️ Report 🐞 or feature requests here.\nThis comment was last updated (Mon, 06 Mar 2023 13:34:10 GMT).",
 *       "bodyHTML": "<h3 dir=\"auto\"><g-emoji class=\"g-emoji\" alias=\"wave\" fallback-src=\"https://github.githubassets.com/images/icons/emoji/unicode/1f44b.png\">👋</g-emoji> Neo-Nora here. I'll update this comment when a release is made.</h3>\n<hr>\n<details open=\"\"><summary>PRs linked to this through Cherry Picks have been attatched to the following Trello cards:</summary>\n<p dir=\"auto\"><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://camo.githubusercontent.com/208d50cabd9d101500fe5dd548265dcfa00e017e397395692a173e7116c1094a/68747470733a2f2f6769746875622e7472656c6c6f2e73657276696365732f696d616765732f6d696e692d7472656c6c6f2d69636f6e2e706e67\"><img src=\"https://camo.githubusercontent.com/208d50cabd9d101500fe5dd548265dcfa00e017e397395692a173e7116c1094a/68747470733a2f2f6769746875622e7472656c6c6f2e73657276696365732f696d616765732f6d696e692d7472656c6c6f2d69636f6e2e706e67\" alt=\"\" data-canonical-src=\"https://github.trello.services/images/mini-trello-icon.png\" style=\"max-width: 100%;\"></a><a href=\"https://trello.com/c/BnBwoWsW\" rel=\"nofollow\">https://trello.com/c/BnBwoWsW</a></p>\n</details>\n<hr>\n<p dir=\"auto\"><g-emoji class=\"g-emoji\" alias=\"speaking_head\" fallback-src=\"https://github.githubassets.com/images/icons/emoji/unicode/1f5e3.png\">🗣️</g-emoji> Report <g-emoji class=\"g-emoji\" alias=\"lady_beetle\" fallback-src=\"https://github.githubassets.com/images/icons/emoji/unicode/1f41e.png\">🐞</g-emoji> or feature requests <a href=\"https://trello.com/b/P5EyEhac/neonora\" rel=\"nofollow\">here</a>.<br>\nThis comment was last updated (Mon, 06 Mar 2023 13:34:10 GMT).</p>",
 *       "url": "https://github.com/neo4j/github-action-traceability/pull/6#issuecomment-1456279217"
 *     },
 *     {
 *       "author": {
 *         "login": "AzuObs"
 *       },
 *       "body": "![](https://github.trello.services/images/mini-trello-icon.png) [Implement Traceability Proposal](https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal)",
 *       "bodyText": "Implement Traceability Proposal",
 *       "bodyHTML": "<p dir=\"auto\"><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://camo.githubusercontent.com/208d50cabd9d101500fe5dd548265dcfa00e017e397395692a173e7116c1094a/68747470733a2f2f6769746875622e7472656c6c6f2e73657276696365732f696d616765732f6d696e692d7472656c6c6f2d69636f6e2e706e67\"><img src=\"https://camo.githubusercontent.com/208d50cabd9d101500fe5dd548265dcfa00e017e397395692a173e7116c1094a/68747470733a2f2f6769746875622e7472656c6c6f2e73657276696365732f696d616765732f6d696e692d7472656c6c6f2d69636f6e2e706e67\" alt=\"\" data-canonical-src=\"https://github.trello.services/images/mini-trello-icon.png\" style=\"max-width: 100%;\"></a> <a href=\"https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal\" rel=\"nofollow\">Implement Traceability Proposal</a></p>",
 *       "url": "https://github.com/neo4j/github-action-traceability/pull/6#issuecomment-1456299206"
 *     }
 *   ]
 * }
 */
