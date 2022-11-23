import { GithubClientI } from './client-github';

const assertSupportedEvent = (githubClient: GithubClientI): void => {
  if (githubClient.getContextEvent() !== 'pull_request')
    throw new Error(
      `Event ${githubClient.getContextEvent()} is unsupported. Only 'pull_request' events are supported.`,
    );
};

const assertSupportedAction = (githubClient: GithubClientI): void => {
  if (['opened', 'reopened', 'edited'].some((el) => el === githubClient.getContextAction()))
    throw new Error(
      `Action ${githubClient.getContextAction()} is unsupported. Only 'opened', 'reopened', 'edited' actions are supported.`,
    );
};

export { assertSupportedEvent, assertSupportedAction };
