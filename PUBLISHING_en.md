# Publishing Guide

This document explains how to publish `markdown-annotation-kit` to npm.

## Prerequisites

### 1. npm Account

Make sure you have:
- Registered an npm account: https://www.npmjs.com/signup
- Logged in locally: `npm login`

### 2. Check Package Name Availability

```bash
npm view markdown-annotation-kit
```

If it returns 404, the package name is available. If it already exists, you will need to change the `name` field in `package.json`.

### 3. Update the Version Number

We use `standard-version` to automate version management. It will:
- Automatically determine the version bump type based on commit messages
- Automatically update `CHANGELOG.md`
- Automatically create a git tag
- Automatically commit the changes

```bash
# Automatic version management (recommended)
pnpm release

# Manually specify version type
pnpm release:minor  # minor version
pnpm release:major  # major version

# Pre-release versions
pnpm release:alpha  # alpha version
pnpm release:beta   # beta version
pnpm release:rc     # rc version
```

**Note**: Before using `standard-version`, ensure your commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` — new feature (minor)
- `fix:` — bug fix (patch)
- `feat!:` or `fix!:` — breaking change (major)

Alternatively, manually edit the `version` field in `package.json`.

### 4. Update CHANGELOG.md

When using `standard-version`, `CHANGELOG.md` is updated automatically. If publishing manually, make sure it has been updated.

## Local Publishing Workflow

### Option 1: Using standard-version (Recommended)

This is the simplest approach — it automatically handles the version number, CHANGELOG, and git tag:

```bash
# 1. Run validation
pnpm validate

# 2. Run release (automatically updates version, CHANGELOG, and creates tag)
pnpm release

# 3. Push code and tags
git push --follow-tags origin main

# 4. Publish to npm
npm publish
```

### Option 2: Manual Publishing

If you need more control, you can do it manually:

#### 1. Run Validation

```bash
pnpm validate
```

This will run:
- Type checking
- Linting
- Format checking
- Tests

### 2. Build

```bash
pnpm build
```

### 3. Inspect the Build Output

```bash
ls -la dist/
```

You should see:
- `index.js` — ES module
- `index.cjs` — CommonJS module
- `index.d.ts` — TypeScript type definitions
- `styles.css` — Style file

### 4. Publish to npm

```bash
npm publish
```

Or using pnpm:

```bash
pnpm publish
```

### 5. Verify the Publication

```bash
npm view markdown-annotation-kit
```

Or visit: https://www.npmjs.com/package/markdown-annotation-kit

## Automatic Publishing with GitHub Actions

### 1. Set Up an NPM Token

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Create a new Access Token (select the "Automation" type)
3. Add a Secret in your GitHub repository settings:
   - Go to repository Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: paste your npm token

### 2. Create a Git Tag

```bash
# Use standard-version to create a tag automatically (recommended)
pnpm release

# Or create one manually
npm version patch  # or minor, major

# Push code and tags
git push origin main
git push --tags
```

### 3. Trigger a Release

When you push a tag in the format `v*` (e.g. `v0.1.0`), GitHub Actions will automatically:
1. Run all tests
2. Build the project
3. Publish to npm
4. Create a GitHub Release

## Pre-publish Checklist

Before publishing, confirm:

- [ ] All tests pass
- [ ] Code has been formatted
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] CHANGELOG.md has been updated
- [ ] Example code in README.md is correct
- [ ] Version number has been updated
- [ ] All changes have been committed
- [ ] Git tag has been created (if using automatic publishing)

## After Publishing

### 1. Verify Installation

```bash
npm install markdown-annotation-kit
```

### 2. Update Documentation

- Ensure the example code in the README runs correctly
- Update any external documentation or tutorials

### 3. Announce

- Share on social media
- Post in relevant communities (e.g. Reddit, Twitter, Dev.to)
- Add to lists such as awesome-react

## Troubleshooting

### Publish fails: package name already exists

Change the `name` field in `package.json` to use a scoped package name:

```json
{
  "name": "@your-username/markdown-annotation-kit"
}
```

### Publish fails: insufficient permissions

Make sure you are logged in to the correct npm account:

```bash
npm whoami
npm logout
npm login
```

### Need to undo a publish

npm does not allow deletion of published packages, but you can publish a new version to fix the issue.

## Version Management Guidelines

- **0.x.x** — Initial development phase; API may be unstable
- **1.x.x** — Stable release, following semantic versioning
- **x.0.0** — Breaking changes (major update)
- **x.x.0** — New features (backwards compatible)
- **x.x.x** — Bug fixes

## Reference Resources

- [npm Publishing Docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning Specification](https://semver.org/)
- [npm Best Practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)