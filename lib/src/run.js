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
const service_validations_1 = require("./service-validations");
const client_trello_1 = require("./client-trello");
const service_utils_1 = require("./service-utils");
const errors_1 = require("./errors");
const run = (inputs, github, trello) => __awaiter(void 0, void 0, void 0, function* () {
    const validations = new service_validations_1.ValidationsService(inputs, github, trello);
    const utils = new service_utils_1.UtilsService(inputs);
    switch (inputs.getGlobalVerificationStrategy()) {
        case client_inputs_1.GlobalVerificationStrategy.CommitsAndPRTitle: {
            const pullRequest = yield github.getPullRequest(inputs.getPullRequestNumber(), inputs.getGithubRepositoryOwner(), inputs.getGitHubRepositoryName());
            const titleShortLinks = utils.extractShortLink(pullRequest.title);
            const commitShortLinks = pullRequest.commits
                .map((c) => c.commit.message)
                .map(utils.extractShortLink.bind(utils));
            const shortLinks = [...new Set([titleShortLinks, ...commitShortLinks])];
            validations.validateShortLinksStrategy(shortLinks);
            yield Promise.all(shortLinks.map((shortLink) => __awaiter(void 0, void 0, void 0, function* () {
                if (shortLink instanceof client_trello_1.TrelloShortLink) {
                    yield utils.attachPullRequestToTrello(inputs, trello, github, pullRequest, shortLink);
                }
            })));
            break;
        }
        case client_inputs_1.GlobalVerificationStrategy.Commits: {
            const pullRequest = yield github.getPullRequest(inputs.getPullRequestNumber(), inputs.getGithubRepositoryOwner(), inputs.getGitHubRepositoryName());
            const commitMessages = pullRequest.commits.map((c) => c.commit.message);
            const shortLinks = [...new Set(commitMessages.map(utils.extractShortLink.bind(utils)))];
            validations.validateShortLinksStrategy(shortLinks);
            yield Promise.all(shortLinks.map((shortLink) => __awaiter(void 0, void 0, void 0, function* () {
                if (shortLink instanceof client_trello_1.TrelloShortLink) {
                    yield utils.attachPullRequestToTrello(inputs, trello, github, pullRequest, shortLink);
                }
            })));
            break;
        }
        case client_inputs_1.GlobalVerificationStrategy.Comments: {
            const pullRequest = yield github.getPullRequest(inputs.getPullRequestNumber(), inputs.getGithubRepositoryOwner(), inputs.getGitHubRepositoryName());
            const noIdLabels = pullRequest.labels.filter((l) => l.name === 'No Trello');
            if (noIdLabels.length > 0)
                return;
            const shortLinks = pullRequest.comments.map((comment) => ({
                comment,
                shortLink: utils.extractShortLinkFromComment(comment),
            }));
            const trelloShortLinks = shortLinks.filter((shortLink) => shortLink.shortLink instanceof client_trello_1.TrelloShortLink);
            if (trelloShortLinks.length === 0)
                throw new Error((0, errors_1.ERR_NO_VALID_COMMENTS)());
            yield Promise.all(trelloShortLinks.map((sl) => __awaiter(void 0, void 0, void 0, function* () {
                return yield validations.validateCommentContainsTrelloAttachment(sl.shortLink, sl.comment.url, pullRequest.url);
            })));
            break;
        }
        case client_inputs_1.GlobalVerificationStrategy.Disabled:
            break;
    }
    core.info('Pull request validated successfully.');
});
exports.run = run;
