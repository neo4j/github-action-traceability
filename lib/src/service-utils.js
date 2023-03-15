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
exports.UtilsService = void 0;
const core = __importStar(require("@actions/core"));
const client_trello_1 = require("./client-trello");
const service_validations_1 = require("./service-validations");
const errors_1 = require("./errors");
class UtilsService {
    constructor(inputs) {
        this.inputs = inputs;
    }
    extractTrelloShortLink(description) {
        const pattern = new RegExp(`^\\[([a-zA-Z0-9]+)\\].+`);
        const match = pattern.exec(description);
        if (match !== null) {
            return new client_trello_1.TrelloShortLink(match[1]);
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
        const trelloShortLink = this.extractTrelloShortLink(description);
        if (noIdShortLink) {
            return noIdShortLink;
        }
        else if (trelloShortLink) {
            return trelloShortLink;
        }
        else {
            throw new Error((0, errors_1.ERR_NO_SHORT_LINK)(description));
        }
    }
    extractShortLinkFromComment(comment) {
        core.info(`Extracting potential short link from comment ${comment.url}.`);
        const powerUpPattern = new RegExp(`^\!\\[\\]\\(.*\\) \\[.*\\]\\(https://trello.com/c/([a-zA-Z0-9]+)/.+\\)$`);
        const neoNoraPattern = new RegExp(`.+\\bhttps://trello.com/c/([a-zA-Z0-9]+)\\b.+`);
        if (comment.author.login === 'neonora') {
            const match = neoNoraPattern.exec(comment.body);
            return match ? new client_trello_1.TrelloShortLink(match[1]) : new client_trello_1.NoIdShortLink('');
        }
        else {
            const match = powerUpPattern.exec(comment.body);
            return match ? new client_trello_1.TrelloShortLink(match[1]) : new client_trello_1.NoIdShortLink('');
        }
    }
    attachPullRequestToTrello(inputs, trello, github, pullRequest, trelloShortLink) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info('Start attaching pull request to Trello card.');
            const assertions = new service_validations_1.ValidationsService(trello);
            const card = yield trello.getCard(trelloShortLink.id);
            assertions.validateCardOpen(card);
            const attachments = yield trello.getCardAttachments(trelloShortLink.id);
            if (attachments.find((attachment) => attachment.url === pullRequest.url)) {
                core.info('Trello card already has an attachment for this pull request. Skipping.');
            }
            else {
                yield trello.addUrlAttachmentToCard(trelloShortLink.id, pullRequest.url);
            }
            return;
        });
    }
}
exports.UtilsService = UtilsService;
