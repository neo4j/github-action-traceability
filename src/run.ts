import * as core from '@actions/core';

import { GithubClientI } from './client-github';
import {
  CommitVerificationStrategy,
  InputsClientI,
  TitleVerificationStrategy,
} from './client-inputs';
import { VerificationService } from './verification-service';
import { TrelloClientI } from './client-trello';
import { assertSupportedAction, assertSupportedEvent } from './utils';

const run = async (inputs: InputsClientI, github: GithubClientI, trello: TrelloClientI) => {
  const service = new VerificationService(github, inputs, trello);

  core.info('Start GitHub event verification.');
  assertSupportedEvent(github);
  assertSupportedAction(github);

  core.info('Start commit messages verification.');
  switch (inputs.getCommitVerificationStrategy()) {
    case CommitVerificationStrategy.AllCommits:
      await service.assertAllCommitsContainShortLink();
      break;
    case CommitVerificationStrategy.Never:
      core.info('Skipping commit verification.');
      break;
  }

  core.info('Start PR title verification.');
  switch (inputs.getTitleVerificationStrategy()) {
    case TitleVerificationStrategy.Always:
      await service.assertTitleContainsShortLink();
      break;
    case TitleVerificationStrategy.Never:
      core.info('Skipping title verification.');
      break;
  }

  core.info('PR validated successfully.');
};

export { run };
