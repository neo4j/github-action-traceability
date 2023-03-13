import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { TrelloClientBuilder } from './utils/dummy-client-trello';
import { expectSuccess } from './utils/test-utils';
import { run } from '../src/run';

describe('GlobalVerificationStrategy.Disabled', () => {
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
    const github = new GitHubClientBuilder().withPullRequestCommitMessage('Invalid commit').build();
    const trello = new TrelloClientBuilder().build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('ignores comments', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Disabled)
      .build();
    const github = new GitHubClientBuilder().build();
    const trello = new TrelloClientBuilder().build();
    await expectSuccess(run(inputs, github, trello));
  });
});
