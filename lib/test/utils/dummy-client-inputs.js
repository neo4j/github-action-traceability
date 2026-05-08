"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputsClientBuilder = void 0;
const client_inputs_1 = require("../../src/client-inputs");
class InputsClientBuilder {
    constructor() {
        this.globalVerificationStrategy = client_inputs_1.GlobalVerificationStrategy.Linked;
        this.linearApiKey = 'fake-linear-api-key';
        this.targetBranches = [];
    }
    withGlobalVerificationStrategy(strategy) {
        this.globalVerificationStrategy = strategy;
        return this;
    }
    withLinearApiKey(key) {
        this.linearApiKey = key;
        return this;
    }
    withTargetBranches(branches) {
        this.targetBranches = branches;
        return this;
    }
    build() {
        return new DummyInputsClient(this.globalVerificationStrategy, this.linearApiKey, this.targetBranches);
    }
}
exports.InputsClientBuilder = InputsClientBuilder;
class DummyInputsClient {
    constructor(globalVerificationStrategy, linearApiKey, targetBranches) {
        this.globalVerificationStrategy = globalVerificationStrategy;
        this.linearApiKey = linearApiKey;
        this.targetBranches = targetBranches;
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
    getTargetBranches() {
        return this.targetBranches;
    }
}
