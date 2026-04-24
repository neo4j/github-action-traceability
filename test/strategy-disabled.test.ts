import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { expectSuccess } from './utils/test-utils';
import { run } from '../src/run';

describe('GlobalVerificationStrategy.Disabled', () => {
  it('ignores title', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Disabled)
      .build();
    const github = new GitHubClientBuilder().withPullRequestTitle('Invalid title').build();
    await expectSuccess(run(inputs, github));
  });

  it('ignores commits', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Disabled)
      .build();
    const github = new GitHubClientBuilder().withPullRequestCommitMessage('Invalid commit').build();
    await expectSuccess(run(inputs, github));
  });

  it('ignores comments', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Disabled)
      .build();
    const github = new GitHubClientBuilder().build();
    await expectSuccess(run(inputs, github));
  });
});
