import { GithubClientI } from './client-github';

const assertSupportedEvent = (githubClient: GithubClientI): void => {
  if (githubClient.getContextEvent() !== 'pull_request')
    throw `Event ${githubClient.getContextEvent()} is unsupported. Only "pull_request" is supported.`;
};

const assertSupportedAction = (githubClient: GithubClientI): void => {
  if (!['opened', 'reopened', 'edited'].some((el) => el === githubClient.getContextAction()))
    throw `Action ${githubClient.getContextAction()} is unsupported. Only "opened", "reopened", "edited" are supported.`;
};

export { assertSupportedEvent, assertSupportedAction };
