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
            core.info(`Get pull request #${pullRequestNumber} for ${repositoryOwner}/${repositoryName}.`);
            core.info(JSON.stringify({ githubApiToken: this.githubApiToken }, null, 2)); // daniel
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
            const response = yield (0, graphql_1.graphql)(query, variables);
            return {
                url: response.repository.pullRequest.url,
                title: response.repository.pullRequest.title,
                author: response.repository.pullRequest.author.login,
                commits: response.repository.pullRequest.commits.edges.map((e) => e.node),
                comments: response.repository.pullRequest.comments.edges.map((e) => e.node),
                labels: response.repository.pullRequest.labels.edges.map((e) => e.node),
            };
        });
    }
}
exports.GitHubClient = GitHubClient;
