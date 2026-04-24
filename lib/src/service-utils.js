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
exports.UtilsService = void 0;
const core = __importStar(require("@actions/core"));
const client_trello_1 = require("./client-trello");
const errors_1 = require("./errors");
class UtilsService {
    constructor(inputs) {
        this.inputs = inputs;
    }
    extractLinearIssueLink(description) {
        const pattern = new RegExp(`^\\[([A-Z]+-[0-9]+)\\].+`);
        const match = pattern.exec(description);
        if (match !== null) {
            return new client_trello_1.LinearIssueLink(match[1]);
        }
    }
    extractNoIdShortLink(description) {
        const pattern = new RegExp(`^\\[(NOID)\\].+`);
        const match = pattern.exec(description);
        if (match !== null) {
            return new client_trello_1.NoIdShortLink(match[1]);
        }
    }
    extractShortLink(description) {
        core.info(`Extracting potential short links from "${description}".`);
        const noIdShortLink = this.extractNoIdShortLink(description);
        const linearIssueLink = this.extractLinearIssueLink(description);
        if (noIdShortLink) {
            return noIdShortLink;
        }
        else if (linearIssueLink) {
            return linearIssueLink;
        }
        else {
            throw new Error((0, errors_1.ERR_NO_SHORT_LINK)(description));
        }
    }
    extractLinearIssueLinkFromText(text) {
        const pattern = new RegExp(`([A-Z]+-[0-9]+)`);
        const match = pattern.exec(text);
        return match ? new client_trello_1.LinearIssueLink(match[1]) : null;
    }
    extractShortLinkFromComment(comment) {
        core.info(`Extracting potential short link from comment ${comment.url}.`);
        const linearUrlPattern = new RegExp(`https://linear\\.app/[^/]+/issue/([A-Z]+-[0-9]+)`);
        const match = linearUrlPattern.exec(comment.body);
        return match ? new client_trello_1.LinearIssueLink(match[1]) : new client_trello_1.NoIdShortLink('');
    }
}
exports.UtilsService = UtilsService;
