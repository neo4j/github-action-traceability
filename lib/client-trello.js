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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrelloClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
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
            const path = `/cards/${shortLink}`;
            const options = Object.assign({}, this.apiBaseHeaders);
            return (0, node_fetch_1.default)(this.buildApiUrl(path), options)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (!response.ok) {
                    throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
                }
                return (yield response.json());
            }))
                .catch((error) => error);
        });
    }
    // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-get
    getCardAttachments(shortLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `/cards/${shortLink}/attachments`;
            const options = Object.assign({}, this.apiBaseHeaders);
            return (0, node_fetch_1.default)(this.buildApiUrl(path), options)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (!response.ok) {
                    throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
                }
                return (yield response.json());
            }))
                .catch((error) => error);
        });
    }
    // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-post
    addUrlAttachmentToCard(shortLink, attachmentUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const path = `/cards/${shortLink}/attachments`;
            const options = Object.assign(Object.assign({}, this.apiBaseHeaders), { method: 'POST' });
            const queryParams = new URLSearchParams();
            queryParams.append('url', attachmentUrl);
            return (0, node_fetch_1.default)(this.buildApiUrl(path, queryParams), options)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (!response.ok) {
                    throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
                }
                return (yield response.json());
            }))
                .catch((error) => error);
        });
    }
}
exports.TrelloClient = TrelloClient;
