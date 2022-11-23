import * as core from '@actions/core';
import * as github from '@actions/github';
import { getGitHubAPIToken } from './utils';
import { graphql } from '@octokit/graphql';
import { GhCommitEdgeItem, GhRepositoryResponseData } from './types';

const getContextEvent = (): string | undefined => github.context.eventName;
const getSupportedEvent = (): string => 'pull_request';
const isSupportedEvent = (): boolean => getContextEvent() === getSupportedEvent();

const getContextAction = (): string | undefined => github.context.payload.action;
const getSupportedActions = (): string[] => ['opened', 'reopened', 'edited'];
const isSupportedAction = (): boolean =>
  getSupportedActions().some((el) => el === getContextAction());

const getPullRequestUrl = (): string => {
  core.debug('Get pull request url');

  if (!github.context.payload) throw new Error('No payload found in the context.');
  if (!github.context.payload.pull_request)
    throw new Error('No pull request found in the payload.');
  if (!github.context.payload.pull_request.html_url)
    throw new Error('No pull request url found in the payload.');

  return github.context.payload.pull_request.html_url;
};

const getPullRequestTitle = (): string => {
  core.debug('Get pull request title');

  if (!github.context.payload) throw new Error('No payload found in the context.');
  if (!github.context.payload.pull_request)
    throw new Error('No pull request found in the payload.');
  if (!github.context.payload.pull_request.title)
    throw new Error('No title found in the pull request.');

  return github.context.payload.pull_request.title;
};

const getPullRequestCommitMessages = async (): Promise<string[]> => {
  core.debug('Get pull request commits');

  if (!github.context.payload) throw new Error('No payload found in the context.');
  if (!github.context.payload.pull_request)
    throw new Error('No pull request found in the payload.');
  if (!github.context.payload.pull_request.number)
    throw new Error('No number found in the pull request.');
  if (!github.context.payload.repository) throw new Error('No repository found in the payload.');
  if (!github.context.payload.repository.name) throw new Error('No name found in the repository.');
  if (
    !github.context.payload.repository.owner ||
    (!github.context.payload.repository.owner.login &&
      !github.context.payload.repository.owner.name)
  )
    throw new Error('No owner found in the repository.');

  const variables = {
    baseUrl: 'https://api.github.com',
    repositoryOwner:
      github.context.payload.repository.owner.name || github.context.payload.repository.owner.login,
    repositoryName: github.context.payload.repository.name,
    pullRequestNumber: github.context.payload.pull_request.number,
    headers: {
      authorization: `token ${getGitHubAPIToken()}`,
    },
  };

  const query = `
      query commitMessages(
        $repositoryOwner: String!
        $repositoryName: String!
        $pullRequestNumber: Int!
        $numberOfCommits: Int = 100
      ) {
        repository(owner: $repositoryOwner, name: $repositoryName) {
          pullRequest(number: $pullRequestNumber) {
            commits(last: $numberOfCommits) {
              edges {
                node {
                  commit {
                    message
                  }
                }
              }
            }
          }
        }
      }
    `;

  const response = await graphql<GhRepositoryResponseData>(query, variables);
  const repository = response.repository;
  return repository.pullRequest.commits.edges.map(
    (edge: GhCommitEdgeItem) => edge.node.commit.message,
  );
};

export {
  getPullRequestUrl,
  getContextEvent,
  getSupportedEvent,
  isSupportedEvent,
  getContextAction,
  getSupportedActions,
  isSupportedAction,
  getPullRequestTitle,
  getPullRequestCommitMessages,
};
