import * as core from '@actions/core';
import * as github from '@actions/github';
import { ERR_INPUT_INVALID, ERR_INPUT_NOT_FOUND } from './errors';

enum GlobalVerificationStrategy {
  Commits = 'commits',
  Title = 'title',
  Comments = 'comments',
  Disabled = 'disabled',
}

interface InputsClientI {
  getGlobalVerificationStrategy(): GlobalVerificationStrategy;
  getTrelloApiKey(): string;
  getTrelloApiToken(): string;
  getGitHubApiToken(): string;
  getGitHubRepositoryName(): string;
  getGithubRepositoryOwner(): string;
  getPullRequestNumber(): number;
}

class InputsClient implements InputsClientI {
  getGlobalVerificationStrategy(): GlobalVerificationStrategy {
    core.info('Get global_verification_strategy.');
    const input = core.getInput('global_verification_strategy');
    switch (input) {
      case 'commits':
        return GlobalVerificationStrategy.Commits;
      case 'title':
        return GlobalVerificationStrategy.Title;
      case 'comments':
        return GlobalVerificationStrategy.Comments;
      case 'disabled':
        return GlobalVerificationStrategy.Disabled;
      default:
        throw new Error(ERR_INPUT_INVALID('global_verification_strategy', input));
    }
  }

  getTrelloApiKey(): string {
    core.info('Get trello_api_key.');
    return core.getInput('trello_api_key', { required: true });
  }

  getTrelloApiToken(): string {
    core.info('Get trello_api_token.');
    return core.getInput('trello_api_token', { required: true });
  }

  getGitHubApiToken(): string {
    core.info('Get github_api_token.');
    return core.getInput('github_api_token', { required: true });
  }

  getGitHubRepositoryName(): string {
    core.info('Get github.context.payload.repository.');
    if (!github.context.payload.repository)
      throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload.repository'));
    if (!github.context.payload.repository.name)
      throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload.repository.name'));
    return github.context.payload.repository.name;
  }

  getGithubRepositoryOwner(): string {
    core.info('Get github_repository_owner.');

    if (!github.context.payload.repository)
      throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload.repository'));
    if (!github.context.payload.repository.name)
      throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload.repository.name'));
    if (!github.context.payload.repository.owner)
      throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload.repository.owner'));
    if (
      !github.context.payload.repository.owner.login &&
      !github.context.payload.repository.owner.name
    )
      throw new Error(
        ERR_INPUT_NOT_FOUND(
          'github.context.payload.repository.owner.login && github.context.payload.repository.owner.name',
        ),
      );

    return (
      github.context.payload.repository.owner.name || github.context.payload.repository.owner.login
    );
  }

  getPullRequestNumber(): number {
    core.info('Get github.context.payload.pull_request.number.');

    if (!github.context.payload) throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload'));
    if (!github.context.payload.pull_request)
      throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload.pull_request'));
    if (!github.context.payload.pull_request.number)
      throw new Error(ERR_INPUT_NOT_FOUND('github.context.payload.pull_request.number'));

    return github.context.payload.pull_request.number;
  }
}

export { InputsClient, InputsClientI, GlobalVerificationStrategy };
