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
exports.LinearClient = void 0;
exports.fetchLinearAppActorToken = fetchLinearAppActorToken;
const core = __importStar(require("@actions/core"));
const errors_1 = require("./errors");
const LINEAR_GRAPHQL_ENDPOINT = 'https://api.linear.app/graphql';
const LINEAR_OAUTH_TOKEN_ENDPOINT = 'https://api.linear.app/oauth/token';
// `read` is sufficient to query issues and their attachments. Note that an app
// actor token only sees public teams plus any private teams the OAuth app has
// been explicitly granted access to on its details page.
const LINEAR_APP_TOKEN_SCOPE = 'read';
/**
 * Exchanges an OAuth application's client_id/client_secret for a Linear "app
 * actor" access token via the client_credentials grant. The returned token is
 * valid for 30 days and must be sent as `Authorization: Bearer <token>`.
 * Fetched fresh on every run, so the 30-day lifetime never matters in practice.
 */
function fetchLinearAppActorToken(clientId, clientSecret) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info('Requesting Linear app token via client credentials.');
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: LINEAR_APP_TOKEN_SCOPE,
        });
        const response = yield fetch(LINEAR_OAUTH_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error((0, errors_1.ERR_LINEAR_AUTH)());
        }
        if (!response.ok) {
            throw new Error((0, errors_1.ERR_LINEAR_TOKEN_REQUEST)(`HTTP ${response.status}`));
        }
        const json = (yield response.json());
        if (!json.access_token) {
            throw new Error((0, errors_1.ERR_LINEAR_TOKEN_REQUEST)('the response did not include an access_token'));
        }
        return json.access_token;
    });
}
const ISSUE_ATTACHMENTS_QUERY = `
  query IssueAttachments($id: String!) {
    issue(id: $id) {
      id
      attachments(first: 250) {
        nodes { url }
      }
    }
  }
`;
class LinearClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    getIssueAttachmentUrls(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            core.info(`Fetching Linear issue ${identifier}.`);
            const response = yield fetch(LINEAR_GRAPHQL_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: this.apiKey,
                },
                body: JSON.stringify({
                    query: ISSUE_ATTACHMENTS_QUERY,
                    variables: { id: identifier },
                }),
            });
            if (response.status === 401 || response.status === 403) {
                throw new Error((0, errors_1.ERR_LINEAR_AUTH)());
            }
            if (response.status === 429) {
                throw new Error((0, errors_1.ERR_LINEAR_RATE_LIMITED)());
            }
            if (!response.ok) {
                throw new Error(`Linear API returned HTTP ${response.status}.`);
            }
            const body = (yield response.json());
            if ((_a = body.errors) === null || _a === void 0 ? void 0 : _a.length) {
                const notFound = body.errors.some((e) => { var _a; return ((_a = e.extensions) === null || _a === void 0 ? void 0 : _a.type) === 'NotFound' || /not found/i.test(e.message); });
                if (notFound)
                    return null;
                const authFailed = body.errors.some((e) => {
                    var _a;
                    return ((_a = e.extensions) === null || _a === void 0 ? void 0 : _a.code) === 'AUTHENTICATION_ERROR' ||
                        /authentication|forbidden|unauthor/i.test(e.message);
                });
                if (authFailed)
                    throw new Error((0, errors_1.ERR_LINEAR_AUTH)());
                const rateLimited = body.errors.some((e) => { var _a; return ((_a = e.extensions) === null || _a === void 0 ? void 0 : _a.code) === 'RATELIMITED' || /rate limit/i.test(e.message); });
                if (rateLimited)
                    throw new Error((0, errors_1.ERR_LINEAR_RATE_LIMITED)());
                throw new Error(`Linear API error: ${body.errors.map((e) => e.message).join('; ')}`);
            }
            if (!((_b = body.data) === null || _b === void 0 ? void 0 : _b.issue))
                return null;
            return body.data.issue.attachments.nodes.map((n) => n.url);
        });
    }
}
exports.LinearClient = LinearClient;
