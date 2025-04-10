# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-04-10

### Added

- Light client with webworkers support for Polkadot chains
- Create 2 providers for either `rpc-api-provider` or `lightclient-api-provider`
- Support for parachain connections (polkadot assetHub, paseo asset hub)
- add a CHANGELOG.md

### Changed

- Improved error handling in light client connection
- Enhanced chain spec validation
- Updated dependencies to latest versions

### Fixed

- Fixed relay chain connection issues
- Improved error messages for chain connection failures

## [1.1.0] - 2025-03-28

### Added

- Chain selection component with dropdown menu
- demo balance component to demonstrate hook usage
- added readme

## [1.0.0] - 2025-03-20

### Added

- Initial project setup with Next.js 15
- Polkadot API integration
- Basic chain configuration
- UI components with Shadcn UI
