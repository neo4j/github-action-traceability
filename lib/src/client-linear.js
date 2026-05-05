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
const core = __importStar(require("@actions/core"));
const sdk_1 = require("@linear/sdk");
const errors_1 = require("./errors");
class LinearClient {
    constructor(apiKey) {
        this.sdk = new sdk_1.LinearClient({ apiKey });
    }
    getIssueAttachmentUrls(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info(`Fetching Linear issue ${identifier}.`);
            let issue;
            try {
                issue = yield this.sdk.issue(identifier);
            }
            catch (error) {
                this.rethrowFatal(error);
                return null;
            }
            if (!(issue === null || issue === void 0 ? void 0 : issue.id))
                return null;
            const attachments = yield issue.attachments();
            return attachments.nodes.map((a) => a.url);
        });
    }
    rethrowFatal(error) {
        if (error instanceof sdk_1.AuthenticationLinearError || error instanceof sdk_1.ForbiddenLinearError) {
            throw new Error((0, errors_1.ERR_LINEAR_AUTH)());
        }
        if (error instanceof sdk_1.RatelimitedLinearError) {
            throw new Error((0, errors_1.ERR_LINEAR_RATE_LIMITED)());
        }
    }
}
exports.LinearClient = LinearClient;
