# Fallback Falooda

![Falooda](falooda.jpg)

This is a JavaScript library that implements a blockchain node fallback system for [Cosmos](https://cosmos.network/) and [NEAR](https://near.org/).

- Platforms: Node.js, Browsers supporting ES6 or higher, React Native
- Module systems: ECMAScript Modules
- Programming languages: ES6 (JavaScript, TypeScript, etc. which target ES6 or higher)
- Static types: TypeScript definitions bundled

Here's how it works. When you write a program that uses a blockchain node such as `https://api.cosmos.network`, the program will regularly fail to function as expected because the blockchain node is down, rate limited your program, etc. This is why docs from NEAR, etc. state that your program should fall back to other blockchain nodes. Writing such a fallback system is repetitive and time-consuming. This library acts as a reusable fallback system for all your programs that rely on blockchain nodes. Here's the flow:

1. Import this library into your program.
2. Optionally, specify which blockchains you want to use (such as NEAR and Cosmos Hub), the URLs of the blockchain nodes you want to use (such as `https://api.cosmos.network`), and how often you want the fallback system to check the health of the blockchain nodes (such as every 10s). Out of the box, you can use the dataset (or a subset of it) from Cosmos [Chain Registry](https://github.com/cosmos/chain-registry), and every major free NEAR node.
3. The library will periodically check the health of each blockchain's nodes.

   Let's consider an example. You told the library to monitor the blockchains NEAR and Cosmos Hub every 10s. For NEAR, you supplied the URLS `N1`, `N2`, and `N3`. For Cosmos Hub, you specified the URLS `C1` and `C2`. As soon as the library is told to start, it'll assign the first URL passed for each blockchain (`N1` for NEAR, and `C1` for Cosmos Hub) as the "healthy" URL regardless of whether they're actually healthy. It'll then immediately check the health of URLs for NEAR and Cosmos Hub. For NEAR, it'll check `N1`, see that it's down, check `N2`, see that it's up, reassign NEAR's "healthy" URL to `N2`, wait ten seconds, and repeat this process until told to stop. For Cosmos Hub, it'll check `C1`, see that it's down, check `C2`, see that it's down, not reassign the "healthy" URL since there aren't any (`C1` will continue to be used as the "healthy" URL), wait ten seconds, and repeat this process until told to stop.

4. Whenever you need to use a blockchain's node, access its URL via this library's API. You can get the fastest healthy node, a random healthy node, or access the dataset to pick which healthy node you want (or let your users pick)!

Due to the fact that public Cosmos RPC nodes are unreliable, developers relying on public infrastructure tend to use a public load balancer which routes the API request to a random RPC node. The public load balancer usually has a reliability of ~95% but dips to ~80% for noticeable periods of time. Once approximately every two days, reliability drops to an abysmal ~20% for a short period of time. Here are example use cases for this library:

- A wallet would be able to fetch data such as token balances more reliably.
- A dApp would be more decentralized because random nodes get used rather than the same centralized one.
- A node operator could monitor how their response times compare to that of other nodes.

## Installation

Use one of the following methods:

- npm:
  ```shell
  npm i @leapwallet/fallback-falooda
  ```
- Yarn:
  ```shell
  yarn add @leapwallet/fallback-falooda
  ```

## Usage

- Here's the latest version's [documentation](https://leapwallet.github.io/fallback-falooda/). To view a previous version's documentation, find the relevant [release](https://github.com/leapwallet/fallback-falooda/releases), download **docs.zip** from **Assets**, unzip it, and open `docs/index.html` in your browser.
- [Changelog](CHANGELOG.md)
- Never import APIs from nested files.

  For example, this is correct:

  ```typescript
  import { Fallback } from '@leapwallet/fallback-falooda/dist/browser/src';
  ```

  For example, this is incorrect:

  ```typescript
  import Fallback from '@leapwallet/fallback-falooda/dist/browser/src/fallback';
  ```

- On the browser, import APIs from `@leapwallet/fallback-falooda/dist/browser/src`.
- On Node.js, import APIs from `@leapwallet/fallback-falooda/dist/node/src`.
- On React Native, I'm not sure whether to import APIs from `@leapwallet/fallback-falooda/dist/browser/src` or `@leapwallet/fallback-falooda/dist/node/src`. Please send a PR to update this doc if you find out.

## [Contributing](CONTRIBUTING.md)
