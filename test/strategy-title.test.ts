import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { TrelloClientBuilder } from './utils/dummy-client-trello';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import { ERR_CARD_NOT_FOUND, ERR_CLOSED_CARD, ERR_NO_SHORT_LINK } from '../src/errors';

describe('GlobalVerificationStrategy.CommitsAndPrTitle', () => {
  it('verifies title', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('Invalid title').build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_SHORT_LINK('Invalid title'));
  });

  it('ignores commits', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[abc123] Title')
      .withPullRequestCommitMessage('[def123] Commit')
      .build();
    const trello = new TrelloClientBuilder().withCard('abc123', false).build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds if title contains Trello short link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('[abc123] Valid title').build();
    const trello = new TrelloClientBuilder().withCard('abc123', false).build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds if title contains NOID short link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('[NOID] Valid title').build();
    const trello = new TrelloClientBuilder().build();
    await expectSuccess(run(inputs, github, trello));
  });

  describe('Adding attachments to Trello cards', () => {
    it('fails if the Trello card does not exist', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
        .build();
      const github = new GitHubClientBuilder().withPullRequestTitle('[abc123] Title').build();
      const trello = new TrelloClientBuilder().build();
      await expectThrows(run(inputs, github, trello), ERR_CARD_NOT_FOUND('abc123'));
    });

    it('fails if the Trello card is closed', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
        .build();
      const github = new GitHubClientBuilder().withPullRequestTitle('[abc123] Title').build();
      const trello = new TrelloClientBuilder().withCard('abc123', true).build();
      await expectThrows(run(inputs, github, trello), ERR_CLOSED_CARD('abc123'));
    });

    it('attaches the PR url to the Trello card corresponding to the Trello short link', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl('github.com/namespace/project/pulls/96')
        .withPullRequestTitle('[abc123] Title')
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

    it('does not create duplicate attachments', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl('github.com/namespace/project/pulls/96')
        .withPullRequestTitle('[abc123] Title')
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

    it('does nothing if the short link is a NOID', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
        .build();
      const github = new GitHubClientBuilder().withPullRequestTitle('[NOID] Title').build();
      const trello = new TrelloClientBuilder().withCard('abc123', false).build();
      await expectSuccess(run(inputs, github, trello));
      await expect(trello.getCardAttachments('abc123')).resolves.toEqual([]);
    });
  });
});
