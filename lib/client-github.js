"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = void 0;
const core = __importStar(require("@actions/core"));
const graphql_1 = require("@octokit/graphql");
class GitHubClient {
    constructor(githubApiToken) {
        this.githubApiToken = githubApiToken;
    }
    // https://docs.github.com/en/graphql/reference/objects#pullrequest
    getPullRequest(pullRequestNumber, repositoryOwner, repositoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info('Get pull request.');
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
        $numberOfCommits: Int = 500
        $numberOfComments: Int = 500
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
                  body,
                  bodyText,
                  bodyHTML,
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
            const response = yield (0, graphql_1.graphql)(query, variables);
            return {
                url: response.pullRequest.url,
                title: response.pullRequest.title,
                author: response.pullRequest.author.login,
                commits: response.pullRequest.commits.edges.map((e) => e.node),
                comments: response.pullRequest.comments.edges.map((e) => e.node),
                labels: response.pullRequest.labels.edges.map((e) => e.node),
            };
        });
    }
}
exports.GitHubClient = GitHubClient;
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
