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
exports.VerificationService = void 0;
const client_inputs_1 = require("./client-inputs");
const client_github_1 = require("./client-github");
const core = __importStar(require("@actions/core"));
class VerificationService {
    constructor(github, inputs, trello) {
        this.github = github;
        this.inputs = inputs;
        this.trello = trello;
    }
    extractTrelloShortLink(description, descriptionType) {
        const REGEX_TRELLO_SHORT_LINK = new RegExp('^\\[([a-z0-9]+|NOID)\\].+', 'i');
        const match = REGEX_TRELLO_SHORT_LINK.exec(description);
        if (match === null) {
            switch (descriptionType) {
                case client_github_1.ChangeDescriptionType.Title:
                    throw new Error(`PR title "${description}" did not contain a valid trello short link. Please include one ` +
                        'like in the following examples: "[abc123] My work description" or "[NOID] My work description"');
                case client_github_1.ChangeDescriptionType.CommitMessage:
                    throw new Error(`Commit message "${description}" did not contain a valid trello short link. Please include one ` +
                        'like in the following examples: "[abc123] My work description" or "[NOID] My work description"');
            }
        }
        return match[1];
    }
    assertAtLeastOneShortLink(shortLinks, descriptionType) {
        if (shortLinks.length === 0) {
            switch (descriptionType) {
                case client_github_1.ChangeDescriptionType.Title:
                    throw new Error('A Trello short link is missing from the title in your PR. Please include one ' +
                        'like in the following examples: "[abc123] My work description" or "[NOID] My work description"');
                case client_github_1.ChangeDescriptionType.CommitMessage:
                    throw new Error('A Trello short link is missing from all commits in your PR. Please include at least one ' +
                        'like the following examples: "[abc123] My work description" or "[NOID] My work description"');
            }
        }
    }
    assertAllShortLinksAreIdentical(shortLinks) {
        if (shortLinks.length === 0)
            return;
        const head = shortLinks[0];
        shortLinks.forEach((shortLink) => {
            if (shortLink !== head) {
                throw new Error(`Your PR contained Trello short links that did not match: "${head}" and "${shortLink}" differ. ` +
                    'You cannot currently include more than one Trello card per PR. But please reach out to me if this is ' +
                    'something your team needs, you savages.');
            }
        });
    }
    assertCardNotClosed(card) {
        if (card.closed) {
            throw new Error(`Trello card "${card.shortLink}" needs to be in an open state, ` +
                'but it is currently marked as closed.');
        }
    }

    assertNoIdShortLinkStrategy(strategy, shortLinks) {
        const REGEX_TRELLO_NOID_ANYCASE = new RegExp('^NOID$', 'i');
        const REGEX_TRELLO_NOID_UPPERCASE = new RegExp('^NOID$');
        const REGEX_TRELLO_NOID_LOWERCASE = new RegExp('^noid$');
        shortLinks.forEach((shortLink) => {
            switch (strategy) {
                case client_inputs_1.NoIdVerificationStrategy.CaseInsensitive:
                    return;
                case client_inputs_1.NoIdVerificationStrategy.UpperCase:
                    if (REGEX_TRELLO_NOID_ANYCASE.test(shortLink) &&
                        REGEX_TRELLO_NOID_LOWERCASE.test(shortLink)) {
                        throw new Error(`NOID short link needed to be upper case but was "${shortLink}"`);
                    }
                    return;
                case client_inputs_1.NoIdVerificationStrategy.LowerCase:
                    if (REGEX_TRELLO_NOID_ANYCASE.test(shortLink) &&
                        REGEX_TRELLO_NOID_UPPERCASE.test(shortLink)) {
                        throw new Error(`NOID short link needed to be lower case but was "${shortLink}"`);
                    }
                    return;
                case client_inputs_1.NoIdVerificationStrategy.Never:
                    if (REGEX_TRELLO_NOID_ANYCASE.test(shortLink)) {
                        throw new Error('This PR should not include any NOID short links. If you need this functionality please enable it ' +
                            'via the "noid_verification_strategy" setting for this Github Action');
                    }
                    return;
            }
        });
    }
    assertAllCommitsContainShortLink() {
        return __awaiter(this, void 0, void 0, function* () {
            const pullRequestUrl = this.github.getPullRequestUrl();
            const commitMessages = yield this.github.getPullRequestCommitMessages();
            const commitMessageShortLinks = commitMessages.map((msg) => this.extractTrelloShortLink(msg, client_github_1.ChangeDescriptionType.CommitMessage));
            this.assertAtLeastOneShortLink(commitMessageShortLinks, client_github_1.ChangeDescriptionType.CommitMessage);
            this.assertAllShortLinksAreIdentical(commitMessageShortLinks);
            this.assertNoIdShortLinkStrategy(this.inputs.getNoIdVerificationStrategy(), commitMessageShortLinks);
            const shortLink = commitMessageShortLinks[0];
            if (shortLink.toUpperCase() === 'NOID') {
                return;
            }
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
            const titleShortLink = this.extractTrelloShortLink(pullRequestTitle, client_github_1.ChangeDescriptionType.Title);
            this.assertAtLeastOneShortLink([titleShortLink], client_github_1.ChangeDescriptionType.Title);
            this.assertNoIdShortLinkStrategy(this.inputs.getNoIdVerificationStrategy(), [titleShortLink]);
            if (titleShortLink.toUpperCase() === 'NOID') {
                return;
            }
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
exports.VerificationService = VerificationService;
