import * as core from '@actions/core';
import * as github from '@actions/github';
import { ERR_INPUT_INVALID, ERR_INPUT_NOT_FOUND, ERR_STRATEGY_REMOVED } from './errors';

enum GlobalVerificationStrategy {
  Linked = 'linked',
  Disabled = 'disabled',
}

const REMOVED_STRATEGIES: ReadonlySet<string> = new Set([
  'commits',
  'title',
  'title-or-description',
  'comments',
]);

interface InputsClientI {
  getGlobalVerificationStrategy(): GlobalVerificationStrategy;
  getGitHubApiToken(): string;
  getLinearApiKey(): string;
  getLinearClientId(): string;
  getLinearClientSecret(): string;
  getGitHubRepositoryName(): string;
  getGithubRepositoryOwner(): string;
  getPullRequestNumber(): number;
  getTargetBranches(): string[];
}

class InputsClient implements InputsClientI {
  getGlobalVerificationStrategy(): GlobalVerificationStrategy {
    core.info('Get global_verification_strategy.');
    const input = core.getInput('global_verification_strategy');
    if (REMOVED_STRATEGIES.has(input)) {
      throw new Error(ERR_STRATEGY_REMOVED(input));
    }
    switch (input) {
      case 'linked':
        return GlobalVerificationStrategy.Linked;
      case 'disabled':
        return GlobalVerificationStrategy.Disabled;
      default:
        throw new Error(ERR_INPUT_INVALID('global_verification_strategy', input));
    }
  }

  getGitHubApiToken(): string {
    core.info('Get github_api_token.');
    return core.getInput('github_api_token', { required: true });
  }

  getLinearApiKey(): string {
    core.info('Get linear_api_key.');
    return core.getInput('linear_api_key');
  }

  getLinearClientId(): string {
    core.info('Get linear_client_id.');
    return core.getInput('linear_client_id');
  }

  getLinearClientSecret(): string {
    core.info('Get linear_client_secret.');
    return core.getInput('linear_client_secret');
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

  getTargetBranches(): string[] {
    core.info('Get target_branches.');
    return core
      .getMultilineInput('target_branches')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
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
