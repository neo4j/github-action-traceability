import * as core from '@actions/core';
import { InputsClient } from './client-inputs';
import { GithubClient } from './client-github';
import { TrelloClient } from './client-trello';
import { run } from './run';

try {
  const inputs = new InputsClient();
  const github = new GithubClient(inputs.getGitHubApiToken());
  const trello = new TrelloClient(inputs.getTrelloApiKey(), inputs.getTrelloApiToken());
  run(inputs, github, trello);
} catch (error) {
  if (error instanceof Error) {
    core.setFailed(error);
  } else {
    throw error;
  }
}
