# Traceability GitHub Action

## Introduction

This GitHub Action exists for the sole purpose of linking Trello tickets to git commits. So that when you look at your
project's work history in git, you can easily trace back each code change to a nicely documented Trello card. 

Depending on how you want to configure this GitHub Action for your project, you will be able to:
- enforce that git commit messages contain a Trello card short link
- enforce that PR title contain a Trello card short link
- enforce that the Trello card exists and is open
- automatically add an attachment to a Trello card containing the GitHub PR

## Instructions for Every Day Users

Include the short link of the Trello ticket you are working on to each of your commit message. The short link needs to
appear at the beginning of the commit message and needs to be between brackets, like in the example below.

```bash
git commit -m "[i19tvtq1] Description of my change"
```

Trello short links are in the URL of your ticket (see highlighted section in the example below).

![](assets/trello-short-link.png)


## Instructions for Initial Setup and Configuration

// daniel finish README.md
// daniel action.yml options...

In order to enable this GitHub action, you need to add it to your existing repository and let it run on PR builds.

```

```

## Instructions for Maintainers

You need to commit the lib/index.js artifact because that is what the GitHub Action will end up using. There is 
currently no CI for this project, please manually ensure everything works before opening a PR.

### yarn install

Installs all the dependencies you need to make the other commands run, and to build your project.

### yarn clean

Deletes the build (./lib) artefacts/

### yarn format

Format the code to make it consistent with the formatting rules.

### yarn lint

Lints the code to make it consistent with the linting rules.

### yarn compile

Compiles the Typescript src files into their corresponding Javascript files in lib.

### yarn build

Compiles the Typescript src files into a single Javascript file in dist.

### yarn test

Tests the code.

### yarn shadow

Compiles the Typescript project into a single lib/index.js file. 

### yarn package

Does all of the above, building the project only once it's been formatted, linted, and tested.
