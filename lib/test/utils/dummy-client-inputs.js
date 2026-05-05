"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputsClientBuilder = void 0;
const client_inputs_1 = require("../../src/client-inputs");
class InputsClientBuilder {
    constructor() {
        this.globalVerificationStrategy = client_inputs_1.GlobalVerificationStrategy.Linked;
        this.linearApiKey = 'fake-linear-api-key';
    }
    withGlobalVerificationStrategy(strategy) {
        this.globalVerificationStrategy = strategy;
        return this;
    }
    withLinearApiKey(key) {
        this.linearApiKey = key;
        return this;
    }
    build() {
        return new DummyInputsClient(this.globalVerificationStrategy, this.linearApiKey);
    }
}
exports.InputsClientBuilder = InputsClientBuilder;
class DummyInputsClient {
    constructor(globalVerificationStrategy, linearApiKey) {
        this.globalVerificationStrategy = globalVerificationStrategy;
        this.linearApiKey = linearApiKey;
    }
    getGlobalVerificationStrategy() {
        return this.globalVerificationStrategy;
    }
    getGitHubApiToken() {
        return '';
    }
    getLinearApiKey() {
        return this.linearApiKey;
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
