import { describe, it } from '@jest/globals';
import { InputsClientBuilder } from './utils/dummy-client-inputs';
import { GitHubClientBuilder } from './utils/dummy-client-github';
import { LinearClientBuilder } from './utils/dummy-client-linear';
import { GlobalVerificationStrategy } from '../src/client-inputs';
import { LinearClientI } from '../src/client-linear';
import { expectSuccess, expectThrows } from './utils/test-utils';
import { run } from '../src/run';
import {
  ERR_ATTACHMENT_NOT_FOUND,
  ERR_ISSUE_NOT_FOUND,
  ERR_LINEAR_AUTH,
  ERR_NO_ISSUE_REFERENCE,
} from '../src/errors';

const PR_URL = 'https://github.com/neo4j/apoc/pull/1';
const NO_RETRY: number[] = [0]; // single attempt, used everywhere except the retry test

const factoryOf = (linear: LinearClientI) => () => linear;

describe('GlobalVerificationStrategy.Linked', () => {
  describe('success paths', () => {
    it('passes when the title contains a bracketed Linear issue ID and the PR is attached', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('[NEO-123] My feature')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('awaits an async linear factory (e.g. one that fetches an app token first)', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('[NEO-123] My feature')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      const asyncFactory = () => Promise.resolve(linear);
      await expectSuccess(run(inputs, github, asyncFactory, NO_RETRY));
    });

    it('passes when the title contains a bare Linear issue ID (no brackets)', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('NEO-123 My feature')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('passes when the body contains a Linear issue ID with a closing keyword', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('My feature')
        .withPullRequestBody('Closes NEO-123 and adds documentation.')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('passes when the head branch ref contains an uppercase issue ID', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('My feature')
        .withHeadRefName('feature/NEO-123-stuff')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('passes when the head branch ref contains a lowercase issue ID', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('My feature')
        .withHeadRefName('arne/neo-123-stuff')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('passes when one of multiple referenced IDs is valid and attached', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('NEO-99999 (typo) and the real NEO-123')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('passes when the attachment is registered on a later retry attempt', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('[NEO-123] My feature')
        .build();
      const linear = new LinearClientBuilder()
        .withExistingIssue('NEO-123')
        .withAttachmentRegisteredOnAttempt('NEO-123', PR_URL, 3)
        .build();
      await expectSuccess(run(inputs, github, factoryOf(linear), [0, 0, 0, 0]));
    });

    it('passes the URL match case-insensitively and ignoring trailing slashes', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl('https://github.com/Neo4j/Apoc/pull/1')
        .withPullRequestTitle('[NEO-123] My feature')
        .build();
      const linear = new LinearClientBuilder()
        .withAttachedPullRequest('NEO-123', 'https://github.com/neo4j/apoc/pull/1/')
        .build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });
  });

  describe('opt-out', () => {
    it('passes without calling Linear when the "No Linear" label is present', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('Untracked work')
        .withPullRequestLabel('No Linear')
        .build();
      const linear = new LinearClientBuilder().withAuthFailure().build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('treats label name comparison as case-insensitive', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('Untracked work')
        .withPullRequestLabel('no linear')
        .build();
      const linear = new LinearClientBuilder().withAuthFailure().build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('passes without calling Linear when the title is prefixed with [NOID]', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[NOID] Untracked work')
        .build();
      const linear = new LinearClientBuilder().withAuthFailure().build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('treats the [NOID] marker case-insensitively', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('[noid] untracked work')
        .build();
      const linear = new LinearClientBuilder().withAuthFailure().build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });
  });

  describe('failure paths', () => {
    it('fails when no issue ID is referenced anywhere', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('My feature')
        .withPullRequestBody('No issue here.')
        .withHeadRefName('feature/no-issue')
        .build();
      const linear = new LinearClientBuilder().build();
      await expectThrows(
        run(inputs, github, factoryOf(linear), NO_RETRY),
        ERR_NO_ISSUE_REFERENCE(),
      );
    });

    it('fails when all referenced issue IDs are not found in Linear', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('NEO-99999 a typo, FAKE-1 also typo')
        .build();
      const linear = new LinearClientBuilder().build();
      await expectThrows(
        run(inputs, github, factoryOf(linear), NO_RETRY),
        ERR_ISSUE_NOT_FOUND(['NEO-99999', 'FAKE-1']),
      );
    });

    it('fails when the issue exists but no attachment is registered after retries', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('[NEO-123] My feature')
        .build();
      const linear = new LinearClientBuilder().withExistingIssue('NEO-123').build();
      await expectThrows(
        run(inputs, github, factoryOf(linear), [0, 0]),
        ERR_ATTACHMENT_NOT_FOUND(['NEO-123'], PR_URL),
      );
    });

    it('propagates Linear auth errors', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder().withPullRequestTitle('[NEO-123] My feature').build();
      const linear = new LinearClientBuilder().withAuthFailure().build();
      await expectThrows(run(inputs, github, factoryOf(linear), NO_RETRY), ERR_LINEAR_AUTH());
    });
  });

  describe('target_branches', () => {
    it('runs verification when target_branches is empty (no filter)', async () => {
      const inputs = new InputsClientBuilder().build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('[NEO-123] My feature')
        .withBaseRefName('release/1.2')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('runs verification when the PR base branch is in target_branches', async () => {
      const inputs = new InputsClientBuilder().withTargetBranches(['dev']).build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('[NEO-123] My feature')
        .withBaseRefName('dev')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('skips verification when the PR base branch is not in target_branches', async () => {
      const inputs = new InputsClientBuilder().withTargetBranches(['dev']).build();
      const github = new GitHubClientBuilder()
        .withPullRequestTitle('No issue reference')
        .withBaseRefName('2026.05')
        .build();
      const linear = new LinearClientBuilder().withAuthFailure().build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });

    it('matches against any entry when target_branches has multiple values', async () => {
      const inputs = new InputsClientBuilder().withTargetBranches(['dev', 'main']).build();
      const github = new GitHubClientBuilder()
        .withPullRequestUrl(PR_URL)
        .withPullRequestTitle('[NEO-123] My feature')
        .withBaseRefName('main')
        .build();
      const linear = new LinearClientBuilder().withAttachedPullRequest('NEO-123', PR_URL).build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });
  });

  describe('disabled strategy', () => {
    it('is a no-op', async () => {
      const inputs = new InputsClientBuilder()
        .withGlobalVerificationStrategy(GlobalVerificationStrategy.Disabled)
        .build();
      const github = new GitHubClientBuilder().withPullRequestTitle('No issue ID anywhere').build();
      const linear = new LinearClientBuilder().withAuthFailure().build();
      await expectSuccess(run(inputs, github, factoryOf(linear), NO_RETRY));
    });
  });
});
