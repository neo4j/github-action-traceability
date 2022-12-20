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
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const client_inputs_1 = require("./client-inputs");
const service_assertions_1 = require("./service-assertions");
const client_trello_1 = require("./client-trello");
const service_utils_1 = require("./service-utils");
const attachPullRequestToTrello = (inputs, trello, github, trelloShortLink) => __awaiter(void 0, void 0, void 0, function* () {
    core.info('Start attaching pull request to Trello card.');
    const assertions = new service_assertions_1.AssertionsService(inputs, github, trello);
    const url = github.getPullRequestUrl();
    const card = yield trello.getCard(trelloShortLink.id);
    assertions.validateCardOpen(card);
    const attachments = yield trello.getCardAttachments(trelloShortLink.id);
    if (attachments.find((attachment) => attachment.url === url)) {
        core.info('Trello card already has an attachment for this pull request. Skipping.');
    }
    else {
        yield trello.addUrlAttachmentToCard(trelloShortLink.id, url);
    }
    return;
});
const run = (inputs, github, trello) => __awaiter(void 0, void 0, void 0, function* () {
    const assertions = new service_assertions_1.AssertionsService(inputs, github, trello);
    const utils = new service_utils_1.UtilsService(inputs);
    core.info('Start GitHub event verification.');
    assertions.validateSupportedEvent(github);
    assertions.validateSupportedAction(github);
    core.info('Start global verification strategy.');
    switch (inputs.getGlobalVerificationStrategy()) {
        case client_inputs_1.GlobalVerificationStrategy.CommitsAndPRTitle: {
            const commits = yield github.getPullRequestCommitMessages();
            const commitShortLinks = commits.map(utils.extractShortLink.bind(utils));
            const title = github.getPullRequestTitle();
            const titleShortLinks = utils.extractShortLink(title);
            const shortLinks = [titleShortLinks, ...commitShortLinks];
            const trelloShortLinks = shortLinks.filter((shortLink) => shortLink instanceof client_trello_1.TrelloShortLink);
            assertions.validateShortLinksStrategy(shortLinks);
            if (trelloShortLinks.length > 0) {
                yield attachPullRequestToTrello(inputs, trello, github, trelloShortLinks[0]);
            }
            return;
        }
        case client_inputs_1.GlobalVerificationStrategy.Commits: {
            const commits = yield github.getPullRequestCommitMessages();
            const shortLinks = commits.map(utils.extractShortLink.bind(utils));
            const trelloShortLinks = shortLinks.filter((shortLink) => shortLink instanceof client_trello_1.TrelloShortLink);
            assertions.validateShortLinksStrategy(shortLinks);
            if (trelloShortLinks.length > 0) {
                yield attachPullRequestToTrello(inputs, trello, github, trelloShortLinks[0]);
            }
            return;
        }
        case client_inputs_1.GlobalVerificationStrategy.Disabled:
            return;
    }
    core.info('Pull request validated successfully.');
});
exports.run = run;
