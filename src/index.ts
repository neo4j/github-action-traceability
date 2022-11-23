import * as core from '@actions/core';

import { GithubClient, GithubClientI } from './client-github';
import {
  CommitVerificationStrategy,
  InputsClient,
  InputsClientI,
  TitleVerificationStrategy,
} from './client-inputs';
import { VerificationsService } from './service-verifications';
import { TrelloClient, TrelloClientI } from './client-trello';
import { assertSupportedAction, assertSupportedEvent } from './utils';

const run = async (inputs: InputsClientI, github: GithubClientI, trello: TrelloClientI) => {
  const service = new VerificationsService(github, inputs, trello);

  core.info('Start event verification.');
  assertSupportedEvent(github);
  assertSupportedAction(github);

  core.info('Start commit verification.');
  switch (inputs.getCommitVerificationStrategy()) {
    case CommitVerificationStrategy.ALL_COMMITS:
      await service.assertAllCommitsContainShortLink();
      break;
    case CommitVerificationStrategy.NEVER:
      core.info('Skipping commit verification.');
      break;
  }

  core.info('Start title verification.');
  switch (inputs.getTitleVerificationStrategy()) {
    case TitleVerificationStrategy.ALWAYS:
      await service.assertTitleContainsShortLink();
      break;
    case TitleVerificationStrategy.NEVER:
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
