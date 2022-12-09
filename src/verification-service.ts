import { InputsClientI, NoIdVerificationStrategy } from './client-inputs';
import { TrelloCard, TrelloClientI } from './client-trello';
import { ChangeDescriptionType, GithubClientI } from './client-github';
import * as core from '@actions/core';

class VerificationService {
  inputs: InputsClientI;
  trello: TrelloClientI;
  github: GithubClientI;

  constructor(github: GithubClientI, inputs: InputsClientI, trello: TrelloClientI) {
    this.github = github;
    this.inputs = inputs;
    this.trello = trello;
  }

  private extractTrelloShortLink(
    description: string,
    descriptionType: ChangeDescriptionType,
  ): string {
    const REGEX_TRELLO_SHORT_LINK = new RegExp('^\\[([a-z0-9]+|NOID)\\].+', 'i');
    const match = REGEX_TRELLO_SHORT_LINK.exec(description);

    if (match === null) {
      switch (descriptionType) {
        case ChangeDescriptionType.Title:
          throw new Error(
            `PR title "${description}" did not contain a valid trello short link. Please include one ` +
              'like in the following examples: "[abc123] My work description" or "[NOID] My work description"',
          );
        case ChangeDescriptionType.CommitMessage:
          throw new Error(
            `Commit message "${description}" did not contain a valid trello short link. Please include one ` +
              'like in the following examples: "[abc123] My work description" or "[NOID] My work description"',
          );
      }
    }
    return match[1];
  }

  private assertAtLeastOneShortLink(
    shortLinks: string[],
    descriptionType: ChangeDescriptionType,
  ): void {
    if (shortLinks.length === 0) {
      switch (descriptionType) {
        case ChangeDescriptionType.Title:
          throw new Error(
            'A Trello short link is missing from the title in your PR. Please include one ' +
              'like in the following examples: "[abc123] My work description" or "[NOID] My work description"',
          );
        case ChangeDescriptionType.CommitMessage:
          throw new Error(
            'A Trello short link is missing from all commits in your PR. Please include at least one ' +
              'like the following examples: "[abc123] My work description" or "[NOID] My work description"',
          );
      }
    }
  }

  private assertAllShortLinksAreIdentical(shortLinks: string[]): void {
    if (shortLinks.length === 0) return;

    const head = shortLinks[0];
    shortLinks.forEach((shortLink: string) => {
      if (shortLink !== head) {
        throw new Error(
          `Your PR contained Trello short links that did not match: "${head}" and "${shortLink}" differ. ` +
            'You cannot currently include more than one Trello card per PR. But please reach out to me if this is ' +
            'something your team needs, you savages.',
        );
      }
    });
  }

  private assertCardNotClosed(card: TrelloCard): void {
    if (card.closed) {
      throw new Error(
        `Trello card "${card.shortLink}" needs to be in an open state, ` +
          'but it is currently marked as closed.',
      );
    }
  }

  assertNoIdShortLinkStrategy(strategy: NoIdVerificationStrategy, shortLinks: string[]): void {
    const REGEX_TRELLO_NOID_ANYCASE = new RegExp('^NOID$', 'i');
    const REGEX_TRELLO_NOID_UPPERCASE = new RegExp('^NOID$');
    const REGEX_TRELLO_NOID_LOWERCASE = new RegExp('^noid$');

    shortLinks.forEach((shortLink) => {
      switch (strategy) {
        case NoIdVerificationStrategy.AnyCase:
          return;
        case NoIdVerificationStrategy.UpperCase:
          if (
            REGEX_TRELLO_NOID_ANYCASE.test(shortLink) &&
            REGEX_TRELLO_NOID_LOWERCASE.test(shortLink)
          ) {
            throw new Error(`NOID short link needed to be upper case but was "${shortLink}"`);
          }
          return;
        case NoIdVerificationStrategy.LowerCase:
          if (
            REGEX_TRELLO_NOID_ANYCASE.test(shortLink) &&
            REGEX_TRELLO_NOID_UPPERCASE.test(shortLink)
          ) {
            throw new Error(`NOID short link needed to be lower case but was "${shortLink}"`);
          }
          return;
        case NoIdVerificationStrategy.Never:
          if (REGEX_TRELLO_NOID_ANYCASE.test(shortLink)) {
            throw new Error(
              'This PR should not include any NOID short links. If you need this functionality please enable it ' +
                'via the "noid_verification_strategy" setting for this Github Action',
            );
          }
          return;
      }
    });
  }

  async assertAllCommitsContainShortLink(): Promise<void> {
    const pullRequestUrl = this.github.getPullRequestUrl();
    const commitMessages = await this.github.getPullRequestCommitMessages();
    const commitMessageShortLinks = commitMessages.map((msg) =>
      this.extractTrelloShortLink(msg, ChangeDescriptionType.CommitMessage),
    );
    this.assertAtLeastOneShortLink(commitMessageShortLinks, ChangeDescriptionType.CommitMessage);
    this.assertAllShortLinksAreIdentical(commitMessageShortLinks);
    this.assertNoIdShortLinkStrategy(
      this.inputs.getNoIdVerificationStrategy(),
      commitMessageShortLinks,
    );

    const shortLink = commitMessageShortLinks[0];
    if (shortLink.toUpperCase() === 'NOID') {
      return;
    }
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
    const titleShortLink = this.extractTrelloShortLink(
      pullRequestTitle,
      ChangeDescriptionType.Title,
    );
    this.assertAtLeastOneShortLink([titleShortLink], ChangeDescriptionType.Title);
    this.assertNoIdShortLinkStrategy(this.inputs.getNoIdVerificationStrategy(), [titleShortLink]);

    if (titleShortLink.toUpperCase() === 'NOID') {
      return;
    }

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

export { VerificationService };
