"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputsClientBuilder = void 0;
const client_inputs_1 = require("../../src/client-inputs");
class InputsClientBuilder {
    constructor() {
        this.globalVerificationStrategy = client_inputs_1.GlobalVerificationStrategy.Commits;
    }
    withGlobalVerificationStrategy(strategy) {
        this.globalVerificationStrategy = strategy;
        return this;
    }
    build() {
        return new DummyInputsClient(this.globalVerificationStrategy);
    }
}
exports.InputsClientBuilder = InputsClientBuilder;
class DummyInputsClient {
    constructor(globalVerificationStrategy) {
        this.globalVerificationStrategy = globalVerificationStrategy;
    }
    getGlobalVerificationStrategy() {
        return this.globalVerificationStrategy;
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
