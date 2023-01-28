# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0](https://github.com/leapwallet/fallback-falooda/releases/tag/v0.4.0) - 2023-01-27

### Changed

- This package is now MIT licensed rather than unlicensed.
- This is a rewrite of the library: every API has changed.

## [0.3.0](https://github.com/leapwallet/fallback-falooda/releases/tag/v0.3.0) - 2023-01-07

### Fixed

- `DefaultUrls` is now named `Urls`.

## [0.2.0](https://github.com/leapwallet/fallback-falooda/releases/tag/v0.2.0) - 2023-01-07

### Added

- Cosmos RPC endpoints.
- `type DefaultUrls.RpcNodesAndLcdNodes`
- `getCosmosRpcNodeUrl` in `class Fallback.Falooda`.
- `getCosmosLcdNodeUrl` in `class Fallback.Falooda`.
- `getNearNodeUrl` in `class Fallback.Falooda`.
- `Urls.defaultUrls`

### Changed

- Renamed `DefaultUrls` to `Urls`.
- Renamed `Urls.Cosmos.sifchain` to `Urls.Cosmos.sifChain`.
- The `cosmos` field of `type DefaultUrls.Blockchains` now has the type `Record<string, RpcNodesAndLcdNodes>` instead of `Record<string, Nodes>`.
- `class ConfigError` now serves a different purpose.

### Removed

- Removed `cosmosRpcNodes` in `class Fallback.Falooda` in favor of `getCosmosRpcNodeUrl`.
- Removed `cosmosLcdNodes` in `class Fallback.Falooda` in favor of `getCosmosLcdNodeUrl`.
- Removed `nearUrl` in `class Fallback.Falooda` in favor of `getNearNodeUrl`.
- Removed `Urls.urls` in favor of `Urls.defaultUrls`.

## [0.1.0](https://github.com/leapwallet/fallback-falooda/releases/tag/v0.1.0) - 2022-12-12

### Added

- First release.
