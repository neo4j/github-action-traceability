"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputsClientBuilder = void 0;
const client_inputs_1 = require("../../src/client-inputs");
class InputsClientBuilder {
    constructor() {
        this.globalVerificationStrategy = client_inputs_1.GlobalVerificationStrategy.Commits;
        this.shortLinkVerificationStrategy = client_inputs_1.ShortLinkVerificationStrategy.TrelloOrNoId;
    }
    withGlobalVerificationStrategy(strategy) {
        this.globalVerificationStrategy = strategy;
        return this;
    }
    withShortLinkVerificationStrategy(strategy) {
        this.shortLinkVerificationStrategy = strategy;
        return this;
    }
    build() {
        return new DummyInputsClient(this.globalVerificationStrategy, this.shortLinkVerificationStrategy);
    }
}
exports.InputsClientBuilder = InputsClientBuilder;
class DummyInputsClient {
    constructor(globalVerificationStrategy, shortLinkVerificationStrategy) {
        this.globalVerificationStrategy = globalVerificationStrategy;
        this.shortLinkVerificationStrategy = shortLinkVerificationStrategy;
    }
    getGlobalVerificationStrategy() {
        return this.globalVerificationStrategy;
    }
    getShortLinkVerificationStrategy() {
        return this.shortLinkVerificationStrategy;
    }
    getGitHubApiToken() {
        return '';
    }
    getTrelloApiKey() {
        return '';
    }
    getTrelloApiToken() {
        return '';
    }
    getGithubRepositoryOwner() {
        return '';
    }
    getGitHubRepositoryName() {
        return '';
    }
    getPullRequestNumber() {
        return -1;
    }
}
