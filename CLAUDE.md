# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A GitHub Action that enforces Linear issue traceability on PRs. It verifies that every PR references a Linear issue (via commit messages, PR title, or PR comments). The actual PR-to-issue linking in Linear is handled automatically by the Linear GitHub integration — this action only validates that a Linear issue ID is present.

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
yarn test test/strategy-comments.test.ts
```

**Important**: `dist/index.js` is the bundled release artifact that must be committed. After any source change, run `yarn package` and commit both `src/` and `dist/` changes together.

## Architecture

**Entry point**: `src/index.ts` initialises clients and calls `run()` in `src/run.ts`.

**Strategy pattern**: `run()` switches on `GlobalVerificationStrategy` (`Commits` | `Title` | `Comments` | `Disabled`), each branch applying different extraction and validation logic.

**Clients** (all interface-backed for testability):
- `client-inputs.ts` — reads GitHub Action inputs and `@actions/github` context
- `client-github.ts` — GitHub GraphQL wrapper (PR commits, comments, labels)

**Services**:
- `service-utils.ts` — short-link extraction; `[TEAM-123]` format for Linear issue IDs, `[NOID]` for intentionally unlinked commits
- `service-validations.ts` — validates that short link collections contain only Linear issue links (not NOIDs)
- `errors.ts` — error message constants
- `client-trello.ts` — holds the `ShortLink` type hierarchy: `LinearIssueLink` and `NoIdShortLink`

**Short link format**: `[TEAM-123] description` where `TEAM` is all uppercase letters and `123` is a number. For commits/titles with no associated issue, use `[NOID]`.

**Comments strategy**: checks PR comments for a `https://linear.app/WORKSPACE/issue/TEAM-123/...` URL. The `No Linear` label on a PR exempts it from the comments strategy check.

**Data flow**: inputs → fetch PR via GraphQL → extract short links (strategy-dependent) → validate format → done (no API calls to Linear).

## Testing

Tests live in `test/`. Builder pattern test doubles in `test/utils/` (`InputsClientBuilder`, `GitHubClientBuilder`) construct fake clients for each test. Use `expectSuccess` / `expectThrows` helpers defined in `test/utils/test-utils.ts`.

Node version: 16.9.1 (see `.nvmrc`). Use `nvm use` before running commands.

## Release

1. `yarn package` — builds and bundles
2. Commit `src/` + `dist/` together (use `[NOID]` prefix if no Linear issue)
3. Merge to `dev`, then tag: `git tag v2.x.y && git tag -f v2 && git push origin --tags --force`
4. Create GitHub release with changelog
