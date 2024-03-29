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
exports.ValidationsService = void 0;
const client_trello_1 = require("./client-trello");
const core = __importStar(require("@actions/core"));
const errors_1 = require("./errors");
class ValidationsService {
    constructor(trello) {
        this.trello = trello;
    }
    validateExclusivelyTrelloShortLinks(shortLinks) {
        core.info('Verify short links only contain Trello short links.');
        shortLinks.forEach((shortLink) => {
            if (shortLink instanceof client_trello_1.NoIdShortLink) {
                throw new Error((0, errors_1.ERR_INVALID_NOID)(shortLink.id));
            }
        });
    }
    validateCardOpen(card) {
        core.info('Verify Trello card is open.');
        if (card.closed) {
            throw new Error((0, errors_1.ERR_CLOSED_CARD)(card.shortLink));
        }
    }
}
exports.ValidationsService = ValidationsService;
