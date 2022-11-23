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
exports.getPullRequestCommitMessages = exports.getPullRequestTitle = exports.isSupportedAction = exports.getSupportedActions = exports.getContextAction = exports.isSupportedEvent = exports.getSupportedEvent = exports.getContextEvent = exports.getPullRequestUrl = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const utils_1 = require("./utils");
const graphql_1 = require("@octokit/graphql");
const getContextEvent = () => github.context.eventName;
exports.getContextEvent = getContextEvent;
const getSupportedEvent = () => 'pull_request';
exports.getSupportedEvent = getSupportedEvent;
const isSupportedEvent = () => getContextEvent() === getSupportedEvent();
exports.isSupportedEvent = isSupportedEvent;
const getContextAction = () => github.context.payload.action;
exports.getContextAction = getContextAction;
const getSupportedActions = () => ['opened', 'reopened', 'edited'];
exports.getSupportedActions = getSupportedActions;
const isSupportedAction = () => getSupportedActions().some((el) => el === getContextAction());
exports.isSupportedAction = isSupportedAction;
const getPullRequestUrl = () => {
    core.debug('Get pull request url');
    if (!github.context.payload)
        throw new Error('No payload found in the context.');
    if (!github.context.payload.pull_request)
        throw new Error('No pull request found in the payload.');
    if (!github.context.payload.pull_request.html_url)
        throw new Error('No pull request url found in the payload.');
    return github.context.payload.pull_request.html_url;
};
exports.getPullRequestUrl = getPullRequestUrl;
const getPullRequestTitle = () => {
    core.debug('Get pull request title');
    if (!github.context.payload)
        throw new Error('No payload found in the context.');
    if (!github.context.payload.pull_request)
        throw new Error('No pull request found in the payload.');
    if (!github.context.payload.pull_request.title)
        throw new Error('No title found in the pull request.');
    return github.context.payload.pull_request.title;
};
exports.getPullRequestTitle = getPullRequestTitle;
const getPullRequestCommitMessages = () => __awaiter(void 0, void 0, void 0, function* () {
    core.debug('Get pull request commits');
    if (!github.context.payload)
        throw new Error('No payload found in the context.');
    if (!github.context.payload.pull_request)
        throw new Error('No pull request found in the payload.');
    if (!github.context.payload.pull_request.number)
        throw new Error('No number found in the pull request.');
    if (!github.context.payload.repository)
        throw new Error('No repository found in the payload.');
    if (!github.context.payload.repository.name)
        throw new Error('No name found in the repository.');
    if (!github.context.payload.repository.owner ||
        (!github.context.payload.repository.owner.login &&
            !github.context.payload.repository.owner.name))
        throw new Error('No owner found in the repository.');
    const variables = {
        baseUrl: 'https://api.github.com',
        repositoryOwner: github.context.payload.repository.owner.name || github.context.payload.repository.owner.login,
        repositoryName: github.context.payload.repository.name,
        pullRequestNumber: github.context.payload.pull_request.number,
        headers: {
            authorization: `token ${(0, utils_1.getGithubAPIToken)()}`,
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
    const response = yield (0, graphql_1.graphql)(query, variables);
    const repository = response.repository;
    return repository.pullRequest.commits.edges.map((edge) => edge.node.commit.message);
});
exports.getPullRequestCommitMessages = getPullRequestCommitMessages;
//# sourceMappingURL=api-github.js.map