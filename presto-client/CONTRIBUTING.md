# presto-client

This library was generated with [Nx](https://nx.dev).

## Building

To build the library using [SWC](https://swc.rs), run the following command:

```bash
npm run build presto-client
```

## Linting

To lint the library using [ESLint](https://eslint.org), run the following command:

```bash
npm run lint presto-client
```

## Publishing

### Locally

To publish a new version to a private local registry, follow these steps:

#### Steps

1. Start by cleaning your workspace using the following command:

   ```bash
   git stash
   ```

2. Start a private local registry using [Verdaccio](https://verdaccio.org):

   ```bash
   npm run local-registry presto-js-client
   ```

3. In another terminal, publish the new version by running the following command:

   ```bash
   npm run publish:local presto-client
   ```

   If you're publishing a Pre-release version, run instead:

   ```bash
   npm run publish:local presto-client -- --releaseAs=premajor|preminor|prepatch --preid=beta
   ```

   Check the [semver options](https://github.com/jscutlery/semver#available-options) for all available options.

4. If the output of the previous command is successful, check that:

- A new local git tag was generated.
- `presto-client/CHANGELOG.md` file was updated.
- `presto-client/package.json` file was updated.

5. Visit http://localhost:4873 and ensure that `@prestodb/presto-js-client` was pushed successfully to the private local registry, including the git tag, `CHANGELOG.md`, and `package.json` files reviewed above.

6. Now you can run `npm i @prestodb/presto-js-client` in any other project locally to test the released version before releasing it to NPM.

### NPM

To publish a new version to NPM, follow these steps:

#### Pre-requisites

- Have a valid `NPM_TOKEN` with write permissions to [prestodb NPM organization](https://www.npmjs.com/settings/prestodb/packages) and log-in to NPM using that token by running `npm adduser`.
- Install [GitHub CLI](https://cli.github.com/) on your machine.

#### Steps

1. Start by cleaning your workspace using the following command:

   ```bash
   git stash
   ```

2. Create a new branch using the version generated in [Publishing Locally](#Locally) section above, like so: `release/1.x.y` (This is important since is not allowed to directly push to the `main` branch)

3. Publish a new version by running the following command:

   ```bash
   npm run publish presto-client
   ```

   If you're publishing a Pre-release version, run instead:

   ```bash
   npm run publish presto-client -- --releaseAs=premajor|preminor|prepatch --preid=beta
   ```

   Check the [semver options](https://github.com/jscutlery/semver#available-options) for all available options.

4. As part of the previous command, a draft GitHub release is also created. Go to [GitHub Releases](https://github.com/prestodb/presto-js-client/releases), review and edit it if necessary, and then click "Publish release" to make it public.

   \*If you published the package as a Pre-release version, please also mark the GitHub release as a "Pre-release."
