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
exports.AssertionsService = void 0;
const client_inputs_1 = require("./client-inputs");
const client_trello_1 = require("./client-trello");
const core = __importStar(require("@actions/core"));
class AssertionsService {
    constructor(inputs, github, trello) {
        this.github = github;
        this.inputs = inputs;
        this.trello = trello;
    }
    validateSupportedEvent(githubClient) {
        core.info('Verify Github event type.');
        if (githubClient.getContextEvent() !== 'pull_request')
            throw new Error(`GitHub event "${githubClient.getContextEvent()}" is unsupported. ` +
                'Only "pull_request" is supported.');
    }
    validateSupportedAction(githubClient) {
        core.info('Verify Github action type.');
        if (!['opened', 'reopened', 'edited', 'synchronize'].some((el) => el === githubClient.getContextAction()))
            throw new Error(`GitHub action "${githubClient.getContextAction()}" is unsupported. Only "opened", "reopened", ` +
                '"edited", "synchronize" are supported.');
    }
    validateExclusivelyTrelloShortLinks(shortLinks) {
        core.info('Verify short links only contain Trello short links.');
        shortLinks.forEach((shortLink) => {
            if (shortLink instanceof client_trello_1.NoIdShortLink) {
                throw new Error(`Unexpected NOID short link "${shortLink.id}". Only Trello short links are allowed in your ` +
                    'project, please provide one in the form of "[a2bd4d] My change description".');
            }
        });
    }
    validateTrelloShortLinksAreIdentical(shortLinks) {
        core.info('Verify all Trello short links are identical.');
        if (shortLinks.length === 0) {
            return;
        }
        const head = shortLinks[0];
        shortLinks.forEach((shortLink) => {
            if (head.id !== shortLink.id) {
                throw new Error(`All Trello short links must be identical, but "${shortLink.id}" and "${head.id}" ` +
                    'were different.');
            }
        });
    }
    validateShortLinksStrategy(shortLinks) {
        core.info('Verify short link strategy.');
        const trelloShortLinks = shortLinks.filter((shortLink) => shortLink instanceof client_trello_1.TrelloShortLink);
        switch (this.inputs.getShortLinkVerificationStrategy()) {
            case client_inputs_1.ShortLinkVerificationStrategy.Trello: {
                this.validateExclusivelyTrelloShortLinks(shortLinks);
                this.validateTrelloShortLinksAreIdentical(trelloShortLinks);
                return;
            }
            case client_inputs_1.ShortLinkVerificationStrategy.TrelloOrNoId: {
                this.validateTrelloShortLinksAreIdentical(trelloShortLinks);
                return;
            }
        }
    }
    validateCardOpen(card) {
        core.info('Verify Trello card is open.');
        if (card.closed) {
            throw new Error(`Trello card "${card.shortLink}" needs to be in an open state, ` +
                'but it is currently marked as closed.');
        }
    }
}
exports.AssertionsService = AssertionsService;
