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
exports.REGEX_TRELLO_NOID_LOWERCASE = exports.REGEX_TRELLO_NOID_UPPERCASE = exports.REGEX_TRELLO_NOID_CASE_INSENSITIVE = exports.REGEX_TRELLO_SHORT_LINK = exports.getGithubAPIToken = exports.getTrelloApiToken = exports.getTrelloApiKey = exports.getTitleVerificationStrategy = exports.getCommitVerificationStrategy = exports.getNoIdVerificationStrategy = void 0;
const types_1 = require("./types");
const core = __importStar(require("@actions/core"));
const REGEX_TRELLO_SHORT_LINK = new RegExp('^\\[([a-z0-9]+|NOID)\\].+');
exports.REGEX_TRELLO_SHORT_LINK = REGEX_TRELLO_SHORT_LINK;
const REGEX_TRELLO_NOID_CASE_INSENSITIVE = new RegExp('^\\[NOID\\]', 'i');
exports.REGEX_TRELLO_NOID_CASE_INSENSITIVE = REGEX_TRELLO_NOID_CASE_INSENSITIVE;
const REGEX_TRELLO_NOID_UPPERCASE = new RegExp('^\\[NOID\\]');
exports.REGEX_TRELLO_NOID_UPPERCASE = REGEX_TRELLO_NOID_UPPERCASE;
const REGEX_TRELLO_NOID_LOWERCASE = new RegExp('^\\[noid\\]');
exports.REGEX_TRELLO_NOID_LOWERCASE = REGEX_TRELLO_NOID_LOWERCASE;
const getNoIdVerificationStrategy = () => {
    const input = core.getInput('noid_verification_strategy');
    switch (input) {
        case 'CASE_INSENSITIVE':
            return types_1.NoIdVerificationStrategy.CASE_INSENSITIVE;
        case 'UPPER_CASE':
            return types_1.NoIdVerificationStrategy.UPPER_CASE;
        case 'LOWER_CASE':
            return types_1.NoIdVerificationStrategy.LOWER_CASE;
        case 'NEVER':
            return types_1.NoIdVerificationStrategy.NEVER;
        default:
            throw new Error(`Unrecognised value ${input} for "noid_verification_strategy"`);
    }
};
exports.getNoIdVerificationStrategy = getNoIdVerificationStrategy;
const getCommitVerificationStrategy = () => {
    const input = core.getInput('commit_verification_strategy');
    switch (input) {
        case 'ALL_COMMITS':
            return types_1.CommitVerificationStrategy.ALL_COMMITS;
        case 'HEAD_COMMIT_ONLY':
            return types_1.CommitVerificationStrategy.HEAD_COMMIT_ONLY;
        case 'NEVER':
            return types_1.CommitVerificationStrategy.NEVER;
        default:
            throw new Error(`Unrecognised value ${input} for "commit_verification_strategy"`);
    }
};
exports.getCommitVerificationStrategy = getCommitVerificationStrategy;
const getTitleVerificationStrategy = () => {
    const input = core.getInput('title_verification_strategy');
    switch (input) {
        case 'ALWAYS':
            return types_1.TitleVerificationStrategy.ALWAYS;
        case 'IF_EXISTS':
            return types_1.TitleVerificationStrategy.IF_EXISTS;
        case 'NEVER':
            return types_1.TitleVerificationStrategy.NEVER;
        default:
            throw new Error(`Unrecognised value ${input} for "title_verification_strategy"`);
    }
};
exports.getTitleVerificationStrategy = getTitleVerificationStrategy;
const getTrelloApiKey = () => {
    return core.getInput('trello_api_key', { required: true });
};
exports.getTrelloApiKey = getTrelloApiKey;
const getTrelloApiToken = () => {
    return core.getInput('trello_api_token', { required: true });
};
exports.getTrelloApiToken = getTrelloApiToken;
const getGithubAPIToken = () => {
    return core.getInput('github_api_token', { required: true });
};
exports.getGithubAPIToken = getGithubAPIToken;
//# sourceMappingURL=utils.js.map