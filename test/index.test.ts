import { describe, expect, it } from '@jest/globals';
import { run } from '../src/run';

import { GithubClientBuilder } from './dummy-client-github';
import { InputsClientBuilder } from './dummy-client-inputs';
import { TrelloClientBuilder } from './dummy-client-trello';
import { expectSuccess, expectThrows } from './test-utils';
import {
  CommitVerificationStrategy,
  NoIdVerificationStrategy,
  TitleVerificationStrategy,
} from '../src/client-inputs';

describe('event_type', () => {
  it('succeeds if "pull_request" event type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GithubClientBuilder().withEvent('pull_request').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('fails with other event types', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GithubClientBuilder().withEvent('foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'Github event "foobar" is unsupported. Only "pull_request" is supported.',
    );
  });
});

describe('action_type', () => {
  it('succeeds with "opened" action type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GithubClientBuilder().withAction('opened').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds with "reopened" action type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GithubClientBuilder().withAction('reopened').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds with "edited" action type', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GithubClientBuilder().withAction('edited').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('fails with other action types', async () => {
    const inputs = new InputsClientBuilder().build();
    const github = new GithubClientBuilder().withAction('foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'Github action "foobar" is unsupported. Only "opened", "reopened", "edited" are supported.',
    );
  });
});

describe('commit_verification_strategy.AllCommits', () => {
  it('succeeds if all commits correspond to a trello card', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestCommitMessage('[abc123] Foo')
      .withPullRequestCommitMessage('[abc123] Bar')
      .build();
    const trello = new TrelloClientBuilder().withCard('abc123', false).build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds if pull request has noid commits', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.AnyCase)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestCommitMessage('[NOID] Foo')
      .withPullRequestCommitMessage('[NOID] Bar')
      .build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('throws if the card is closed', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestUrl('github.com/namespace/project/pulls/96')
      .withPullRequestCommitMessage('[abc123] Bar')
      .build();
    const trello = new TrelloClientBuilder().withCard('abc123', true).build();

    await expectThrows(
      run(inputs, github, trello),
      'Trello card "abc123" needs to be in an open state, but it is currently marked as closed.',
    );
  });

  it('attaches the pull request url to the trello card', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestUrl('github.com/namespace/project/pulls/96')
      .withPullRequestCommitMessage('[abc123] Foo')
      .withPullRequestCommitMessage('[abc123] Bar')
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

  it('does not attach the pull request url to the trello card if one already exists', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestUrl('github.com/namespace/project/pulls/96')
      .withPullRequestCommitMessage('[abc123] Foo')
      .withPullRequestCommitMessage('[abc123] Bar')
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

  it('fails if there are different short links', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestCommitMessage('[abc123] Foo')
      .withPullRequestCommitMessage('[def456] Bar')
      .build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'Your PR contained Trello short links that did not match: "abc123" and "def456" differ. ' +
        'You cannot currently include more than one Trello card per PR. But please reach out to me if this is ' +
        'something your team needs, you savages.',
    );
  });

  it('fails if there is a mixture of short link and no-id', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestCommitMessage('[abc123] Foo')
      .withPullRequestCommitMessage('[NOID] Bar')
      .build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'Your PR contained Trello short links that did not match: "abc123" and "NOID" differ. ' +
        'You cannot currently include more than one Trello card per PR. But please reach out to me if this is ' +
        'something your team needs, you savages.',
    );
  });

  it('fails if there are no commits', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.AllCommits)
      .build();
    const github = new GithubClientBuilder().build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(
      run(inputs, github, trello),
      'A Trello short link is missing from all commits in your PR. ' +
        'Please include at least one like the following examples: "[abc123] My work description" or ' +
        '"[NOID] My work description"',
    );
  });
});

describe('CommitVerificationStrategy.Never', () => {
  it('succeeds when there are no commits', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.Never)
      .build();
    const github = new GithubClientBuilder().build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds when commits are missing the short link', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.Never)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestCommitMessage('Foo')
      .withPullRequestCommitMessage('Bar')
      .build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });
});

describe('title_verification_strategy.Always', () => {
  it('succeeds if pull request title title has a short link', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[abc123] Foobar').build();
    const trello = new TrelloClientBuilder().withCard('abc123', false).build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds if pull request title has a no-id', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.AnyCase)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[NOID] Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('fail is pull request does not have a short link', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'PR title "Foobar" did not contain a valid trello short link. Please include one like in the ' +
        'following examples: "[abc123] My work description" or "[NOID] My work description"',
    );
  });
});

describe('title_verification_strategy.Never', () => {
  it('succeeds even if pull request title is missing shirt link', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Never)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });
});

describe('noid_verification_strategy', () => {
  it('AnyCase succeeds with any case noids', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.AnyCase)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[NoId] Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('UpperCase succeeds with upper case noids', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.UpperCase)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[NOID] Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('UpperCase fails with lower case noids', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.UpperCase)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[noid] Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'NOID short link needed to be upper case but was "noid"',
    );
  });

  it('LowerCase succeeds with lower case noids', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.LowerCase)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[noid] Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('LowerCase fails with upper case noids', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.LowerCase)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[NOID] Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'NOID short link needed to be lower case but was "NOID"',
    );
  });

  it('Never succeeds with no noid', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.Never)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[abc123] Foobar').build();
    const trello = new TrelloClientBuilder().withCard('abc123', false).build();

    await expectSuccess(run(inputs, github, trello));
  });

  it('Never fails with noid', async () => {
    const inputs = new InputsClientBuilder()
      .withTitleVerificationStrategy(TitleVerificationStrategy.Always)
      .withNoIdVerificationStrategy(NoIdVerificationStrategy.Never)
      .build();
    const github = new GithubClientBuilder().withPullRequestTitle('[NOID] Foobar').build();
    const trello = new TrelloClientBuilder().build();

    await expectThrows(
      run(inputs, github, trello),
      'This PR should not include any NOID short links. If you need this functionality please ' +
        'enable it via the "noid_verification_strategy" setting for this Github Action',
    );
  });
});
