import {
  CommitVerificationStrategy,
  NoIdVerificationStrategy,
  TitleVerificationStrategy,
} from './types';
import * as core from '@actions/core';

const REGEX_TRELLO_SHORT_LINK = new RegExp('^\\[([a-z0-9]+|NOID)\\].+');
const REGEX_TRELLO_NOID_CASE_INSENSITIVE = new RegExp('^\\[NOID\\]', 'i');
const REGEX_TRELLO_NOID_UPPERCASE = new RegExp('^\\[NOID\\]');
const REGEX_TRELLO_NOID_LOWERCASE = new RegExp('^\\[noid\\]');

const getNoIdVerificationStrategy = (): NoIdVerificationStrategy => {
  const input = core.getInput('noid_verification_strategy');
  switch (input) {
    case 'CASE_INSENSITIVE':
      return NoIdVerificationStrategy.CASE_INSENSITIVE;
    case 'UPPER_CASE':
      return NoIdVerificationStrategy.UPPER_CASE;
    case 'LOWER_CASE':
      return NoIdVerificationStrategy.LOWER_CASE;
    case 'NEVER':
      return NoIdVerificationStrategy.NEVER;
    default:
      throw new Error(`Unrecognised value ${input} for "noid_verification_strategy"`);
  }
};

const getCommitVerificationStrategy = (): CommitVerificationStrategy => {
  const input = core.getInput('commit_verification_strategy');
  switch (input) {
    case 'ALL_COMMITS':
      return CommitVerificationStrategy.ALL_COMMITS;
    case 'HEAD_COMMIT_ONLY':
      return CommitVerificationStrategy.HEAD_COMMIT_ONLY;
    case 'NEVER':
      return CommitVerificationStrategy.NEVER;
    default:
      throw new Error(`Unrecognised value ${input} for "commit_verification_strategy"`);
  }
};

const getTitleVerificationStrategy = (): TitleVerificationStrategy => {
  const input = core.getInput('title_verification_strategy');
  switch (input) {
    case 'ALWAYS':
      return TitleVerificationStrategy.ALWAYS;
    case 'IF_EXISTS':
      return TitleVerificationStrategy.IF_EXISTS;
    case 'NEVER':
      return TitleVerificationStrategy.NEVER;
    default:
      throw new Error(`Unrecognised value ${input} for "title_verification_strategy"`);
  }
};

const getTrelloApiKey = (): string => {
  return core.getInput('trello_api_key', { required: true });
};

const getTrelloApiToken = (): string => {
  return core.getInput('trello_api_token', { required: true });
};

const getGithubAPIToken = (): string => {
  return core.getInput('github_api_token', { required: true });
};

export {
  getNoIdVerificationStrategy,
  getCommitVerificationStrategy,
  getTitleVerificationStrategy,
  getTrelloApiKey,
  getTrelloApiToken,
  getGithubAPIToken,
  REGEX_TRELLO_SHORT_LINK,
  REGEX_TRELLO_NOID_CASE_INSENSITIVE,
  REGEX_TRELLO_NOID_UPPERCASE,
  REGEX_TRELLO_NOID_LOWERCASE,
};
