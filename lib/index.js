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
const client_github_1 = require("./client-github");
const client_inputs_1 = require("./client-inputs");
const verification_service_1 = require("./verification-service");
const client_trello_1 = require("./client-trello");
const utils_1 = require("./utils");
const run = (inputs, github, trello) => __awaiter(void 0, void 0, void 0, function* () {
    const service = new verification_service_1.VerificationService(github, inputs, trello);
    core.info('Start GitHub event verification.');
    (0, utils_1.assertSupportedEvent)(github);
    (0, utils_1.assertSupportedAction)(github);
    core.info('Start commit messages verification.');
    switch (inputs.getCommitVerificationStrategy()) {
        case client_inputs_1.CommitVerificationStrategy.AllCommits:
            yield service.assertAllCommitsContainShortLink();
            break;
        case client_inputs_1.CommitVerificationStrategy.Never:
            core.info('Skipping commit verification.');
            break;
    }
    core.info('Start PR title verification.');
    switch (inputs.getTitleVerificationStrategy()) {
        case client_inputs_1.TitleVerificationStrategy.Always:
            yield service.assertTitleContainsShortLink();
            break;
        case client_inputs_1.TitleVerificationStrategy.Never:
            core.info('Skipping title verification.');
            break;
    }
    core.info('PR validated successfully.');
});
exports.run = run;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const inputs = new client_inputs_1.InputsClient();
    const github = new client_github_1.GithubClient(inputs.getGitHubApiToken());
    const trello = new client_trello_1.TrelloClient(inputs.getTrelloApiKey(), inputs.getGitHubApiToken());
    try {
        yield run(inputs, github, trello);
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error);
        }
        else {
            throw error;
        }
    }
}))();
