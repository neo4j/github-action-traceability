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
exports.resolveLinearAuthorization = resolveLinearAuthorization;
const core = __importStar(require("@actions/core"));
const client_linear_1 = require("./client-linear");
const errors_1 = require("./errors");
/**
 * Resolves the value for the Linear `Authorization` header from the configured
 * credentials. Prefers OAuth client credentials — these are minted fresh on
 * every run, so the 30-day app-actor token lifetime never bites — and falls
 * back to a static personal API key. Personal API keys are sent verbatim; app
 * actor tokens require a `Bearer` prefix.
 */
function resolveLinearAuthorization(inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = inputs.getLinearClientId();
        const clientSecret = inputs.getLinearClientSecret();
        // Half-configured client credentials are always a mistake: an unset GitHub
        // secret expands to an empty string, so a typo in the secret name would
        // otherwise fall through to the personal API key (or to a misleading "no
        // credential configured" error) instead of naming the real problem.
        if (clientId && !clientSecret) {
            throw new Error((0, errors_1.ERR_PARTIAL_LINEAR_CLIENT_CREDENTIALS)('linear_client_secret'));
        }
        if (clientSecret && !clientId) {
            throw new Error((0, errors_1.ERR_PARTIAL_LINEAR_CLIENT_CREDENTIALS)('linear_client_id'));
        }
        if (clientId && clientSecret) {
            core.info('Authenticating to Linear with OAuth client credentials.');
            const token = yield (0, client_linear_1.fetchLinearAppActorToken)(clientId, clientSecret);
            // The runner only masks values it received as `secrets.*`. This token is
            // minted at runtime, so it is unknown to the log masker until we register
            // it — without this, any future log line or stack trace carrying the token
            // would print a live 30-day workspace credential in plaintext.
            core.setSecret(token);
            return `Bearer ${token}`;
        }
        const apiKey = inputs.getLinearApiKey();
        if (apiKey) {
            core.info('Authenticating to Linear with a personal API key.');
            return apiKey;
        }
        throw new Error((0, errors_1.ERR_NO_LINEAR_AUTH)());
    });
}
