# Becoming a Contributor

#### yarn install

Installs all the dependencies you need to make the other commands run, and to build your project.

#### yarn clean

Deletes the build artefacts under `./lib` and `./dist`

#### yarn format

Format the code to make it consistent with the formatting rules.

#### yarn lint

Lints the code to make it consistent with the linting rules.

#### yarn compile

Compiles the Typescript `./src` files into their corresponding Javascript files in `./lib`.

#### yarn build

Compiles the Typescript `./src` files into a single Javascript releasable file in `./dist`.

#### yarn test

Tests the code.

#### yarn package

Does all of the above, building the project only once it's been formatted, linted, and tested.

# Releasing New Versions

1. Build the release artefacts locally
```bash
yarn install
yarn package
```

2. Commit your changes
```bash
git add .
git commit -m "[NOID] What change is about..."
```

3. Create a PR against dev and get a maintainer as Assigned
[https://github.com/AzuObs/github-action-traceability/compare](https://github.com/AzuObs/github-action-traceability/compare)

4. Once the PR is merged, tag it with a new semver 
```bash
git tag -a v1.0.34
```

5. Also, update the existing major semver tag
```
git tag -fa v1
```

6. That's it