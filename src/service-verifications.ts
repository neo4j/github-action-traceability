import { InputsClientI, NoIdVerificationStrategy } from './client-inputs';
import { TrelloCard, TrelloClientI } from './client-trello';
import { GithubClientI } from './client-github';
import * as core from '@actions/core';

class VerificationsService {
  inputs: InputsClientI;
  trello: TrelloClientI;
  github: GithubClientI;

  constructor(github: GithubClientI, inputs: InputsClientI, trello: TrelloClientI) {
    this.github = github;
    this.inputs = inputs;
    this.trello = trello;
  }

  private extractTrelloShortLink(commitMessage: string): string {
    const REGEX_TRELLO_SHORT_LINK = new RegExp('^\\[([a-z0-9]+|NOID)\\].+');
    const match = REGEX_TRELLO_SHORT_LINK.exec(commitMessage);

    if (match === null)
      throw new Error(
        `Commit message ${commitMessage} does not contain a valid trello short link.`,
      );

    return match[1];
  }

  private assertAllShortLinksAreIdentical(shortLinks: string[]): void {
    if (shortLinks.length === 0) return;

    const head = shortLinks[0];
    shortLinks.forEach((shortLink) => {
      if (shortLink !== head) {
        throw new Error('');
      }
    });
  }

  private assertCardNotClosed(card: TrelloCard): void {
    if (card.closed) throw new Error(`Expected card ${card.shortLink} to not be closed.`);
  }

  assertNoIdShortLinkStrategy(
    strategy: NoIdVerificationStrategy,
    trelloShortLinks: string[],
  ): void {
    const REGEX_TRELLO_NOID_CASE_INSENSITIVE = new RegExp('^\\[NOID\\]', 'i');
    const REGEX_TRELLO_NOID_UPPERCASE = new RegExp('^\\[NOID\\]');
    const REGEX_TRELLO_NOID_LOWERCASE = new RegExp('^\\[noid\\]');

    trelloShortLinks.forEach((trelloShortLink) => {
      switch (strategy) {
        case NoIdVerificationStrategy.CASE_INSENSITIVE:
          return;
        case NoIdVerificationStrategy.UPPER_CASE:
          if (
            REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
            !REGEX_TRELLO_NOID_UPPERCASE.test(trelloShortLink)
          ) {
            throw new Error(`NOID short link needed to be upper case but was ${trelloShortLink}`);
          }
          return;
        case NoIdVerificationStrategy.LOWER_CASE:
          if (
            REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink) &&
            !REGEX_TRELLO_NOID_LOWERCASE.test(trelloShortLink)
          ) {
            throw new Error(`NOID short link needed to be lower case but was ${trelloShortLink}`);
          }
          return;
        case NoIdVerificationStrategy.NEVER:
          if (REGEX_TRELLO_NOID_CASE_INSENSITIVE.test(trelloShortLink)) {
            throw new Error(`NOID short link is not allowed.`);
          }
          return;
      }
    });
  }

  async assertAllCommitsContainShortLink(): Promise<void> {
    const pullRequestUrl = this.github.getPullRequestUrl();
    const commitMessages = await this.github.getPullRequestCommitMessages();
    const commitMessageShortLinks = commitMessages.map(this.extractTrelloShortLink);
    this.assertAllShortLinksAreIdentical(commitMessageShortLinks);
    this.assertNoIdShortLinkStrategy(
      this.inputs.getNoIdVerificationStrategy(),
      commitMessageShortLinks,
    );

    const shortLink = commitMessageShortLinks[0];
    const card = await this.trello.getCard(shortLink);
    this.assertCardNotClosed(card);

    const attachments = await this.trello.getCardAttachments(shortLink);
    if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
      core.info('Trello card already has an attachment for this pull request. Skipping');
    } else {
      await this.trello.addUrlAttachmentToCard(shortLink, pullRequestUrl);
    }
  }

  async assertTitleContainsShortLink(): Promise<void> {
    const pullRequestUrl = this.github.getPullRequestUrl();
    const pullRequestTitle = this.github.getPullRequestTitle();
    const titleShortLink = this.extractTrelloShortLink(pullRequestTitle);
    this.assertNoIdShortLinkStrategy(this.inputs.getNoIdVerificationStrategy(), [titleShortLink]);

    const card = await this.trello.getCard(titleShortLink);
    this.assertCardNotClosed(card);

    const attachments = await this.trello.getCardAttachments(titleShortLink);
    if (attachments.find((attachment) => attachment.url === pullRequestUrl)) {
      core.info('Trello card already has an attachment for this pull request. Skipping');
    } else {
      await this.trello.addUrlAttachmentToCard(titleShortLink, pullRequestUrl);
    }
    return;
  }
}

export { VerificationsService };
