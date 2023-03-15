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
exports.GlobalVerificationStrategy = exports.InputsClient = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const errors_1 = require("./errors");
var GlobalVerificationStrategy;
(function (GlobalVerificationStrategy) {
    GlobalVerificationStrategy["Commits"] = "commits";
    GlobalVerificationStrategy["Title"] = "title";
    GlobalVerificationStrategy["Comments"] = "comments";
    GlobalVerificationStrategy["Disabled"] = "disabled";
})(GlobalVerificationStrategy || (GlobalVerificationStrategy = {}));
exports.GlobalVerificationStrategy = GlobalVerificationStrategy;
class InputsClient {
    getGlobalVerificationStrategy() {
        core.info('Get global_verification_strategy.');
        const input = core.getInput('global_verification_strategy');
        switch (input) {
            case 'commits':
                return GlobalVerificationStrategy.Commits;
            case 'title':
                return GlobalVerificationStrategy.Title;
            case 'comments':
                return GlobalVerificationStrategy.Comments;
            case 'disabled':
                return GlobalVerificationStrategy.Disabled;
            default:
                throw new Error((0, errors_1.ERR_INPUT_INVALID)('global_verification_strategy', input));
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
        core.info('Get github.context.payload.repository.');
        if (!github.context.payload.repository)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.repository'));
        if (!github.context.payload.repository.name)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.repository.name'));
        return github.context.payload.repository.name;
    }
    getGithubRepositoryOwner() {
        core.info('Get github_repository_owner.');
        if (!github.context.payload.repository)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.repository'));
        if (!github.context.payload.repository.name)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.repository.name'));
        if (!github.context.payload.repository.owner)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.repository.owner'));
        if (!github.context.payload.repository.owner.login &&
            !github.context.payload.repository.owner.name)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.repository.owner.login && github.context.payload.repository.owner.name'));
        return (github.context.payload.repository.owner.name || github.context.payload.repository.owner.login);
    }
    getPullRequestNumber() {
        core.info('Get github.context.payload.pull_request.number.');
        if (!github.context.payload)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload'));
        if (!github.context.payload.pull_request)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.pull_request'));
        if (!github.context.payload.pull_request.number)
            throw new Error((0, errors_1.ERR_INPUT_NOT_FOUND)('github.context.payload.pull_request.number'));
        return github.context.payload.pull_request.number;
    }
}
exports.InputsClient = InputsClient;
