// daniel check all action types (push, pull_request_target, etc)
// daniel check event type "synchronize"
// daniel lock down the AzuObs repositor permissions

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

# Setting Up Your GitHub Action

In order to enable this GitHub action, you need to add it to your existing repository and let it run on PR builds.

// daniel
```yml

```

# Contributing

Please check out [CONTRIBUTING.md](CONTRIBUTING.md).