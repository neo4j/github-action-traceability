import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import { ERR_NO_VALID_COMMENTS } from '../src/errors';

describe('GlobalVerificationStrategy.Comments', () => {
  it('fails if there are no comments', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_VALID_COMMENTS());
  });

  it('succeeds if there are no comments, as long as the "No Linear" label is set', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestLabel('No Linear')
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('fails if there are no comments, and a label other than "No Linear" is set', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestLabel('Some Label')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_VALID_COMMENTS());
  });

  it('fails if there are some comments but none contain a Linear URL', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment('author', 'github.com', 'Body 1')
      .withPullRequestComment('author', 'github.com', 'Body 2')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_VALID_COMMENTS());
  });

  it('fails if a comment contains a non-issue Linear URL', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment('author', 'github.com', 'https://linear.app/neo4j/team/NEO')
      .build();
    await expectThrows(run(inputs, github), ERR_NO_VALID_COMMENTS());
  });

  it('succeeds if a comment contains a Linear issue URL', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pulls/12')
      .withPullRequestComment(
        'author',
        'github.com',
        'https://linear.app/neo4j/issue/NEO-123/my-issue',
      )
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if a comment contains a Linear URL along with other content', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pulls/12')
      .withPullRequestComment(
        'author',
        'github.com',
        'Linked to https://linear.app/neo4j/issue/NEO-456/some-issue for context',
      )
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds with multiple comments where only one contains a Linear URL', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pulls/12')
      .withPullRequestComment('author', 'github.com', 'Just a regular comment')
      .withPullRequestComment(
        'author',
        'github.com',
        'https://linear.app/neo4j/issue/NEO-123/my-issue',
      )
      .build();
    await expectSuccess(run(inputs, github));
  });

  it('succeeds if "No Linear" label is set even when comments contain Linear URLs', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestLabel('No Linear')
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pulls/12')
      .withPullRequestComment(
        'author',
        'github.com',
        'https://linear.app/neo4j/issue/NEO-123/my-issue',
      )
      .build();
    await expectSuccess(run(inputs, github));
  });
});
