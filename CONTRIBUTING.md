# Becoming a Contributor

You need to commit the `lib/index.js` artifact because that is what the GitHub Action will end up using. There is
currently no CI for this project, please manually ensure everything works before opening a PR.

## yarn install

Installs all the dependencies you need to make the other commands run, and to build your project.

## yarn clean

Deletes the build artefacts under `./lib` and `./dist`

## yarn format

Format the code to make it consistent with the formatting rules.

## yarn lint

Lints the code to make it consistent with the linting rules.

## yarn compile

Compiles the Typescript `./src` files into their corresponding Javascript files in `./lib`.

## yarn build

Compiles the Typescript `./src` files into a single Javascript releasable file in `./dist`.

## yarn test

Tests the code.

## yarn package

Does all of the above, building the project only once it's been formatted, linted, and tested.

# Releasing New Versions

// daniel tag with v1.x.y unless breaking change
// daniel bump tag v1 to point to your new release
// create release in GitHub for v1.x.y
// congrats you are done
