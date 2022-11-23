// daniel write readm.md
// daniel vulnerable packages

# Traceability Github Action

## Introduction
This Github Action exists for the sole purpose of linking Trello tickets to git commits. Depending on how the 
Action is configured in your project, you will be able to:
- enforce that git commit messages contain a Trello card id
- enforce that PR title contain a Trello card id
- enforce that the Trello card id is real
- automatically add an attachment to a Trello card containing the Github PR

## For Users 

// daniel

In order to enable this github action, you need to add it to your existing repository and let it run on PR builds.

```


```

## For Maintainers

You need to commit the lib/index.js artifact because that is what the Github Action will end up using. There is 
currently no CI for this project, please manually ensure everything works before opening a PR.

### yarn clean

Deletes the build (./lib) artefacts/

### yarn build

Formats the code to make it consistent with the formatting rules. Does not run tests.

### yarn lint

Lints the code to make it consistent with the linting rules.

### yarn test

Tests the code.

### yarn shadow

Compiles the Typescript project into a single lib/index.js file. 

### yarn package

Does all of the above, building the project only once it's been formatted, linted, and tested.
