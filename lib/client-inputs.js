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
    NoIdVerificationStrategy[NoIdVerificationStrategy["CaseInsensitive"] = 0] = "CaseInsensitive";
    NoIdVerificationStrategy[NoIdVerificationStrategy["UpperCase"] = 1] = "UpperCase";
    NoIdVerificationStrategy[NoIdVerificationStrategy["LowerCase"] = 2] = "LowerCase";
    NoIdVerificationStrategy[NoIdVerificationStrategy["Never"] = 3] = "Never";
})(NoIdVerificationStrategy || (NoIdVerificationStrategy = {}));
exports.NoIdVerificationStrategy = NoIdVerificationStrategy;
var CommitVerificationStrategy;
(function (CommitVerificationStrategy) {
    CommitVerificationStrategy[CommitVerificationStrategy["AllCommits"] = 0] = "AllCommits";
    CommitVerificationStrategy[CommitVerificationStrategy["Never"] = 1] = "Never";
})(CommitVerificationStrategy || (CommitVerificationStrategy = {}));
exports.CommitVerificationStrategy = CommitVerificationStrategy;
var TitleVerificationStrategy;
(function (TitleVerificationStrategy) {
    TitleVerificationStrategy[TitleVerificationStrategy["Always"] = 0] = "Always";
    TitleVerificationStrategy[TitleVerificationStrategy["Never"] = 1] = "Never";
})(TitleVerificationStrategy || (TitleVerificationStrategy = {}));
exports.TitleVerificationStrategy = TitleVerificationStrategy;
class InputsClient {
    getNoIdVerificationStrategy() {
        const input = core.getInput('noid_verification_strategy');
        switch (input) {
            case 'CASE_INSENSITIVE':
                return NoIdVerificationStrategy.CaseInsensitive;
            case 'UPPER_CASE':
                return NoIdVerificationStrategy.UpperCase;
            case 'LOWER_CASE':
                return NoIdVerificationStrategy.LowerCase;
            case 'NEVER':
                return NoIdVerificationStrategy.Never;
            default:
                throw new Error(`Unrecognised value ${input} for "noid_verification_strategy"`);
        }
    }
    getCommitVerificationStrategy() {
        const input = core.getInput('commit_verification_strategy');
        switch (input) {
            case 'ALL_COMMITS':
                return CommitVerificationStrategy.AllCommits;
            case 'NEVER':
                return CommitVerificationStrategy.Never;
            default:
                throw new Error(`Unrecognised value ${input} for "commit_verification_strategy"`);
        }
    }
    getTitleVerificationStrategy() {
        const input = core.getInput('title_verification_strategy');
        switch (input) {
            case 'ALWAYS':
                return TitleVerificationStrategy.Always;
            case 'NEVER':
                return TitleVerificationStrategy.Never;
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
