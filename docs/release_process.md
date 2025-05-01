# AEGIS Release Process

This document outlines the process for creating and deploying new releases of the AEGIS platform.

## Versioning

AEGIS follows semantic versioning (SemVer) in the format MAJOR.MINOR.PATCH:

- **MAJOR** version for incompatible API changes
- **MINOR** version for new features in a backward-compatible manner
- **PATCH** version for backward-compatible bug fixes

## Release Types

There are three types of releases:

1. **Patch Release** - Bug fixes and small improvements
2. **Minor Release** - New features and non-breaking changes
3. **Major Release** - Breaking changes and significant new features

## Release Process

### Pre-release Checklist

- [ ] All tests are passing (unit, integration, e2e)
- [ ] Security scan shows no critical issues
- [ ] Documentation is updated
- [ ] All necessary pull requests are merged
- [ ] Performance testing shows no regressions

### Creating a Release

1. **Prepare Release Branch**

   ```bash
   # Create a release branch from develop
   git checkout develop
   git pull
   git checkout -b release/vX.Y.Z
   ```
