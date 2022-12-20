# Building

### yarn install

Installs all the dependencies you need to make the other commands run, and to build your project.

### yarn clean

Deletes the build artefacts under `./lib` and `./dist`

### yarn format

Format the code to make it consistent with the formatting rules.

### yarn lint

Lints the code to make it consistent with the linting rules.

### yarn compile

Compiles the Typescript `./src` files into their corresponding Javascript files in `./lib`.

### yarn build

Compiles the Typescript `./src` files into a single Javascript releasable file in `./dist`.

### yarn test

Tests the code.

### yarn package

Does all of the above, building the project only once it's been formatted, linted, and tested.

# Releasing

### Build the release artefacts locally.

```bash
yarn install
yarn package
```

### Commit your changes.

```bash
git add .
git commit -m "[NOID] Change description"
```

### Create a PR against dev and add a regular contributor as Assigned.

[https://github.com/neo4j/github-action-traceability/compare](https://github.com/neo4j/github-action-traceability/compare)

### Once the PR is merged, tag it with a new semver. Also, update the existing major semver tag.

```bash
git tag -a v1.0.12
git tag -fa v1
git push origin --tags --force
```

### Create a release on GitHub with a Changelog.

[https://github.com/neo4j/github-action-traceability/releases](https://github.com/neo4j/github-action-traceability/releases)

# Contributor License Agreement

In order to contribute we would like to request that you first sign Neo4j's [Contributor License Agreement](https://neo4j.com/developer/cla/) as we will not
be able to accept your contributions without it.
