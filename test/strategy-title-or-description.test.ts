import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import { ERR_NO_LINEAR_ISSUE_TITLE_OR_DESCRIPTION, ERR_NO_SHORT_LINK } from '../src/errors';

describe('GlobalVerificationStrategy.TitleOrDescription', () => {
  it('succeeds if title contains a Linear issue link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[NEO-123] My feature')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if title contains a NOID short link', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[NOID] My feature')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if description contains a Linear issue ID', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('My feature')
      .withPullRequestBody('This PR implements NEO-123.')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if description contains a bracketed Linear issue ID', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('My feature')
      .withPullRequestBody('Closes [NEO-123] as described in the ticket.')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if description contains a Linear URL', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('My feature')
      .withPullRequestBody('https://linear.app/neo4j/issue/NEO-456/my-issue')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if title has the ID even when description is empty', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[NEO-123] My feature')
      .withPullRequestBody('')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('fails if neither title nor description contains a Linear issue ID', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('My feature')
      .withPullRequestBody('Some description with no issue ID.')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_LINEAR_ISSUE_TITLE_OR_DESCRIPTION());
  });

  it('fails if both title and description are empty', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('')
      .withPullRequestBody('')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_LINEAR_ISSUE_TITLE_OR_DESCRIPTION());
  });

  it('ignores commits', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.TitleOrDescription)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestTitle('[NEO-123] My feature')
      .withPullRequestCommitMessage('Invalid commit')
      .build();
    await expectSuccess(run(inputs, github));
  });
});
