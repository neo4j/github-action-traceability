import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import { ERR_NO_SHORT_LINK } from '../src/errors';

describe('GlobalVerificationStrategy.Commit', () => {
  it('ignores title', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('Invalid title')
      .withPullRequestCommitMessage('[NOID] Valid commit')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('verifies commits', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .build();
    const github = new GitHubClientBuilder().withPullRequestCommitMessage('Invalid commit').build();
    await expectThrows(run(inputs, github), ERR_NO_SHORT_LINK('Invalid commit'));
  });

  it('succeeds if commits contain only Linear issue links', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestCommitMessage('[NEO-123] Valid commit')
      .withPullRequestCommitMessage('[NEO-456] Valid commit')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if commits contain only NOID short links', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestCommitMessage('[NOID] Valid commit')
      .withPullRequestCommitMessage('[NOID] Another valid commit')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if commits contain a mix of Linear and NOID short links', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestCommitMessage('[NEO-123] Valid commit')
      .withPullRequestCommitMessage('[NOID] Valid commit')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('fails if any commit does not contain a valid short link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestCommitMessage('[NEO-123] Valid commit')
      .withPullRequestCommitMessage('Invalid commit')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_SHORT_LINK('Invalid commit'));
  });

  it('fails if commit uses lowercase Linear-style ID', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Commits)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestCommitMessage('[neo-123] Invalid commit')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_SHORT_LINK('[neo-123] Invalid commit'));
  });
});
