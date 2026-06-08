import * as core from '@actions/core';
import { InputsClient } from './client-inputs';
import { GitHubClient } from './client-github';
import { LinearClient } from './client-linear';
import { resolveLinearAuthorization } from './linear-auth';
import { run } from './run';
import { ERR_UNEXPECTED } from './errors';

const inputs = new InputsClient();
const github = new GitHubClient(inputs.getGitHubApiToken());
const linearFactory = async () => new LinearClient(await resolveLinearAuthorization(inputs));

run(inputs, github, linearFactory)
  .then(() => {
    core.setOutput('Traceability check completed successfully', 0);
  })
  .catch((error) => {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed(ERR_UNEXPECTED(error));
    }
  });
