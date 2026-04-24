import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import { ERR_NO_SHORT_LINK } from '../src/errors';

describe('GlobalVerificationStrategy.Title', () => {
  it('verifies title', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('Invalid title').build();
    await expectThrows(run(inputs, github), ERR_NO_SHORT_LINK('Invalid title'));
  });

  it('ignores commits', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[NEO-123] Title')
      .withPullRequestCommitMessage('Invalid commit')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if title contains a Linear issue link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('[NEO-123] Valid title').build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if title contains a NOID short link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('[NOID] Valid title').build();
    await expectSuccess(run(inputs, github));
  });

  it('fails if title contains a lowercase Linear-style ID', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Title)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[neo-123] Invalid title')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_SHORT_LINK('[neo-123] Invalid title'));
  });
});
