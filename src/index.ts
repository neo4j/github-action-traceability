import * as core from '@actions/core';
import { InputsClient } from './client-inputs';
import { GitHubClient } from './client-github';
import { TrelloClient } from './client-trello';
import { run } from './run';

const inputs = new InputsClient();
const github = new GitHubClient(inputs.getGitHubApiToken());
const trello = new TrelloClient(inputs.getTrelloApiKey(), inputs.getTrelloApiToken());
run(inputs, github, trello)
  .then(() => {
    core.setOutput('Traceability check completed successfully', 0);
  })
  .catch((error) => {
    if (error instanceof Error) {
      core.setFailed(error);
    }
    core.setFailed(`Failed with unexpected error ${error}`);
  });
