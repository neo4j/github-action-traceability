Hello
# Traceability GitHub Action

![](assets/trello-github.png)

# Introduction

This GitHub Action exists for the sole purpose of linking Trello cards to git commits. So that when you look at your
project's work history in git, you can easily trace back each code change to a nicely documented Trello card. 

Depending on how you want to configure this GitHub Action for your project, you will be able to:
- enforce that git commit messages contain a Trello card short link
- enforce that PR title contain a Trello card short link
- enforce that the Trello card exists and is open
- automatically add an attachment to a Trello card containing the GitHub PR

# Commit Message Structure

Include your short link in each of your commit messages: 
- The short link needs to appear at the beginning of the commit message 
- The short link needs to be between square brackets

```bash
git commit -m "[i19tvtq1] Description of my change"
```

Trello short links can be found in the card URL. Below, the short link is highlighted in blue.

![](assets/trello-short-link.png)

# Setup Overview

In order to enable this GitHub action, you need to add it to your existing repository and let it run on PR builds. This
GitHub action is setup in this repository, please visit the following files for examples.

- [traceability-comments.yaml](./.github/workflows/traceability-comments.yaml)
- [traceability-comments-trigger.yaml](./.github/workflows/traceability-comments-trigger.yaml)
- [traceability-commits.yaml](./.github/workflows/traceability-commits.yaml)
- [traceability-title.yaml](./.github/workflows/traceability-title.yaml)
- [traceability-disabled.yaml](./.github/workflows/traceability-disabled.yaml)

# Setup Inputs in Detail

### global_verification_strategy

**Default**: `commits`

| Option       | Descriptions                                                                                                      |
|--------------|-------------------------------------------------------------------------------------------------------------------|
| **comments** | The GHA will only check the comments contained within your PR.                                                    | 
| **commits**  | The GHA will only check the commits contained within your PR.                                                     |
| **title**    | The GHA will only check the title contained within your PR.                           |
| **disabled** | Disables the GHA. If you intend to permanently disable the GHA, then you should just remove it from your project. |

### trello_api_key

Use the public key of the existing PowerUp 
[ManageTrelloPowerUps>GithubIntegration](https://trello.com/power-ups/639711253572cf0030b9bb20/edit/api-key).

Alternatively, follow instructions 
[here](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/#managing-your-api-key) 
and make your own power up. It takes 5 minutes, and you don't need particularly advanced privileges to create it.

### trello_api_token

Go to existing PowerUp in 
[ManageTrelloPowerUps>GithubIntegration](https://trello.com/power-ups/639711253572cf0030b9bb20/edit/api-key) 
and click on "Token".

Alternatively, follow instructions 
[here](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/#managing-your-api-key)
and make your own power up. It takes 5 minutes, and you don't need particularly advanced privileges to create it.

### github_api_token

Included by default in your GitHub CI.

# Contributing

Please check out [CONTRIBUTING.md](CONTRIBUTING.md).
