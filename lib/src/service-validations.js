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
exports.ValidationsService = void 0;
const client_inputs_1 = require("./client-inputs");
const client_trello_1 = require("./client-trello");
const core = __importStar(require("@actions/core"));
class ValidationsService {
    constructor(inputs, github, trello) {
        this.github = github;
        this.inputs = inputs;
        this.trello = trello;
    }
    validateCommentContainsTrelloAttachment(shortLink, commentUrl, pullRequestUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const attachments = yield this.trello.getCardAttachments(shortLink.id);
            const hasAttachment = !!attachments.filter((attachment) => attachment.url.startsWith(pullRequestUrl));
            if (hasAttachment) {
                throw new Error(`Although the comment ${commentUrl} contained the link https://trello.com/c/${shortLink.id}, when 
            checking the Trello card we could not find an attachment for pull request ${pullRequestUrl}. Please 
            consider either modifying so that it is not a naked Trello url, or consider attaching ${pullRequestUrl} to 
            the Trello card.
          
            This step can sometimes fail by accident if a comment in the pull request contains a naked Trello URL which 
            isn't intended to be parsed as the traced Trello card. In such cases, please consider editing the comment so
            that it contains more than just a naked Trello link. Alternatively you can disable the check by adding
            the 'No Trello' label to the PR. If you do so, please be sure that to double check your Trello card does 
            indeed contain a link to this PR.`);
            }
        });
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
    validateShortLinksStrategy(shortLinks) {
        core.info('Verify short link strategy.');
        switch (this.inputs.getShortLinkVerificationStrategy()) {
            case client_inputs_1.ShortLinkVerificationStrategy.Trello: {
                this.validateExclusivelyTrelloShortLinks(shortLinks);
                return;
            }
            case client_inputs_1.ShortLinkVerificationStrategy.TrelloOrNoId: {
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
exports.ValidationsService = ValidationsService;
