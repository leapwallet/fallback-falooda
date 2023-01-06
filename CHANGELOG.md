# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/leapwallet/fallback-falooda/releases/tag/v0.2.0) - 2023-01-06

### Added

- Cosmos RPC endpoints.
- `type DefaultUrls.RpcNodesAndLcdNodes`
- `getCosmosRpcNodeUrl` in `class Fallback.Falooda`.
- `getCosmosLcdNodeUrl` in `class Fallback.Falooda`.
- `getNearNodeUrl` in `class Fallback.Falooda`.

### Changed

- Renamed `DefaultUrls.Cosmos.sifchain` to `DefaultUrls.Cosmos.sifChain`.
- The `cosmos` field of `type DefaultUrls.Blockchains` now has the type `Record<string, RpcNodesAndLcdNodes>` instead of `Record<string, Nodes>`.

### Removed

- Removed `cosmosRpcNodes` in `class Fallback.Falooda` in favor of `getCosmosRpcNodeUrl`.
- Removed `cosmosLcdNodes` in `class Fallback.Falooda` in favor of `getCosmosLcdNodeUrl`.
- Removed `nearUrl` in `class Fallback.Falooda` in favor of `getNearNodeUrl`.

## [0.1.0](https://github.com/leapwallet/fallback-falooda/releases/tag/v0.1.0) - 2022-12-12

### Added

- First release.
