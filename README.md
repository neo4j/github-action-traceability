# Linear Traceability GitHub Action

![](assets/GitHub_Linear_Gemini_Generated.png)

A GitHub Action that enforces Linear issue traceability on pull requests. It verifies — by calling the Linear API — that every PR is either linked to a real Linear issue or explicitly opted out.

## What "linked" means

Linear's GitHub integration auto-links a PR to an issue when the issue identifier (e.g. `NEO-123`) appears in any of:

- The pull request title (bare or bracketed)
- The pull request description (with or without a closing keyword like `Closes`, `Fixes`, `Resolves`)
- The head branch name (case-insensitive substring)

Linear does **not** scan commit messages or PR comments. This action mirrors that behavior: it scans the same three locations for `[A-Z]+-\d+` substrings, then asks Linear (a) whether each referenced issue exists and (b) whether the PR is registered as an attachment on it.

When Linear has registered the link, the check passes. When the issue is missing or no attachment is registered (and won't be after a brief retry), the check fails with an actionable error.

## Strategies

| Option | Description |
|--------|-------------|
| `linked` (default) | Verifies via the Linear API that the PR is linked to at least one existing Linear issue. |
| `disabled` | No-op. Use to install the action without enforcement, e.g. while migrating. |

## Opt-out

Two mechanisms skip the check:

- **`No Linear` PR label** (case-insensitive) — apply via the GitHub UI when a PR is intentionally unrelated to any Linear issue.
- **`[NOID]` prefix in the PR title** (case-insensitive) — for example, `[NOID] Bump dependency versions`.

Either is sufficient. The action exits successfully without calling the Linear API.

## Setup

```yaml
# .github/workflows/traceability.yaml
name: traceability
on:
  pull_request:
    types: [opened, edited, reopened, synchronize, labeled, unlabeled]
jobs:
  traceability:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: neo4j/github-action-traceability@v3
        with:
          global_verification_strategy: linked
          github_api_token: ${{ secrets.GITHUB_TOKEN }}
          linear_api_key: ${{ secrets.LINEAR_API_KEY }}
```

### Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `global_verification_strategy` | no | `linked` (default) or `disabled`. |
| `github_api_token` | yes | GitHub token. The default `${{ secrets.GITHUB_TOKEN }}` works. |
| `linear_api_key` | when strategy is `linked` | Linear personal API key. Create one at **Linear Settings → API → Personal API keys**. Store as a GitHub secret. |

### Why a Linear API key (and not just OAuth)

A personal API key is the simplest credential for unattended CI use. It has read access to the Linear workspace it was created in. Issue ID lookups and attachment listing are read-only operations.

## Behavior

### Retry on Linear processing latency

When a PR opens, Linear's integration takes a few seconds to register the GitHub PR as an attachment on the referenced issue. The action retries the attachment check four times over roughly 30 seconds before failing, so a brand-new PR is unlikely to flake.

### Multiple issues per PR

Linear supports multiple issue IDs in a single PR (e.g. `Fixes NEO-123, NEO-456`). The action passes when **at least one** of the referenced issues exists *and* has the PR registered as an attachment.

### Pull requests from forks

`secrets.LINEAR_API_KEY` is unavailable to workflows triggered by `pull_request` events from forks. Such PRs will fail with an authentication error. If your project accepts contributions from forks, use `pull_request_target` instead (with the standard security caveats — review the secrets exposure carefully).

## Migration from earlier versions

Earlier versions (`v1`, `v2`) used Trello and offered five string-matching strategies (`commits`, `title`, `title-or-description`, `comments`, `disabled`). All of those except `disabled` have been removed. If you used:

- `commits` — Linear does not scan commit messages, so per-commit enforcement no longer matches Linear's link-detection. Switch to `linked`.
- `title`, `title-or-description`, or `comments` — switch to `linked`. The check now covers title, description, *and* branch name in one strategy.
- `[abc123]` Trello short links in commit/title prefixes — these are no longer recognized. Use Linear-style `NEO-123` (anywhere in title, description, or branch).
- The `No Trello` label — rename to `No Linear`.
- The `trello_api_key` and `trello_api_token` inputs — remove them. Add `linear_api_key`.

Workflows that still set `global_verification_strategy: commits` (or any other removed value) will fail loudly with a migration error.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
