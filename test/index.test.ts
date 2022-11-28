import { describe, it } from '@jest/globals';
import { run } from '../src';

import { GithubClientBuilder } from './dummy-client-github';
import { InputsClientBuilder } from './dummy-client-inputs';
import { TrelloClientBuilder } from './dummy-client-trello';
import { expectThrows, expectSuccess } from './test-utils';
import { CommitVerificationStrategy, NoIdVerificationStrategy } from '../src/client-inputs';

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
      'Event foobar is unsupported. Only "pull_request" is supported.',
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
      'Action foobar is unsupported. Only "opened", "reopened", "edited" are supported.',
    );
  });
});

describe('commit_verification_strategy.ALL_COMMITS', () => {
  it('succeeds if all commits correspond to a trello card', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.ALL_COMMITS)
      .build();
    const github = new GithubClientBuilder()
      .withPullRequestCommitMessage('[abc123] Foo')
      .withPullRequestCommitMessage('[abc123] Bar')
      .build();
    const trello = new TrelloClientBuilder().withCard('abc123', false).build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds if pull request has noid commits', async () => {

  })

  it('attaches the pull request url to the trello card', async () => {

  });

  it('does not attach the pull request url to the trello card if one already exists', async () => {

  });

  it('fails if there are different short links', async () => {

  })

  it('fails if there is a mixture of short link and no-id', async () => {

  })

  it('fails if there are no commits', async () => {
    const inputs = new InputsClientBuilder()
      .withCommitVerificationStrategy(CommitVerificationStrategy.ALL_COMMITS)
      .build();
    const github = new GithubClientBuilder().build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), 'Card does not exist');
  });
});

describe('CommitVerificationStrategy.NEVER', () => {
  it('succeeds when there are no commits', async () => {
    const inputs = new InputsClientBuilder()
        .withCommitVerificationStrategy(CommitVerificationStrategy.NEVER)
        .build();
    const github = new GithubClientBuilder().build();
    const trello = new TrelloClientBuilder().build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds when commits are missing the short link', async () => {
    const inputs = new InputsClientBuilder()
        .withCommitVerificationStrategy(CommitVerificationStrategy.NEVER)
        .build();
    const github = new GithubClientBuilder()
        .withPullRequestCommitMessage('Foo')
        .withPullRequestCommitMessage('Bar')
        .build();
    const trello = new TrelloClientBuilder().build();
    await expectSuccess(run(inputs, github, trello));
  });
});

describe('title_verification_strategy.ALWAYS', () => {
  it('succeeds if pull request title title has a short link', async () => {

  });

  it('succeeds if pull request title has a no-id', async () => {

  });

  it('fail is pull request does not have a short link', async () => {

  });
});

describe('title_verification_strategy.NEVER', () => {
  it('succeeds even if pull request title is missing shirt link', async () => {

  })
});

describe('noid_verification_strategy', () => {
  it('CASE_INSENSITIVE succeeds with any case noids', async () => {
  });

  it('UPPER_CASE succeeds with uppe case noids', async () => {
  });

  it('UPPER_CASE fails with lower case noids', async () => {
  });

  it('LOWER_CASE succeeds with lower case noids', async () => {
  });

  it('LOWER_CASE fails with upper case noids', async () => {
  });

  it('NEVER succeeds with no noid', async () => {
  });

  it('NEVER fails with noid', async () => {
  });
})

