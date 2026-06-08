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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const errors_1 = require("./errors");
const ISSUE_ID_PATTERN = /[A-Z]+-\d+/g;
const NOID_TITLE_PATTERN = /^\s*\[NOID\]/i;
const NO_LINEAR_LABEL = 'no linear';
const ATTACHMENT_RETRY_DELAYS_MS = [0, 5000, 10000, 15000];
const run = (inputs_1, github_1, linearFactory_1, ...args_1) => __awaiter(void 0, [inputs_1, github_1, linearFactory_1, ...args_1], void 0, function* (inputs, github, linearFactory, retryDelaysMs = ATTACHMENT_RETRY_DELAYS_MS) {
    const strategy = inputs.getGlobalVerificationStrategy();
    if (strategy === client_inputs_1.GlobalVerificationStrategy.Disabled) {
        core.info('global_verification_strategy is disabled; skipping checks.');
        return;
    }
    const pullRequest = yield github.getPullRequest(inputs.getPullRequestNumber(), inputs.getGithubRepositoryOwner(), inputs.getGitHubRepositoryName());
    const targetBranches = inputs.getTargetBranches();
    if (targetBranches.length > 0 && !targetBranches.includes(pullRequest.baseRefName)) {
        core.info(`Pull request base branch "${pullRequest.baseRefName}" is not in target_branches (${targetBranches.join(', ')}); skipping checks.`);
        return;
    }
    const optOutReason = getOptOutReason(pullRequest);
    if (optOutReason) {
        core.info(`Pull request is opted out of Linear traceability checks via ${optOutReason}.`);
        return;
    }
    const candidateIds = extractIssueIds(pullRequest);
    if (candidateIds.length === 0) {
        throw new Error((0, errors_1.ERR_NO_ISSUE_REFERENCE)());
    }
    core.info(`Candidate Linear issue IDs: ${candidateIds.join(', ')}.`);
    const linear = yield linearFactory();
    const prUrl = normalizeUrl(pullRequest.url);
    let existingIds = [];
    for (let attempt = 0; attempt < retryDelaysMs.length; attempt++) {
        if (retryDelaysMs[attempt] > 0) {
            core.info(`Linear attachment not yet registered; retrying in ${retryDelaysMs[attempt]}ms.`);
            yield sleep(retryDelaysMs[attempt]);
        }
        const results = yield Promise.all(candidateIds.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            const urls = yield linear.getIssueAttachmentUrls(id);
            return { id, urls };
        })));
        existingIds = results.filter((r) => r.urls !== null).map((r) => r.id);
        if (existingIds.length === 0) {
            throw new Error((0, errors_1.ERR_ISSUE_NOT_FOUND)(candidateIds));
        }
        const attachedIssue = results.find((r) => r.urls !== null && r.urls.some((u) => normalizeUrl(u) === prUrl));
        if (attachedIssue) {
            core.info(`Pull request is attached to Linear issue ${attachedIssue.id}.`);
            return;
        }
    }
    throw new Error((0, errors_1.ERR_ATTACHMENT_NOT_FOUND)(existingIds, pullRequest.url));
});
exports.run = run;
const getOptOutReason = (pullRequest) => {
    if (pullRequest.labels.some((l) => l.name.trim().toLowerCase() === NO_LINEAR_LABEL)) {
        return `the "No Linear" label`;
    }
    if (NOID_TITLE_PATTERN.test(pullRequest.title)) {
        return `the [NOID] title prefix`;
    }
    return null;
};
const extractIssueIds = (pullRequest) => {
    var _a, _b;
    const haystack = [
        pullRequest.title,
        (_a = pullRequest.body) !== null && _a !== void 0 ? _a : '',
        pullRequest.headRefName.toUpperCase(),
    ].join('\n');
    const matches = (_b = haystack.match(ISSUE_ID_PATTERN)) !== null && _b !== void 0 ? _b : [];
    return Array.from(new Set(matches));
};
const normalizeUrl = (url) => url.toLowerCase().replace(/\/+$/, '');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
