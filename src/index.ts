import * as core from '@actions/core';

import { GithubClient, GithubClientI } from './client-github';
import {
  CommitVerificationStrategy,
  InputsClient,
  InputsClientI,
  TitleVerificationStrategy,
} from './client-inputs';
import { VerificationService } from './verification-service';
import { TrelloClient, TrelloClientI } from './client-trello';
import { assertSupportedAction, assertSupportedEvent } from './utils';

const run = async (inputs: InputsClientI, github: GithubClientI, trello: TrelloClientI) => {
  const service = new VerificationService(github, inputs, trello);

  core.info('Start event verification.');
  assertSupportedEvent(github);
  assertSupportedAction(github);

  core.info('Start commit verification.');
  switch (inputs.getCommitVerificationStrategy()) {
    case CommitVerificationStrategy.AllCommits:
      await service.assertAllCommitsContainShortLink();
      break;
    case CommitVerificationStrategy.Never:
      core.info('Skipping commit verification.');
      break;
  }

  core.info('Start title verification.');
  switch (inputs.getTitleVerificationStrategy()) {
    case TitleVerificationStrategy.Always:
      await service.assertTitleContainsShortLink();
      break;
    case TitleVerificationStrategy.Never:
      core.info('Skipping title verification.');
      break;
  }
};

(async () => {
  const inputs = new InputsClient();
  const github = new GithubClient(inputs.getGitHubApiToken());
  const trello = new TrelloClient(inputs.getTrelloApiKey(), inputs.getGitHubApiToken());

  await run(inputs, github, trello);
})();

export { run };
