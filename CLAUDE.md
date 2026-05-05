# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A GitHub Action that verifies — via the Linear API — that every pull request is either linked to a real Linear issue or explicitly opted out. Linear's GitHub integration auto-links PRs whose title, description, or branch name references an issue ID (e.g. `NEO-123`); this action checks that Linear has actually registered the link, rather than just string-matching.

## Commands

```bash
yarn install        # install dependencies
yarn lint           # ESLint check
yarn format         # Prettier format
yarn compile        # tsc → lib/
yarn test           # Jest
yarn build          # Vercel NCC bundle → dist/index.js
yarn package        # full pipeline: clean → format → lint → compile → test → build
```

Run a single test file:
```bash
yarn test test/strategy-linked.test.ts
```

**Important**: `dist/index.js` is the bundled release artifact that must be committed. After any source change, run `yarn package` and commit both `src/` and `dist/` changes together. The `build.yaml` workflow enforces this with a `git diff` check.

## Architecture

**Entry point**: `src/index.ts` constructs the `InputsClient`, `GitHubClient`, and a lazy `LinearClient` factory, then calls `run()` in `src/run.ts`.

**Strategy enum** (`GlobalVerificationStrategy`): two values, `Linked` (default) and `Disabled`. Legacy values (`commits`, `title`, `title-or-description`, `comments`) throw `ERR_STRATEGY_REMOVED` with a migration hint.

**Clients** (all interface-backed for testability):
- `client-inputs.ts` — reads GitHub Action inputs (`global_verification_strategy`, `github_api_token`, `linear_api_key`) and the `@actions/github` PR context.
- `client-github.ts` — GitHub GraphQL wrapper. Returns `{ url, title, body, headRefName, author, labels }`. (Commits and comments are deliberately not fetched — Linear's link-detection doesn't use them.)
- `client-linear.ts` — wraps `@linear/sdk`. Single primitive: `getIssueAttachmentUrls(identifier)` returns the attachment URLs on an issue, or `null` if the issue doesn't exist. Auth/rate-limit errors surface via `ERR_LINEAR_AUTH` / `ERR_LINEAR_RATE_LIMITED`.

**Errors**: `src/errors.ts` holds all user-facing error message constants. Linked-strategy errors (`ERR_NO_ISSUE_REFERENCE`, `ERR_ISSUE_NOT_FOUND`, `ERR_ATTACHMENT_NOT_FOUND`, `ERR_LINEAR_AUTH`, `ERR_LINEAR_RATE_LIMITED`, `ERR_STRATEGY_REMOVED`) are tuned to be self-explanatory in CI logs.

**Linked-strategy flow** (in `src/run.ts`):
1. If the `No Linear` label (case-insensitive) is on the PR, or the title is prefixed with `[NOID]` (case-insensitive), return success without calling Linear.
2. Extract candidate issue IDs by running `/[A-Z]+-\d+/g` over `title + '\n' + body + '\n' + headRefName.toUpperCase()` and de-duplicating. Branch refs are uppercased so lowercase branches like `arne/neo-123-foo` match.
3. If no IDs found → throw `ERR_NO_ISSUE_REFERENCE`.
4. Inside a retry loop (default delays `[0, 5000, 10000, 15000]` ms — ~30s total): fetch attachments for every candidate ID in parallel. If none of the IDs exist → throw `ERR_ISSUE_NOT_FOUND` listing what was tried. If at least one exists *and* has the PR URL among its attachments → success. Otherwise wait and retry.
5. After all retries exhaust without finding the attachment → throw `ERR_ATTACHMENT_NOT_FOUND`.

The retry loop lives in `run.ts`, not `client-linear.ts`, because it needs to span all candidate IDs in parallel. Retry intervals are an injectable parameter on `run()` so tests can pass `[0]` (single attempt, no waiting) or `[0, 0, 0, 0]` (four attempts, no waiting) to drive specific paths.

**Data flow**: inputs → fetch PR via GraphQL → extract candidate IDs (title + body + branch) → for each ID, fetch attachments from Linear → succeed if any has the PR URL.

## Testing

Tests live in `test/`. Builder pattern test doubles in `test/utils/`:
- `InputsClientBuilder` — defaults to `Linked` strategy with a fake API key.
- `GitHubClientBuilder` — `withPullRequestTitle`, `withPullRequestBody`, `withHeadRefName`, `withPullRequestLabel`, `withPullRequestUrl`.
- `LinearClientBuilder` — `withExistingIssue`, `withAttachedPullRequest`, `withAuthFailure`, `withAttachmentRegisteredOnAttempt(id, prUrl, n)` for retry tests. Builds a `DummyLinearClient` that counts calls per issue identifier.

Use `expectSuccess` / `expectThrows` helpers from `test/utils/test-utils.ts`. Pass `[0]` as the `retryDelaysMs` argument to `run()` for normal tests; pass `[0, 0, 0, 0]` for retry-path tests.

**Self-testing**: `.github/workflows/traceability.yaml` uses `uses: ./` and runs the in-tree action against PRs to this repo. Every PR dogfoods the build in `dist/index.js`. The example workflow file therefore differs slightly from how a downstream consumer would reference the action (`uses: neo4j/github-action-traceability@v3`).

Node version: 20.x (see `.nvmrc`). The action runtime is `node20` (see `action.yml`); `@linear/sdk` requires Node 18+.

## Release

1. `yarn package` — builds and bundles
2. Commit `src/` + `dist/` together (use `[NOID]` prefix if no Linear issue applies — this repo's own action will check the PR)
3. Merge to `dev`, then tag: `git tag v3.x.y && git tag -f v3 && git push origin --tags --force`
4. Create GitHub release with changelog. Note breaking changes from `v2`.
