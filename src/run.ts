import * as core from '@actions/core';

import { GitHubClientI, PullRequest } from './client-github';
import { GlobalVerificationStrategy, InputsClientI } from './client-inputs';
import { LinearClientI } from './client-linear';
import { ERR_ATTACHMENT_NOT_FOUND, ERR_ISSUE_NOT_FOUND, ERR_NO_ISSUE_REFERENCE } from './errors';

const ISSUE_ID_PATTERN = /[A-Z]+-\d+/g;
const NOID_TITLE_PATTERN = /^\s*\[NOID\]/i;
const NO_LINEAR_LABEL = 'no linear';
const ATTACHMENT_RETRY_DELAYS_MS = [0, 5000, 10000, 15000];

const run = async (
  inputs: InputsClientI,
  github: GitHubClientI,
  linearFactory: () => LinearClientI,
  retryDelaysMs: number[] = ATTACHMENT_RETRY_DELAYS_MS,
): Promise<void> => {
  const strategy = inputs.getGlobalVerificationStrategy();
  if (strategy === GlobalVerificationStrategy.Disabled) {
    core.info('global_verification_strategy is disabled; skipping checks.');
    return;
  }

  const pullRequest = await github.getPullRequest(
    inputs.getPullRequestNumber(),
    inputs.getGithubRepositoryOwner(),
    inputs.getGitHubRepositoryName(),
  );

  const targetBranches = inputs.getTargetBranches();
  if (targetBranches.length > 0 && !targetBranches.includes(pullRequest.baseRefName)) {
    core.info(
      `Pull request base branch "${
        pullRequest.baseRefName
      }" is not in target_branches (${targetBranches.join(', ')}); skipping checks.`,
    );
    return;
  }

  if (isOptedOut(pullRequest)) {
    core.info('Pull request is opted out of Linear traceability checks.');
    return;
  }

  const candidateIds = extractIssueIds(pullRequest);
  if (candidateIds.length === 0) {
    throw new Error(ERR_NO_ISSUE_REFERENCE());
  }
  core.info(`Candidate Linear issue IDs: ${candidateIds.join(', ')}.`);

  const linear = linearFactory();
  const prUrl = normalizeUrl(pullRequest.url);

  let existingIds: string[] = [];
  for (let attempt = 0; attempt < retryDelaysMs.length; attempt++) {
    if (retryDelaysMs[attempt] > 0) {
      core.info(`Linear attachment not yet registered; retrying in ${retryDelaysMs[attempt]}ms.`);
      await sleep(retryDelaysMs[attempt]);
    }

    const results = await Promise.all(
      candidateIds.map(async (id) => {
        const urls = await linear.getIssueAttachmentUrls(id);
        return { id, urls };
      }),
    );

    existingIds = results.filter((r) => r.urls !== null).map((r) => r.id);
    if (existingIds.length === 0) {
      throw new Error(ERR_ISSUE_NOT_FOUND(candidateIds));
    }

    const attached = results.some(
      (r) => r.urls !== null && r.urls.some((u) => normalizeUrl(u) === prUrl),
    );
    if (attached) {
      core.info('Pull request is attached to a Linear issue.');
      return;
    }
  }

  throw new Error(ERR_ATTACHMENT_NOT_FOUND(existingIds, pullRequest.url));
};

const isOptedOut = (pullRequest: PullRequest): boolean => {
  if (pullRequest.labels.some((l) => l.name.trim().toLowerCase() === NO_LINEAR_LABEL)) return true;
  if (NOID_TITLE_PATTERN.test(pullRequest.title)) return true;
  return false;
};

const extractIssueIds = (pullRequest: PullRequest): string[] => {
  const haystack = [
    pullRequest.title,
    pullRequest.body ?? '',
    pullRequest.headRefName.toUpperCase(),
  ].join('\n');
  const matches = haystack.match(ISSUE_ID_PATTERN) ?? [];
  return Array.from(new Set(matches));
};

const normalizeUrl = (url: string): string => url.toLowerCase().replace(/\/+$/, '');

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export { run };
