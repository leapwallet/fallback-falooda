# Fallback Falooda

![Falooda](falooda.jpg)
_Now you can get diabetes while reading documentation too!_

This is a JavaScript library that implements a blockchain node fallback system. It currently supports blockchain nodes from the [NEAR](https://near.org/) and [Cosmos](https://cosmos.network/) ecosystem.

- Platforms: Node.js, Browsers supporting ES6 or higher
- Module systems: ECMAScript Modules
- Programming languages: ES6 (JavaScript, TypeScript, etc. which target ES6 or higher)
- Static types: TypeScript definitions bundled

Here's how it works. When you write a program that uses a blockchain node such as `https://rpc.mainnet.near.org`, the program will regularly fail to function as expected because the blockchain node is down, rate limited your program, etc. This is why docs from NEAR, etc. state that your program should fall back to other blockchain nodes. Writing such a fallback system is repetitive and time-consuming. This library acts as a reusable fallback system for all your programs that rely on blockchain nodes. Here's the flow:

1. Import this library into your program.
2. Optionally, specify which blockchains you want to use (such as NEAR and Cosmos Hub), the URLs of the blockchain nodes you want to use (such as `https://rpc.mainnet.near.org`), and how often you want the fallback system to check the health of the blockchain nodes (such as every 10s).
3. The library will periodically check the health of each blockchain's nodes.

   Let's consider an example. You told the library to monitor the blockchains NEAR and Cosmos Hub every 10s. For NEAR, you supplied the URLS `N1`, `N2`, and `N3`. For Cosmos Hub, you specified the URLS `C1` and `C2`. As soon as the library is told to start, it'll assign the first URL passed for each blockchain (`N1` for NEAR, and `C1` for Cosmos Hub) as the "healthy" URL regardless of whether they're actually healthy. It'll then immediately check the health of URLs for NEAR and Cosmos Hub. For NEAR, it'll check `N1`, see that it's down, check `N2`, see that it's up, reassign NEAR's "healthy" URL to `N2`, wait ten seconds, and repeat this process until told to stop. For Cosmos Hub, it'll check `C1`, see that it's down, check `C2`, see that it's down, not reassign the "healthy" URL since there aren't any (`C1` will continue to be used as the "healthy" URL), wait ten seconds, and repeat this process until told to stop.

4. Whenever you need to use a blockchain's node, access its URL via the variable exposed by this library.

## Installation

1. Since this package is privately published, you'll need to authenticate to the registry. Create a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the `repo` and `read:packages` scopes.
2. Create a file named `.npmrc` (this must not be committed to your VCS but these steps must be followed by anyone using your project so that they can download this dependency) with the contents `//npm.pkg.github.com/:_authToken=<TOKEN>`, where `<TOKEN>` is your personal access token.
3. Log in to the registry using the token you just generated as the password: `yarn login --registry https://npm.pkg.github.com --scope @leapwallet`.
4. Now, you can install the package as you normally would have: `yarn add @leapwallet/fallback-falooda`

## Usage

- Here's the latest version's [documentation](https://leapwallet.github.io/fallback-falooda/). To view a previous version's documentation, find the relevant [release](https://github.com/leapwallet/fallback-falooda/releases), download **docs.zip** from **Assets**, unzip it, and open `docs/index.html` in your browser.
- [Changelog](CHANGELOG.md)
- Never import APIs from nested files.

  For example, this is correct:

  ```typescript
  import { FallbackFalooda } from '@leapwallet/fallback-falooda';
  ```

  For example, this is incorrect:

  ```typescript
  import { FallbackFalooda } from '@leapwallet/fallback-falooda/dist/fallback-falooda';
  ```

## [Contributing](CONTRIBUTING.md)
