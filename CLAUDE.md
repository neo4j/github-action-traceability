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

**Important**: `dist/index.js` and `lib/` (tsc output, shipped per `package.json` `files`) are committed release artifacts. After any source change, run `yarn package` end-to-end — *not* the individual sub-steps — and commit `src/`, `dist/`, and `lib/` together. `package` runs `format` first; running `lint`/`compile`/`test`/`build` à la carte will skip Prettier and the `git diff` check in `build.yaml` will fail CI.

## Architecture

**Entry point**: `src/index.ts` constructs the `InputsClient`, `GitHubClient`, and a lazy `LinearClient` factory, then calls `run()` in `src/run.ts`.

**Strategy enum** (`GlobalVerificationStrategy`): two values, `Linked` (default) and `Disabled`. Legacy values (`commits`, `title`, `title-or-description`, `comments`) throw `ERR_STRATEGY_REMOVED` with a migration hint.

**Clients** (all interface-backed for testability):
- `client-inputs.ts` — reads GitHub Action inputs (`global_verification_strategy`, `github_api_token`, `linear_api_key`, `linear_client_id`, `linear_client_secret`, `target_branches`) and the `@actions/github` PR context. All Linear credential inputs are optional; `linear-auth.ts` enforces that at least one is present.
- `client-github.ts` — GitHub GraphQL wrapper. Returns `{ url, title, body, headRefName, author, labels }`. (Commits and comments are deliberately not fetched — Linear's link-detection doesn't use them.)
- `client-linear.ts` — thin `fetch`-based wrapper around `https://api.linear.app/graphql`. Primitive `getIssueAttachmentUrls(identifier)` returns the attachment URLs on an issue, or `null` if the issue doesn't exist; it sends `Authorization` **verbatim** (the value the constructor receives). Also exports `fetchLinearAppActorToken(clientId, clientSecret)`, which POSTs the `client_credentials` grant to `https://api.linear.app/oauth/token` and returns a 30-day app token. Auth/rate-limit errors surface via `ERR_LINEAR_AUTH` / `ERR_LINEAR_RATE_LIMITED`. **Don't reintroduce `@linear/sdk`**: its published artifact statically embeds `graphql@15.x`, which ncc inlines into `dist/index.js` and trips security scanners; `resolutions` can't reach it.
- `linear-auth.ts` — `resolveLinearAuthorization(inputs)` returns the `Authorization` header value: a raw personal API key (sent verbatim), or `Bearer <app token>` minted fresh per run via client credentials. Client credentials take precedence when both are set; throws `ERR_NO_LINEAR_AUTH` when neither is. `index.ts` wraps this in an **async** `linearFactory` (`run()` awaits the factory), so the token is only fetched when the Linked strategy actually reaches Linear.

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

HTTP-level error mapping for the real `LinearClient` (401/403/429, GraphQL `NotFound`, auth/rate-limit envelopes) is tested in `test/client-linear.test.ts` by stubbing `global.fetch`. Strategy tests use `LinearClientBuilder` and never hit fetch.

**Self-testing**: `.github/workflows/traceability.yaml` uses `uses: ./` and runs the in-tree action against PRs to this repo. Every PR dogfoods the build in `dist/index.js`. The example workflow file therefore differs slightly from how a downstream consumer would reference the action (`uses: neo4j/github-action-traceability@v3`).

Node version: 20.x (see `.nvmrc`). The action runtime is `node20` (see `action.yml`). The fetch-based Linear client relies on Node 18+'s built-in `fetch`.

## Release

1. `yarn package` — builds and bundles
2. Commit `src/`, `dist/`, and `lib/` together (use `[NOID]` prefix if no Linear issue applies — this repo's own action will check the PR)
3. Merge to `dev`, then tag: `git tag v3.x.y && git tag -f v3 && git push origin --tags --force`
4. Create GitHub release with changelog. Note breaking changes from `v2`.
