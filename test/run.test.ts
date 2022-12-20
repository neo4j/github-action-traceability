import { describe, it } from '@jest/globals';
import { run } from '../src/run';

import { GitHubClientBuilder } from './dummy-client-github';
import { InputsClientBuilder } from './dummy-client-inputs';
import { TrelloClientBuilder } from './dummy-client-trello';
import { expectSuccess, expectThrows } from './test-utils';
import { GlobalVerificationStrategy, ShortLinkVerificationStrategy } from '../src/client-inputs';

describe('event_type', () => {
  it('succeeds if "pull_request" event type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GitHubClientBuilder().withEvent('pull_request').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('fails with other event types', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GitHubClientBuilder().withEvent('foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'GitHub event "foobar" is unsupported. Only "pull_request" is supported.',
    );
  });
});

describe('action_type', () => {
  it('succeeds with "opened" action type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GitHubClientBuilder().withAction('opened').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds with "reopened" action type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GitHubClientBuilder().withAction('reopened').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds with "edited" action type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GitHubClientBuilder().withAction('edited').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds with "synchronize" action type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GitHubClientBuilder().withAction('synchronize').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('fails with other action types', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GitHubClientBuilder().withAction('foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'GitHub action "foobar" is unsupported. ' +
        'Only "opened", "reopened", "edited", "synchronize" are supported.',
    );
  });
});

describe('GlobalVerificationStrategy', () => {
  describe('.Commits', () => {
    it('ignores title', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('Invalid title')
        .withPullRequestCommitMessage('[NOID] Valid commit')
        .build();
      const trello = new TrelloClientBuilder().build();
      await expectSuccess(run(inputs, github, trello));
    });

    it('verifies commits', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[NOID] Valid title')
        .withPullRequestCommitMessage('Invalid commit')
        .build();
      const trello = new TrelloClientBuilder().build();
      await expectThrows(
        run(inputs, github, trello),
        'Description "Invalid commit" did not contain a valid short link. Please include one like ' +
          'in the following examples: "[abc123] My work description" or "[NOID] My work description".',
      );
    });
  });

  describe('.CommitsAndPrTitle', () => {
    it('verifies title', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .build();
      const github = new GitHubClientBuilder().withPullRequestTitle('Invalid title').build();
      const trello = new TrelloClientBuilder().build();
      await expectThrows(
        run(inputs, github, trello),
        'Description "Invalid title" did not contain a valid short link. Please include one like ' +
          'in the following examples: "[abc123] My work description" or "[NOID] My work description".',
      );
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
      await expectThrows(
        run(inputs, github, trello),
        'Description "Invalid commit" did not contain a valid short link. Please include one like ' +
          'in the following examples: "[abc123] My work description" or "[NOID] My work description".',
      );
    });
  });

  describe('.Disabled', () => {
    it('ignores commits and title', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Disabled)
        .build();
      const github = new GitHubClientBuilder().withPullRequestTitle('Invalid title').build();
      const trello = new TrelloClientBuilder().build();
      await expectSuccess(run(inputs, github, trello));
    });

    it('ignores commits', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Disabled)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestCommitMessage('Invalid title')
        .build();
      const trello = new TrelloClientBuilder().build();
      await expectSuccess(run(inputs, github, trello));
    });
  });
});

describe('ShortLinkVerificationStrategy', () => {
  describe('.Trello', () => {
    it('succeeds if descriptions contain trello short links', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[abc123] Valid Title')
        .withPullRequestCommitMessage('[abc123] Valid Commit')
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
        .withPullRequestTitle('[NOID] Invalid Title')
        .withPullRequestCommitMessage('[abc123] Valid Commit')
        .build();
      const trello = new TrelloClientBuilder().build();
      await expectThrows(
        run(inputs, github, trello),
        'Unexpected NOID short link "NOID". Only Trello short links are allowed in your project, ' +
          'please provide one in the form of "[a2bd4d] My change description".',
      );
    });

    it('fails if descriptions contain NOID short links in commit', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[NOID] Valid Title')
        .withPullRequestCommitMessage('[abc123] Invalid Commit')
        .build();
      const trello = new TrelloClientBuilder().build();
      await expectThrows(
        run(inputs, github, trello),
        'Unexpected NOID short link "NOID". Only Trello short links are allowed in your project, ' +
          'please provide one in the form of "[a2bd4d] My change description".',
      );
    });
  });

  describe('.TrelloOrNoId', () => {
    it('succeeds if descriptions contain only Trello short links', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[abc123] Valid Title')
        .withPullRequestCommitMessage('[abc123] Invalid Commit')
        .withPullRequestCommitMessage('[abc123] Invalid Commit')
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
        .withPullRequestTitle('[NOID] Valid Title')
        .withPullRequestCommitMessage('[NOID] Invalid Commit')
        .withPullRequestCommitMessage('[NOID] Invalid Commit')
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
        .withPullRequestTitle('[abc123] Valid Title')
        .withPullRequestCommitMessage('[abc123] Invalid Commit')
        .withPullRequestCommitMessage('[NOID] Invalid Commit')
        .build();
      const trello = new TrelloClientBuilder().withCard('abc123', false).build();
      await expectSuccess(run(inputs, github, trello));
    });

    it('fails if there are different Trello short links in title and commit', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.CommitsAndPRTitle)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[abc123] Invalid Commit')
        .withPullRequestCommitMessage('[def345] Invalid Commit')
        .build();
      const trello = new TrelloClientBuilder()
        .withCard('abc123', false)
        .withCard('def345', false)
        .build();
      await expectThrows(
        run(inputs, github, trello),
        'All Trello short links must be identical, but "def345" and "abc123" were different.',
      );
    });

    it('fails if there are different Trello short links in commit', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
        .build();
      const github = new GitHubClientBuilder()
        .withPullRequestCommitMessage('[123abc] Invalid Commit')
        .withPullRequestCommitMessage('[def345] Invalid Commit')
        .build();
      const trello = new TrelloClientBuilder()
        .withCard('abc123', false)
        .withCard('def345', false)
        .build();
      await expectThrows(
        run(inputs, github, trello),
        'All Trello short links must be identical, but "def345" and "123abc" were different.',
      );
    });
  });
});

describe('Adding attachments to Trello cards', () => {
  it('fails if the Trello card does not exist', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestCommitMessage('[abc123] Foobar')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), 'Card does not exist.');
  });

  it('fails if the Trello card is closed', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestCommitMessage('[abc123] Foobar')
      .build();
    const trello = new TrelloClientBuilder().withCard('abc123', true).build();
    await expectThrows(
      run(inputs, github, trello),
      'Trello card "abc123" needs to be in an open state, but it is currently marked as closed.',
    );
  });

  it('attaches the PR url to the Trello card corresponding to the Trello short link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/namespace/project/pulls/96')
      .withPullRequestCommitMessage('[abc123] Foo')
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
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
        .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.Trello)
        .build();
    const github = new GitHubClientBuilder()
        .withPullRequestUrl('github.com/namespace/project/pulls/96')
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
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .withShortLinkVerificationStrategy(ShortLinkVerificationStrategy.TrelloOrNoId)
      .build();
    const github = new GitHubClientBuilder().withPullRequestCommitMessage('[NOID] Foo').build();
    const trello = new TrelloClientBuilder().withCard('abc123', false).build();
    await expectSuccess(run(inputs, github, trello));
    await expect(trello.getCardAttachments('abc123')).resolves.toEqual([]);
  });
});
