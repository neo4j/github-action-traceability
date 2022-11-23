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
const core = __importStar(require("@actions/core"));
const api_github_1 = require("./api-github");
const utils_1 = require("./utils");
const types_1 = require("./types");
const api_trello_1 = require("./api-trello");
const getTrelloShortLink = (commitMessage) => {
    const match = utils_1.REGEX_TRELLO_SHORT_LINK.exec(commitMessage);
    if (match === null)
        throw new Error(`Commit message ${commitMessage} does not contain a valid trello short link.`);
    return match[1];
};
const assertNoIdShortLinkStrategy = (trelloShortLinks) => {
    trelloShortLinks.forEach((trelloShortLink) => {
        switch ((0, utils_1.getNoIdVerificationStrategy)()) {
            case types_1.NoIdVerificationStrategy.CASE_INSENSITIVE:
                return;
            case types_1.NoIdVerificationStrategy.UPPER_CASE:
                if (utils_1.REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
                    !utils_1.REGEX_TRELLO_NOID_UPPERCASE.test(trelloShortLink)) {
                    throw new Error(`NOID short link needed to be upper case but was ${trelloShortLink}`);
                }
                return;
            case types_1.NoIdVerificationStrategy.LOWER_CASE:
                if (utils_1.REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
                    !utils_1.REGEX_TRELLO_NOID_LOWERCASE.test(trelloShortLink)) {
                    throw new Error(`NOID short link needed to be lower case but was ${trelloShortLink}`);
                }
                return;
            case types_1.NoIdVerificationStrategy.NEVER:
                if (utils_1.REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink)) {
                    throw new Error(`NOID short link is not allowed.`);
                }
                return;
        }
    });
};
const assertAllShortLinksAreIdentical = (shortLinks) => {
    if (shortLinks.length === 0)
        return;
    const head = shortLinks[0];
    shortLinks.forEach((shortLink) => {
        if (shortLink !== head) {
            throw new Error('');
        }
    });
};
const assertCardNotClosed = (card) => {
    if (card.closed)
        throw new Error(`Expected card ${card.shortUrl} to not be closed.`);
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, api_github_1.isSupportedEvent)()) {
        throw new Error(`Event ${(0, api_github_1.getContextEvent)()} is unsupported. Only ${(0, api_github_1.getSupportedEvent)()} events are supported.`);
    }
    if (!(0, api_github_1.isSupportedAction)()) {
        core.info(`Action ${(0, api_github_1.getContextAction)()} is unsupported. Only ${(0, api_github_1.getSupportedActions)()} actions are supported. Skipping.`);
        return;
    }
    const pullRequestUrl = (0, api_github_1.getPullRequestUrl)();
    switch ((0, utils_1.getCommitVerificationStrategy)()) {
        case types_1.CommitVerificationStrategy.ALL_COMMITS:
            const commitMessages = yield (0, api_github_1.getPullRequestCommitMessages)();
            const commitMessageShortLinks = commitMessages.map(getTrelloShortLink);
            assertAllShortLinksAreIdentical(commitMessageShortLinks);
            assertNoIdShortLinkStrategy(commitMessageShortLinks);
            const shortLink = commitMessageShortLinks[0];
            const card = yield (0, api_trello_1.getCard)(shortLink);
            assertCardNotClosed(card);
            const attachments = yield (0, api_trello_1.getCardAttachments)(shortLink);
            if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
                core.info('Trello card already has an attachment for this pull request. Skipping');
            }
            else {
                yield (0, api_trello_1.addUrlAttachmentToCard)(shortLink, pullRequestUrl);
            }
            return;
        case types_1.CommitVerificationStrategy.HEAD_COMMIT_ONLY:
            throw new Error('HEAD_COMMIT_ONLY implementation missing');
        case types_1.CommitVerificationStrategy.NEVER:
            core.info('Skipping commit verification strategy.');
    }
    switch ((0, utils_1.getTitleVerificationStrategy)()) {
        case types_1.TitleVerificationStrategy.ALWAYS:
            const pullRequestTitle = (0, api_github_1.getPullRequestTitle)();
            const titleShortLink = getTrelloShortLink(pullRequestTitle);
            assertNoIdShortLinkStrategy([titleShortLink]);
            const card = yield (0, api_trello_1.getCard)(titleShortLink);
            assertCardNotClosed(card);
            const attachments = yield (0, api_trello_1.getCardAttachments)(titleShortLink);
            if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
                core.info('Trello card already has an attachment for this pull request. Skipping');
            }
            else {
                yield (0, api_trello_1.addUrlAttachmentToCard)(titleShortLink, pullRequestUrl);
            }
            return;
        case types_1.TitleVerificationStrategy.IF_EXISTS:
            throw new Error('IF_EXISTS implementation missing.');
        case types_1.TitleVerificationStrategy.NEVER:
            return;
    }
}))();
//# sourceMappingURL=index.js.map