"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrelloClientBuilder = void 0;
class TrelloClientBuilder {
    constructor() {
        this.cards = {};
        this.cardAttachments = {};
        this.cards = {};
        this.cardAttachments = {};
    }
    withCard(shortLink, closed) {
        this.cards[shortLink] = { shortLink, closed };
        this.cardAttachments[shortLink] = [];
        return this;
    }
    withCardAttachment(shortLink, urlAttachment) {
        if (!this.cards[shortLink])
            this.cards[shortLink] = { shortLink, closed: false };
        if (!this.cardAttachments[shortLink])
            this.cardAttachments[shortLink] = [];
        this.cardAttachments[shortLink].push({ shortLink, url: urlAttachment });
        return this;
    }
    build() {
        return new DummyTrelloClient(this.cards, this.cardAttachments);
    }
}
exports.TrelloClientBuilder = TrelloClientBuilder;
class DummyTrelloClient {
    constructor(cards, cardAttachments) {
        this.cards = cards;
        this.cardAttachments = cardAttachments;
    }
    addUrlAttachmentToCard(shortLink, urlAttachment) {
        const attachments = this.cardAttachments[shortLink];
        const attachment = { shortLink, url: urlAttachment };
        if (attachments === undefined)
            throw new Error('Card does not exist.');
        attachments.push(attachment);
        return Promise.resolve(attachment);
    }
    getCard(shortLink) {
        const card = this.cards[shortLink];
        if (card === undefined)
            throw new Error('Card does not exist.');
        return Promise.resolve(card);
    }
    getCardAttachments(shortLink) {
        const attachments = this.cardAttachments[shortLink];
        if (attachments === undefined)
            throw new Error('Card does not exist.');
        return Promise.resolve(attachments);
    }
}
