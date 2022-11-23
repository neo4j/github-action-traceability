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
exports.addUrlAttachmentToCard = exports.getCardAttachments = exports.getCard = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("./utils");
const buildApiUrl = (path, query) => {
    const params = query ? query : new URLSearchParams();
    const apiKey = (0, utils_1.getTrelloApiKey)();
    const apiToken = (0, utils_1.getTrelloApiToken)();
    if (!apiKey || !apiToken) {
        throw Error('Trello API key and/or token ID is missing.');
    }
    params.append('key', apiKey);
    params.append('token', apiToken);
    return `https://api.trello.com/1${path}?${params.toString()}`;
};
// https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/#authorizing-a-client
const apiBaseHeaders = () => {
    return {
        Accept: 'application/json',
        method: 'GET',
    };
};
// https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get
const getCard = (shortLink) => {
    const path = `/cards/${shortLink}`;
    const options = Object.assign({}, apiBaseHeaders());
    return (0, node_fetch_1.default)(buildApiUrl(path), options)
        .then((response) => __awaiter(void 0, void 0, void 0, function* () {
        if (!response.ok) {
            throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
        }
        return (yield response.json());
    }))
        .catch((error) => error);
};
exports.getCard = getCard;
// https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-get
const getCardAttachments = (shortLink) => {
    const path = `/cards/${shortLink}/attachments`;
    const options = Object.assign({}, apiBaseHeaders());
    return (0, node_fetch_1.default)(buildApiUrl(path), options)
        .then((response) => __awaiter(void 0, void 0, void 0, function* () {
        if (!response.ok) {
            throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
        }
        return (yield response.json());
    }))
        .catch((error) => error);
};
exports.getCardAttachments = getCardAttachments;
// https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-post
const addUrlAttachmentToCard = (shortLink, attachmentUrl) => {
    const path = `/cards/${shortLink}/attachments`;
    const options = Object.assign(Object.assign({}, apiBaseHeaders()), { method: 'POST' });
    const queryParams = new URLSearchParams();
    queryParams.append('url', attachmentUrl);
    return (0, node_fetch_1.default)(buildApiUrl(path, queryParams), options)
        .then((response) => __awaiter(void 0, void 0, void 0, function* () {
        if (!response.ok) {
            throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
        }
        return (yield response.json());
    }))
        .catch((error) => error);
};
exports.addUrlAttachmentToCard = addUrlAttachmentToCard;
//# sourceMappingURL=api-trello.js.map