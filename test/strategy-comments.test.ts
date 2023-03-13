import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GlobalVerificationStrategy, ShortLinkVerificationStrategy } from '../src/client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { TrelloClientBuilder } from './utils/dummy-client-trello';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import {ERR_NO_VALID_COMMENTS} from "../src/errors";

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

  it('succeeds if there are no comments, as long as the "No Trello" label is set', async () => {});

  it('fails if there are some comments but none contain the expected url', async () => {});

  it('succeeds if there are some comments but none contain the expected url, as long as the "No Trello" label is set', async () => {});

  it('succeeds if naked comment with a plain url', async () => {});

  it('succeeds if naked comment with a markdown url', async () => {});

  it('succeeds if plain url in body if author is neonora', async () => {});

  it('fails if plain url in body if author is not neonora', async () => {});

  it('succeeds if the Trello card has an attachment which matches the PR url', async () => {});

  it('succeeds if the Trello card has an attachment which begins with the PR url', async () => {});

  it('fails if the Trello card does not exist', async () => {});

  it('fails if the Trello card exists but does not have the attachment', async () => {});

  it('succeeds if the Trello card does not have the attachment, as long as the "No Trello" label is set', async () => {});
});
