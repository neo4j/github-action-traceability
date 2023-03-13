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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortLinkVerificationStrategy = exports.GlobalVerificationStrategy = exports.InputsClient = void 0;
const core = __importStar(require("@actions/core"));
var GlobalVerificationStrategy;
(function (GlobalVerificationStrategy) {
    GlobalVerificationStrategy["Commits"] = "commits";
    GlobalVerificationStrategy["CommitsAndPRTitle"] = "commits_and_pr_title";
    GlobalVerificationStrategy["Comments"] = "comments";
    GlobalVerificationStrategy["Disabled"] = "disabled";
})(GlobalVerificationStrategy || (GlobalVerificationStrategy = {}));
exports.GlobalVerificationStrategy = GlobalVerificationStrategy;
var ShortLinkVerificationStrategy;
(function (ShortLinkVerificationStrategy) {
    ShortLinkVerificationStrategy["Trello"] = "trello";
    ShortLinkVerificationStrategy["TrelloOrNoId"] = "trello_or_noid";
})(ShortLinkVerificationStrategy || (ShortLinkVerificationStrategy = {}));
exports.ShortLinkVerificationStrategy = ShortLinkVerificationStrategy;
class InputsClient {
    getGlobalVerificationStrategy() {
        core.info('Get global_verification_strategy.');
        const input = core.getInput('global_verification_strategy');
        switch (input) {
            case 'commits':
                return GlobalVerificationStrategy.Commits;
            case 'commits_and_pr_title':
                return GlobalVerificationStrategy.CommitsAndPRTitle;
            case 'comments':
                return GlobalVerificationStrategy.Comments;
            case 'disabled':
                return GlobalVerificationStrategy.Disabled;
            default:
                throw new Error(`Unrecognised value ${input} for "global_verification_strategy"`);
        }
    }
    getShortLinkVerificationStrategy() {
        core.info('Get short_link_verification_strategy.');
        const input = core.getInput('short_link_verification_strategy');
        switch (input) {
            case 'trello':
                return ShortLinkVerificationStrategy.Trello;
            case 'trello_or_noid':
                return ShortLinkVerificationStrategy.TrelloOrNoId;
            default:
                throw new Error(`Unrecognised value ${input} for "short_link_verification_strategy"`);
        }
    }
    getTrelloApiKey() {
        core.info('Get trello_api_key.');
        return core.getInput('trello_api_key', { required: true });
    }
    getTrelloApiToken() {
        core.info('Get trello_api_token.');
        return core.getInput('trello_api_token', { required: true });
    }
    getGitHubApiToken() {
        core.info('Get github_api_token.');
        return core.getInput('github_api_token', { required: true });
    }
    getGitHubRepositoryName() {
        core.info('Get github_repository_name.');
        return core.getInput('github_repository_name', { required: true });
    }
    getGithubRepositoryOwner() {
        core.info('Get github_repository_owner.');
        return core.getInput('github_repository_owner', { required: true });
    }
    getPullRequestNumber() {
        core.info('Get pull_request_number.');
        return Number(core.getInput('pull_request_number', { required: true }));
    }
}
exports.InputsClient = InputsClient;
