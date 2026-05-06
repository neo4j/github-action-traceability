"use strict";
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
exports.LinearClientBuilder = void 0;
const errors_1 = require("../../src/errors");
class LinearClientBuilder {
    constructor() {
        this.issues = new Map();
        this.authFails = false;
    }
    withExistingIssue(identifier, attachmentUrls = []) {
        this.issues.set(identifier, attachmentUrls);
        return this;
    }
    withAttachedPullRequest(identifier, prUrl) {
        var _a;
        const existing = (_a = this.issues.get(identifier)) !== null && _a !== void 0 ? _a : [];
        this.issues.set(identifier, [...existing, prUrl]);
        return this;
    }
    withAuthFailure() {
        this.authFails = true;
        return this;
    }
    /**
     * Simulates Linear's processing latency: the issue exists from attempt 1, but the
     * given PR URL only appears among its attachments starting at the specified attempt
     * (1-indexed). Use to drive retry-loop tests in run.ts.
     */
    withAttachmentRegisteredOnAttempt(identifier, prUrl, attempt) {
        if (!this.issues.has(identifier))
            this.issues.set(identifier, []);
        this.attachOnAttempt = { identifier, prUrl, attempt };
        return this;
    }
    build() {
        return new DummyLinearClient(this.issues, this.authFails, this.attachOnAttempt);
    }
}
exports.LinearClientBuilder = LinearClientBuilder;
class DummyLinearClient {
    constructor(issues, authFails, attachOnAttempt) {
        this.issues = issues;
        this.authFails = authFails;
        this.attachOnAttempt = attachOnAttempt;
        this.callCounts = new Map();
    }
    getIssueAttachmentUrls(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.authFails) {
                throw new Error((0, errors_1.ERR_LINEAR_AUTH)());
            }
            const baseUrls = this.issues.get(identifier);
            if (baseUrls === undefined)
                return null;
            const callCount = ((_a = this.callCounts.get(identifier)) !== null && _a !== void 0 ? _a : 0) + 1;
            this.callCounts.set(identifier, callCount);
            if (this.attachOnAttempt &&
                this.attachOnAttempt.identifier === identifier &&
                callCount >= this.attachOnAttempt.attempt) {
                return [...baseUrls, this.attachOnAttempt.prUrl];
            }
            return [...baseUrls];
        });
    }
}
