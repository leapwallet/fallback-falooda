# Contributing

## Installation

1. Install [Node.js 16](https://nodejs.org/en/download/).
2. Clone the repo using one of the following methods:
   - SSH: `git clone git@github.com:leapwallet/fallback-falooda.git`
   - HTTPS: `git clone https://github.com/leapwallet/fallback-falooda.git`
3. `cd fallback-falooda`
4. Install the package manager: `corepack enable`
5. Install the dependencies: `yarn`

## Library

```
yarn build
```

Builds the library to the `dist` directory.

## Docs

Generate. docs to `docs/`:

- Development (watches for changes): `yarn doc:watch`
- Production: `yarn doc:build`

## Testing

### Running

```
yarn test
```

### Writing

We'll use an example to explain how to write tests.

Let's say we have a file `src/myDir/Calculator.ts` with the following contents:

```ts
export default class Calculator {
  add(num1: number, num2: number): number {
    return num1 + num2;
  }
}
```

Then, the tests must be saved to a file `tests/myDir/Calculator.test.ts` with the following contents:

```ts
import Calculator from '../Calculator';

describe('Calculator', () => {
  describe('add', () => {
    it('adds <1> and <2> to return <3>', () => expect(new Calculator().add(1, 2)).toBe(3));
  });
});
```

## Linting

Commands will exit with an error code if unresolved issues remain.

- Lint using every tool in one go (slower):
  - Find all issues: `yarn lint:check`
  - Fix all issues: `yarn lint:fix`
- Lint using specific tools (faster):
  - Find issues using Prettier: `yarn lint:prettier:check`
  - Fix issues using Prettier: `yarn lint:prettier:fix`
  - Find issues using ESLint: `yarn lint:eslint:check`
  - Fix issues using ESLint: `yarn lint:eslint:fix`
  - Find issues using tsc: `yarn lint:tsc`
  - Find issues using TypeDoc: `yarn lint:typedoc`

## Style Guide

- The convention in the TypeScript ecosystem to be to use _kebab-case_ for anything that isn't a TypeScript file except
  for `.d.ts` files, and _PascalCase_ and _camelCase_ for `.ts` files depending on the type of `export`s that they have
  but this is difficult to follow, and frankly quite stupid considering how many random baseless rules there are.
  Therefore, just name all files and directories using _kebab-case_.
- Prefer `type`s over `interface`s in TypeScript as `interface`s are verbose, may accidentally be extended if
  another `interface` has the same name, and are meant to either be implemented in `class`es or implicitly extended by
  users of a library .
- Use immutability by default by preferring `const` over `let`, and marking fields as `readonly` whenever possible.
- Treat acronyms and abbreviations as words (e.g., `DefaultApi` instead of `DefaultAPI`, `htmlDoc` instead of `HTMLDoc`
  , `Db` instead of `DB`). JavaScript keeps acronyms capitalized (e.g., `innerHTML`), but it's impractical to follow (
  e.g., `DbId` is better than `DBID`).

## Packages

Never use dynamic version ranges for dependencies because packages often break in newer versions. For example,
when `yarn add`ing a dependency, remove the caret from the version number it saved to `package.json`.

## Releasing a New Version

1. Create a PR with your changes.
2. Bump the version in [`package.json`](package.json).
3. Add a [Changelog](CHANGELOG.md) entry.
4. Merge your PR into the `main` branch. The CI/CD pipeline will take care of the rest.
