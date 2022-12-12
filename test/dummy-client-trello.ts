import { TrelloAttachment, TrelloCard, TrelloClientI } from '../src/client-trello';

class TrelloClientBuilder {
  cards: Record<string, TrelloCard> = {};
  cardAttachments: Record<string, TrelloAttachment[]> = {};

  constructor() {
    this.cards = {};
    this.cardAttachments = {};
  }

  public withCard(shortLink: string, closed: boolean): TrelloClientBuilder {
    this.cards[shortLink] = { shortLink, closed };
    this.cardAttachments[shortLink] = [];
    return this;
  }

  public withCardAttachment(shortLink: string, urlAttachment: string): TrelloClientBuilder {
    if (!this.cards[shortLink]) this.cards[shortLink] = { shortLink, closed: false };
    if (!this.cardAttachments[shortLink]) this.cardAttachments[shortLink] = [];
    this.cardAttachments[shortLink].push({ shortLink, url: urlAttachment });
    return this;
  }

  public build(): TrelloClientI {
    return new DummyTrelloClient(this.cards, this.cardAttachments);
  }
}

class DummyTrelloClient implements TrelloClientI {
  cards: Record<string, TrelloCard>;
  cardAttachments: Record<string, TrelloAttachment[]>;

  constructor(
    cards: Record<string, TrelloCard>,
    cardAttachments: Record<string, TrelloAttachment[]>,
  ) {
    this.cards = cards;
    this.cardAttachments = cardAttachments;
  }

  addUrlAttachmentToCard(shortLink: string, urlAttachment: string): Promise<TrelloAttachment> {
    const attachments = this.cardAttachments[shortLink];
    const attachment = { shortLink, url: urlAttachment };
    if (attachments === undefined) throw new Error('Card does not exist.');
    attachments.push(attachment);
    return Promise.resolve(attachment);
  }

  getCard(shortLink: string): Promise<TrelloCard> {
    const card = this.cards[shortLink];
    if (card === undefined) throw new Error('Card does not exist.');
    return Promise.resolve(card);
  }

  getCardAttachments(shortLink: string): Promise<TrelloAttachment[]> {
    const attachments = this.cardAttachments[shortLink];
    if (attachments === undefined) throw new Error('Card does not exist.');
    return Promise.resolve(attachments);
  }
}

export { TrelloClientBuilder };
