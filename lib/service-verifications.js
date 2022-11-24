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
exports.VerificationsService = void 0;
const client_inputs_1 = require("./client-inputs");
const core = __importStar(require("@actions/core"));
class VerificationsService {
    constructor(github, inputs, trello) {
        this.github = github;
        this.inputs = inputs;
        this.trello = trello;
    }
    extractTrelloShortLink(commitMessage) {
        const REGEX_TRELLO_SHORT_LINK = new RegExp('^\\[([a-z0-9]+|NOID)\\].+');
        const match = REGEX_TRELLO_SHORT_LINK.exec(commitMessage);
        if (match === null)
            throw new Error(`Commit message ${commitMessage} does not contain a valid trello short link.`);
        return match[1];
    }
    assertAllShortLinksAreIdentical(shortLinks) {
        if (shortLinks.length === 0)
            return;
        const head = shortLinks[0];
        shortLinks.forEach((shortLink) => {
            if (shortLink !== head) {
                throw new Error('');
            }
        });
    }
    assertCardNotClosed(card) {
        if (card.closed)
            throw new Error(`Expected card ${card.shortLink} to not be closed.`);
    }
    assertNoIdShortLinkStrategy(strategy, trelloShortLinks) {
        const REGEX_TRELLO_NOID_CASE_INSENSITIVE = new RegExp('^\\[NOID\\]', 'i');
        const REGEX_TRELLO_NOID_UPPERCASE = new RegExp('^\\[NOID\\]');
        const REGEX_TRELLO_NOID_LOWERCASE = new RegExp('^\\[noid\\]');
        trelloShortLinks.forEach((trelloShortLink) => {
            switch (strategy) {
                case client_inputs_1.NoIdVerificationStrategy.CASE_INSENSITIVE:
                    return;
                case client_inputs_1.NoIdVerificationStrategy.UPPER_CASE:
                    if (REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
                        !REGEX_TRELLO_NOID_UPPERCASE.test(trelloShortLink)) {
                        throw new Error(`NOID short link needed to be upper case but was ${trelloShortLink}`);
                    }
                    return;
                case client_inputs_1.NoIdVerificationStrategy.LOWER_CASE:
                    if (REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
                        !REGEX_TRELLO_NOID_LOWERCASE.test(trelloShortLink)) {
                        throw new Error(`NOID short link needed to be lower case but was ${trelloShortLink}`);
                    }
                    return;
                case client_inputs_1.NoIdVerificationStrategy.NEVER:
                    if (REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink)) {
                        throw new Error(`NOID short link is not allowed.`);
                    }
                    return;
            }
        });
    }
    assertAllCommitsContainShortLink() {
        return __awaiter(this, void 0, void 0, function* () {
            const pullRequestUrl = this.github.getPullRequestUrl();
            const commitMessages = yield this.github.getPullRequestCommitMessages();
            const commitMessageShortLinks = commitMessages.map(this.extractTrelloShortLink);
            this.assertAllShortLinksAreIdentical(commitMessageShortLinks);
            this.assertNoIdShortLinkStrategy(this.inputs.getNoIdVerificationStrategy(), commitMessageShortLinks);
            const shortLink = commitMessageShortLinks[0];
            const card = yield this.trello.getCard(shortLink);
            this.assertCardNotClosed(card);
            const attachments = yield this.trello.getCardAttachments(shortLink);
            if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
                core.info('Trello card already has an attachment for this pull request. Skipping');
            }
            else {
                yield this.trello.addUrlAttachmentToCard(shortLink, pullRequestUrl);
            }
        });
    }
    assertTitleContainsShortLink() {
        return __awaiter(this, void 0, void 0, function* () {
            const pullRequestUrl = this.github.getPullRequestUrl();
            const pullRequestTitle = this.github.getPullRequestTitle();
            const titleShortLink = this.extractTrelloShortLink(pullRequestTitle);
            this.assertNoIdShortLinkStrategy(this.inputs.getNoIdVerificationStrategy(), [titleShortLink]);
            const card = yield this.trello.getCard(titleShortLink);
            this.assertCardNotClosed(card);
            const attachments = yield this.trello.getCardAttachments(titleShortLink);
            if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
                core.info('Trello card already has an attachment for this pull request. Skipping');
            }
            else {
                yield this.trello.addUrlAttachmentToCard(titleShortLink, pullRequestUrl);
            }
            return;
        });
    }
}
exports.VerificationsService = VerificationsService;
