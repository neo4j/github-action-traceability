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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilsService = void 0;
const core = __importStar(require("@actions/core"));
const client_trello_1 = require("./client-trello");
class UtilsService {
    constructor(inputs) {
        this.inputs = inputs;
    }
    extractTrelloShortLink(description) {
        const pattern = new RegExp(`^\\[([a-zA-Z0-9]+)\\].+`);
        const match = pattern.exec(description);
        if (match !== null) {
            return new client_trello_1.TrelloShortLink(match[1]);
        }
    }
    extractNoIdShortLink(description) {
        const pattern = new RegExp(`^\\[(NOID)\\].+`);
        const match = pattern.exec(description);
        if (match !== null) {
            return new client_trello_1.NoIdShortLink(match[1]);
        }
    }
    extractShortLink(description) {
        core.info(`Extracting short links from "${description}".`);
        const noIdShortLink = this.extractNoIdShortLink(description);
        const trelloShortLink = this.extractTrelloShortLink(description);
        if (noIdShortLink) {
            return noIdShortLink;
        }
        else if (trelloShortLink) {
            return trelloShortLink;
        }
        else {
            throw new Error(`Description "${description}" did not contain a valid short link. Please include one ` +
                'like in the following examples: "[abc123] My work description" or "[NOID] My work description".');
        }
    }
}
exports.UtilsService = UtilsService;
