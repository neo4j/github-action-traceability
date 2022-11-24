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
exports.CommitVerificationStrategy = exports.TitleVerificationStrategy = exports.NoIdVerificationStrategy = exports.InputsClient = void 0;
const core = __importStar(require("@actions/core"));
var NoIdVerificationStrategy;
(function (NoIdVerificationStrategy) {
    NoIdVerificationStrategy["CASE_INSENSITIVE"] = "CASE_INSENSITIVE";
    NoIdVerificationStrategy["UPPER_CASE"] = "UPPER_CASE";
    NoIdVerificationStrategy["LOWER_CASE"] = "LOWER_CASE";
    NoIdVerificationStrategy["NEVER"] = "NEVER";
})(NoIdVerificationStrategy || (NoIdVerificationStrategy = {}));
exports.NoIdVerificationStrategy = NoIdVerificationStrategy;
var CommitVerificationStrategy;
(function (CommitVerificationStrategy) {
    CommitVerificationStrategy["ALL_COMMITS"] = "ALL_COMMITS";
    CommitVerificationStrategy["NEVER"] = "NEVER";
})(CommitVerificationStrategy || (CommitVerificationStrategy = {}));
exports.CommitVerificationStrategy = CommitVerificationStrategy;
var TitleVerificationStrategy;
(function (TitleVerificationStrategy) {
    TitleVerificationStrategy["ALWAYS"] = "ALWAYS";
    TitleVerificationStrategy["NEVER"] = "NEVER";
})(TitleVerificationStrategy || (TitleVerificationStrategy = {}));
exports.TitleVerificationStrategy = TitleVerificationStrategy;
class InputsClient {
    getNoIdVerificationStrategy() {
        const input = core.getInput('noid_verification_strategy');
        switch (input) {
            case 'CASE_INSENSITIVE':
                return NoIdVerificationStrategy.CASE_INSENSITIVE;
            case 'UPPER_CASE':
                return NoIdVerificationStrategy.UPPER_CASE;
            case 'LOWER_CASE':
                return NoIdVerificationStrategy.LOWER_CASE;
            case 'NEVER':
                return NoIdVerificationStrategy.NEVER;
            default:
                throw new Error(`Unrecognised value ${input} for "noid_verification_strategy"`);
        }
    }
    getCommitVerificationStrategy() {
        const input = core.getInput('commit_verification_strategy');
        switch (input) {
            case 'ALL_COMMITS':
                return CommitVerificationStrategy.ALL_COMMITS;
            case 'NEVER':
                return CommitVerificationStrategy.NEVER;
            default:
                throw new Error(`Unrecognised value ${input} for "commit_verification_strategy"`);
        }
    }
    getTitleVerificationStrategy() {
        const input = core.getInput('title_verification_strategy');
        switch (input) {
            case 'ALWAYS':
                return TitleVerificationStrategy.ALWAYS;
            case 'NEVER':
                return TitleVerificationStrategy.NEVER;
            default:
                throw new Error(`Unrecognised value ${input} for "title_verification_strategy"`);
        }
    }
    getTrelloApiKey() {
        return core.getInput('trello_api_key', { required: true });
    }
    getTrelloApiToken() {
        return core.getInput('trello_api_token', { required: true });
    }
    getGitHubApiToken() {
        return core.getInput('github_api_token', { required: true });
    }
}
exports.InputsClient = InputsClient;
