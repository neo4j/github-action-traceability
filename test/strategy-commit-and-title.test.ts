import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy, ShortLinkVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { TrelloClientBuilder } from './utils/dummy-client-trello';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import {
  ERR_CARD_NOT_FOUND,
  ERR_CLOSED_CARD,
  ERR_INVALID_NOID,
  ERR_NO_SHORT_LINK,
} from '../src/errors';

describe('GlobalVerificationStrategy.CommitsAndPrTitle', () => {
  it('verifies title', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('Invalid title').build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_SHORT_LINK('Invalid title'));
  });

  it('verifies commits', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[NOID] Valid title')
      .withPullRequestCommitMessage('Invalid commit')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_SHORT_LINK('Invalid commit'));
  });

  describe('ShortLinkVerificationStrategy', () => {
    describe('.Trello', () => {
      it('succeeds if descriptions contain trello short links', async () => {
        const inputs = new InputsClientBuilder()
          .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
          .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
          .build();
        const github = new GitHubClientBuilder()
          .withPullRequestTitle('[abc123] Valid title')
          .withPullRequestCommitMessage('[abc123] Valid commit')
          .build();
        const trello = new TrelloClientBuilder().withCard('abc123', false).build();
        await expectSuccess(run(inputs, github, trello));
      });

      it('fails if descriptions contain NOID short links in title', async () => {
        const inputs = new InputsClientBuilder()
          .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
          .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
          .build();
        const github = new GitHubClientBuilder()
          .withPullRequestTitle('[NOID] Invalid title')
          .withPullRequestCommitMessage('[abc123] Commit')
          .build();
        const trello = new TrelloClientBuilder().build();
        await expectThrows(run(inputs, github, trello), ERR_INVALID_NOID('NOID'));
      });

      it('fails if descriptions contain NOID short links in commit', async () => {
        const inputs = new InputsClientBuilder()
          .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
          .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
          .build();
        const github = new GitHubClientBuilder()
          .withPullRequestTitle('[abc123] Title')
          .withPullRequestCommitMessage('[NOID] Invalid commit')
          .build();
        const trello = new TrelloClientBuilder().build();
        await expectThrows(run(inputs, github, trello), ERR_INVALID_NOID('NOID'));
      });
    });

    describe('.TrelloOrNoId', () => {
      it('succeeds if descriptions contain only Trello short links', async () => {
        const inputs = new InputsClientBuilder()
          .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
          .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
          .build();
        const github = new GitHubClientBuilder()
          .withPullRequestTitle('[abc123] Valid title')
          .withPullRequestCommitMessage('[abc123] Valid commit')
          .withPullRequestCommitMessage('[abc123] Valid commit')
          .build();
        const trello = new TrelloClientBuilder().withCard('abc123', false).build();
        await expectSuccess(run(inputs, github, trello));
      });

      it('succeeds if descriptions contain only NOID short links', async () => {
        const inputs = new InputsClientBuilder()
          .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
          .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
          .build();
        const github = new GitHubClientBuilder()
          .withPullRequestTitle('[NOID] Valid title')
          .withPullRequestCommitMessage('[NOID] Valid commit')
          .withPullRequestCommitMessage('[NOID] Valid commit')
          .build();
        const trello = new TrelloClientBuilder().build();
        await expectSuccess(run(inputs, github, trello));
      });

      it('succeeds if descriptions contain mix of Trello and NOID short links', async () => {
        const inputs = new InputsClientBuilder()
          .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
          .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
          .build();
        const github = new GitHubClientBuilder()
          .withPullRequestTitle('[abc123] Valid title')
          .withPullRequestCommitMessage('[abc123] Valid commit')
          .withPullRequestCommitMessage('[NOID] Valid commit')
          .build();
        const trello = new TrelloClientBuilder().withCard('abc123', false).build();
        await expectSuccess(run(inputs, github, trello));
      });
    });
  });

  describe('Adding attachments to Trello cards', () => {
    it('fails if the Trello card does not exist', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[abc123] Title')
        .withPullRequestCommitMessage('[abc123] Commit')
        .build();
      const trello = new TrelloClientBuilder().build();
      await expectThrows(run(inputs, github, trello), ERR_CARD_NOT_FOUND('abc123'));
    });

    it('fails if the Trello card is closed', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[abc123] Title')
        .withPullRequestCommitMessage('[abc123] Commit')
        .build();
      const trello = new TrelloClientBuilder().withCard('abc123', true).build();
      await expectThrows(run(inputs, github, trello), ERR_CLOSED_CARD('abc123'));
    });

    it('attaches the PR url to the Trello card corresponding to the Trello short link', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl('github.com/namespace/project/pulls/96')
        .withPullRequestTitle('[abc123] Title')
        .withPullRequestCommitMessage('[abc123] Commit')
        .build();
      const trello = new TrelloClientBuilder().withCard('abc123', false).build();
      await expectSuccess(run(inputs, github, trello));
      await expect(trello.getCardAttachments('abc123')).resolves.toEqual([
        {
          shortLink: 'abc123',
          url: 'github.com/namespace/project/pulls/96',
        },
      ]);
    });

    it('attaches the PR url to multiple Trello cards if there are multiple Trello short links', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl('github.com/namespace/project/pulls/96')
        .withPullRequestTitle('[abc123] Title')
        .withPullRequestCommitMessage('[abc123] Commit')
        .withPullRequestCommitMessage('[bcd345] Commit')
        .build();
      const trello = new TrelloClientBuilder()
        .withCard('abc123', false)
        .withCard('bcd345', false)
        .build();
      await expectSuccess(run(inputs, github, trello));
      await expect(trello.getCardAttachments('abc123')).resolves.toEqual([
        {
          shortLink: 'abc123',
          url: 'github.com/namespace/project/pulls/96',
        },
      ]);
      await expect(trello.getCardAttachments('bcd345')).resolves.toEqual([
        {
          shortLink: 'bcd345',
          url: 'github.com/namespace/project/pulls/96',
        },
      ]);
    });

    it('does not create duplicate attachments', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl('github.com/namespace/project/pulls/96')
        .withPullRequestTitle('[abc123] Title')
        .withPullRequestCommitMessage('[abc123] Commit')
        .build();
      const trello = new TrelloClientBuilder()
        .withCard('abc123', false)
        .withCardAttachment('abc123', 'github.com/namespace/project/pulls/96')
        .build();
      await expectSuccess(run(inputs, github, trello));
      await expect(trello.getCardAttachments('abc123')).resolves.toEqual([
        {
          shortLink: 'abc123',
          url: 'github.com/namespace/project/pulls/96',
        },
      ]);
    });

    it('does nothing if there are only NOID short links', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[NOID] Title')
        .withPullRequestCommitMessage('[NOID] Foo')
        .build();
      const trello = new TrelloClientBuilder().withCard('abc123', false).build();
      await expectSuccess(run(inputs, github, trello));
      await expect(trello.getCardAttachments('abc123')).resolves.toEqual([]);
    });
  });
});
