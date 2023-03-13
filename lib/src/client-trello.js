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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrelloClient = exports.TrelloShortLink = exports.NoIdShortLink = exports.ShortLink = void 0;
const core = __importStar(require("@actions/core"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const errors_1 = require("./errors");
class ShortLink {
    constructor(id) {
        this.id = id;
    }
}
exports.ShortLink = ShortLink;
class NoIdShortLink extends ShortLink {
    constructor(id) {
        super(id);
    }
}
exports.NoIdShortLink = NoIdShortLink;
class TrelloShortLink extends ShortLink {
    constructor(id) {
        super(id);
    }
}
exports.TrelloShortLink = TrelloShortLink;
class TrelloClient {
    constructor(apiKey, apiToken) {
        this.apiKey = apiKey;
        this.apiToken = apiToken;
        this.apiBaseHeaders = {
            Accept: 'application/json',
            method: 'GET',
        };
    }
    // https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/#authorizing-a-client
    buildApiUrl(path, query) {
        const params = query ? query : new URLSearchParams();
        params.append('key', this.apiKey);
        params.append('token', this.apiToken);
        return `https://api.trello.com/1${path}?${params.toString()}`;
    }
    // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get
    getCard(shortLink) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info('Get Trello card.');
            const path = `/cards/${shortLink}`;
            const options = Object.assign({}, this.apiBaseHeaders);
            return (0, node_fetch_1.default)(this.buildApiUrl(path), options)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (!response.ok) {
                    throw new Error((0, errors_1.ERR_CARD_GET_API)(response.status));
                }
                return (yield response.json());
            }))
                .catch(() => {
                throw new Error((0, errors_1.ERR_CARD_NOT_FOUND)(shortLink));
            });
        });
    }
    // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-get
    getCardAttachments(shortLink) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info('Get Trello card attachments.');
            const path = `/cards/${shortLink}/attachments`;
            const options = Object.assign({}, this.apiBaseHeaders);
            return (0, node_fetch_1.default)(this.buildApiUrl(path), options)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (!response.ok) {
                    throw new Error((0, errors_1.ERR_CARD_ATTACHMENT_GET_API)(response.status));
                }
                return (yield response.json());
            }))
                .catch(() => {
                throw new Error((0, errors_1.ERR_CARD_ATTACHMENT_NOT_FOUND)(shortLink));
            });
        });
    }
    // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-post
    addUrlAttachmentToCard(shortLink, attachmentUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            core.info('Add attachment to Trello card.');
            const path = `/cards/${shortLink}/attachments`;
            const options = Object.assign(Object.assign({}, this.apiBaseHeaders), { method: 'POST' });
            const queryParams = new URLSearchParams();
            queryParams.append('url', attachmentUrl);
            return (0, node_fetch_1.default)(this.buildApiUrl(path, queryParams), options)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (!response.ok) {
                    throw new Error((0, errors_1.ERR_CARD_ATTACHMENT_POST_API)(response.status));
                }
                return (yield response.json());
            }))
                .catch((error) => error);
        });
    }
}
exports.TrelloClient = TrelloClient;
