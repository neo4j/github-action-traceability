"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERR_UNEXPECTED = exports.ERR_NO_SHORT_LINK = exports.ERR_NO_VALID_COMMENTS = exports.ERR_INPUT_INVALID = exports.ERR_INPUT_NOT_FOUND = exports.ERR_INVALID_NOID = exports.ERR_CLOSED_CARD = exports.ERR_CARD_ATTACHMENT_NOT_FOUND = exports.ERR_CARD_ATTACHMENT_POST_API = exports.ERR_CARD_ATTACHMENT_GET_API = exports.ERR_CARD_NOT_FOUND = exports.ERR_CARD_GET_API = void 0;
const ERR_CARD_GET_API = (status) => `GET Trello card returned ${status}`;
exports.ERR_CARD_GET_API = ERR_CARD_GET_API;
const ERR_CARD_NOT_FOUND = (shortLink) => `Unable to get Trello card ${shortLink}.`;
exports.ERR_CARD_NOT_FOUND = ERR_CARD_NOT_FOUND;
const ERR_CARD_ATTACHMENT_GET_API = (status) => `GET Trello card attachments returned ${status}.`;
exports.ERR_CARD_ATTACHMENT_GET_API = ERR_CARD_ATTACHMENT_GET_API;
const ERR_CARD_ATTACHMENT_POST_API = (status) => `POST Trello card attachment returned ${status}`;
exports.ERR_CARD_ATTACHMENT_POST_API = ERR_CARD_ATTACHMENT_POST_API;
const ERR_CARD_ATTACHMENT_NOT_FOUND = (shortLink) => `Unable to get attachment for Trello card ${shortLink}.`;
exports.ERR_CARD_ATTACHMENT_NOT_FOUND = ERR_CARD_ATTACHMENT_NOT_FOUND;
const ERR_CLOSED_CARD = (shortLink) => `Trello card "${shortLink}" needs to be in an open state, but it is currently marked as closed.`;
exports.ERR_CLOSED_CARD = ERR_CLOSED_CARD;
const ERR_INVALID_NOID = (shortLinkId) => `Unexpected NOID short link "${shortLinkId}". Only Trello short links are allowed in your project, please provide one in the form of "[a2bd4d] My change description".`;
exports.ERR_INVALID_NOID = ERR_INVALID_NOID;
const ERR_INPUT_NOT_FOUND = (input) => `Input not found "${input}".`;
exports.ERR_INPUT_NOT_FOUND = ERR_INPUT_NOT_FOUND;
const ERR_INPUT_INVALID = (input, value) => `Unrecognised value ${value} for input "${input}".`;
exports.ERR_INPUT_INVALID = ERR_INPUT_INVALID;
const ERR_NO_VALID_COMMENTS = () => `There were no comments in this PR that contained a valid Trello URL. This is likely either intentional or because you forgot to attach this PR to a Trello card. In order for this CI check to pass, you need to either attach this PR to a Trello card, or to label your PR with the 'No Trello' label.`;
exports.ERR_NO_VALID_COMMENTS = ERR_NO_VALID_COMMENTS;
const ERR_NO_SHORT_LINK = (description) => `Description "${description}" did not contain a valid short link. Please include one like in the following examples: "[abc123] My work description" or "[NOID] My work description".`;
exports.ERR_NO_SHORT_LINK = ERR_NO_SHORT_LINK;
const ERR_UNEXPECTED = (error) => `Unexpected: ${error}`;
exports.ERR_UNEXPECTED = ERR_UNEXPECTED;
