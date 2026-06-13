# Version Release Guide

This document explains how to use `standard-version` for version releases.

## Quick Start

### Standard Release Workflow

```bash
# 1. Ensure all changes have been committed
git status

# 2. Run release (version type is determined automatically)
pnpm release

# 3. Push code and tags
git push --follow-tags origin main
```

## Release Command Reference

### Automatic Version Management (Recommended)

```bash
pnpm release
```

`standard-version` will automatically determine the version bump type based on your commit messages:
- `feat:` → minor (0.1.0 → 0.2.0)
- `fix:` → patch (0.1.0 → 0.1.1)
- `feat!:` or `fix!:` → major (0.1.0 → 1.0.0)

### Manually Specify Version Type

```bash
# Minor version (0.1.0 → 0.2.0)
pnpm release:minor

# Major version (0.1.0 → 1.0.0)
pnpm release:major
```

### Pre-release Versions

```bash
# Alpha version (0.1.0 → 0.1.1-alpha.0)
pnpm release:alpha

# Beta version (0.1.0 → 0.1.1-beta.0)
pnpm release:beta

# RC version (0.1.0 → 0.1.1-rc.0)
pnpm release:rc
```

## Workflow

### 1. Development Phase

Ensure your commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
git commit -m "feat: add support for custom themes"
git commit -m "fix: resolve duplicate text annotation bug"
git commit -m "docs: update API documentation"
```

### 2. Pre-release Checks

```bash
# Run all checks
pnpm validate

# Ensure all changes have been committed
git status
```

### 3. Run Release

```bash
pnpm release
```

This will automatically:
- ✅ Determine the version number from commit messages
- ✅ Update the version number in `package.json`
- ✅ Update `CHANGELOG.md`
- ✅ Create a git tag
- ✅ Commit all changes

### 4. Push the Release

```bash
# Push code and tags
git push --follow-tags origin main
```

If GitHub Actions automatic publishing is configured, pushing the tag will automatically trigger the release pipeline.

## Commit Message Specification

### Version Type Mapping

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | minor | `feat: add new feature` |
| `fix:` | patch | `fix: resolve bug` |
| `feat!:` | major | `feat!: breaking change` |
| `fix!:` | major | `fix!: breaking fix` |

### Examples

```bash
# These commits will trigger a minor version bump
git commit -m "feat: add dark mode support"
git commit -m "feat: add custom annotation colors"

# These commits will trigger a patch version bump
git commit -m "fix: resolve duplicate text bug"
git commit -m "fix: improve context matching"

# These commits will trigger a major version bump
git commit -m "feat!: change API structure"
git commit -m "fix!: remove deprecated API"
```

## Configuration File

The `.versionrc.json` configuration file defines:
- Mapping of commit types to CHANGELOG sections
- Release commit message format
- Scripts to run after release

## FAQ

### Q: How do I skip a version type?

```bash
# Skip patch and release minor directly
pnpm release:minor

# Skip minor and release major directly
pnpm release:major
```

### Q: How do I undo a release?

```bash
# Delete the local tag
git tag -d v0.1.0

# Delete the remote tag (if already pushed)
git push origin :refs/tags/v0.1.0

# Reset to the commit before the release
git reset --hard HEAD~1
```

### Q: How do I publish a pre-release version?

```bash
# Publish an alpha version
pnpm release:alpha

# Promote from alpha to a stable release
pnpm release
```

### Q: Why isn't CHANGELOG updating automatically?

Make sure:
1. Commit messages follow the Conventional Commits specification
2. Commit messages are in English (standard-version parses English by default)
3. Check that the `.versionrc.json` configuration is correct

## Integration with GitHub Actions

If GitHub Actions automatic publishing is configured, pushing a tag will automatically:
1. Run tests
2. Build the project
3. Publish to npm
4. Create a GitHub Release

## Reference Resources

- [standard-version Documentation](https://github.com/conventional-changelog/standard-version)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)