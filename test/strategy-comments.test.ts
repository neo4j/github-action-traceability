import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { TrelloClientBuilder } from './utils/dummy-client-trello';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import { ERR_CARD_NOT_FOUND, ERR_NO_VALID_COMMENTS } from '../src/errors';

describe('GlobalVerificationStrategy.Comments', () => {
  it('fails if there are no comments', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_VALID_COMMENTS());
  });

  it('succeeds if there are no comments, as long as the "No Trello" label is set', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestLabel('No Trello')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('fails if there are no comments, and a label other than "No Trello" is set', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestLabel('Some Label')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_VALID_COMMENTS());
  });

  it('fails if there are some comments but none contain the expected url', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment('author', 'github.com', 'Body 1')
      .withPullRequestComment('author', 'github.com', 'Body 2')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_VALID_COMMENTS());
  });

  it('succeeds if there are some comments but none contain the expected url, as long as the "No Trello" label is set', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment('author', 'github.com', 'https://trello.com')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_VALID_COMMENTS());
  });

  it('fails if naked comment with a plain url', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment('author', 'github.com', 'https://trello.com')
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_VALID_COMMENTS());
  });

  it('succeeds if naked comment with a markdown url', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pulls/12')
      .withPullRequestComment(
        'author',
        'github.com',
        '![]() [Implement Traceability Proposal](https://trello.com/c/YbW6f2xn/1705-implement-traceability-proposal)',
      )
      .build();
    const trello = new TrelloClientBuilder()
      .withCard('YbW6f2xn', false)
      .withCardAttachment('YbW6f2xn', 'github.com/neo4j/github-action-traceability/pulls/12')
      .build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds if plain url in body if author is neonora', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment(
        'neonora',
        'github.com',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder()
      .withCard('BnBwoWsW', false)
      .withCardAttachment('BnBwoWsW', 'github.com/neo4j/github-action-traceability/pulls/12')
      .build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('fails if plain url in body if author is not neonora', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment(
        'author',
        'github.com',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_NO_VALID_COMMENTS());
  });

  it('succeeds if the Trello card has an attachment which matches the PR url', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pulls/12')
      .withPullRequestComment(
        'neonora',
        'github.com',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder()
      .withCard('BnBwoWsW', false)
      .withCardAttachment('BnBwoWsW', 'github.com/neo4j/github-action-traceability/pulls/12')
      .build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('succeeds if the Trello card has an attachment which begins with the PR url', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pulls/12')
      .withPullRequestComment(
        'neonora',
        'github.com',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder()
      .withCard('BnBwoWsW', false)
      .withCardAttachment('BnBwoWsW', 'github.com/neo4j/github-action-traceability/pulls/12/files')
      .build();
    await expectSuccess(run(inputs, github, trello));
  });

  it('fails if the Trello card does not exist', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability')
      .withPullRequestComment(
        'neonora',
        'github.com',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder().build();
    await expectThrows(run(inputs, github, trello), ERR_CARD_NOT_FOUND('BnBwoWsW'));
  });

  it('attaches the pull request if there are no attachments to the Trello card', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pull/12')
      .withPullRequestComment(
        'neonora',
        'github.com/comments/123',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder().withCard('BnBwoWsW', false).build();

    await expectSuccess(run(inputs, github, trello));
    await expect(await trello.getCardAttachments('BnBwoWsW')).toEqual([
      {
        shortLink: 'BnBwoWsW',
        url: 'github.com/neo4j/github-action-traceability/pull/12',
      },
    ]);
  });

  it('attaches the pull request if it is not already attached to the Trello card', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pull/12')
      .withPullRequestComment(
        'neonora',
        'github.com/comments/123',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder()
      .withCard('BnBwoWsW', false)
      .withCardAttachment('BnBwoWsW', 'github.com/neo4j/github-action-traceability/pull/other')
      .build();

    await expectSuccess(run(inputs, github, trello));
    await expect(await trello.getCardAttachments('BnBwoWsW')).toEqual([
      {
        shortLink: 'BnBwoWsW',
        url: 'github.com/neo4j/github-action-traceability/pull/other',
      },
      {
        shortLink: 'BnBwoWsW',
        url: 'github.com/neo4j/github-action-traceability/pull/12',
      },
    ]);
  });

  it('does not duplicate attachment if the pull request if it is already attached to the Trello card', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pull/12')
      .withPullRequestComment(
        'neonora',
        'github.com/comments/123',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder()
      .withCard('BnBwoWsW', false)
      .withCardAttachment('BnBwoWsW', 'github.com/neo4j/github-action-traceability/pull/12')
      .build();

    await expectSuccess(run(inputs, github, trello));
    await expect(await trello.getCardAttachments('BnBwoWsW')).toEqual([
      {
        shortLink: 'BnBwoWsW',
        url: 'github.com/neo4j/github-action-traceability/pull/12',
      },
    ]);
  });

  it('succeeds if the Trello card does not have the attachment, as long as the "No Trello" label is set', async () => {
    const inputs = new InputsClientBuilder()
      .withGlobalVerificationStrategy(GlobalVerificationStrategy.Comments)
      .build();
    const github = new GitHubClientBuilder()
      .withPullRequestLabel('No Trello')
      .withPullRequestUrl('github.com/neo4j/github-action-traceability/pull/12')
      .withPullRequestComment(
        'neonora',
        'github.com/comments/123',
        `details [https://trello.com/c/BnBwoWsW](https://trello.com/c/BnBwoWsW) details`,
      )
      .build();
    const trello = new TrelloClientBuilder().withCard('BnBwoWsW', false).build();
    await expectSuccess(run(inputs, github, trello));
  });
});
