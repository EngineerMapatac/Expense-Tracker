# 🤖 Automated Changelog Guide

## What is This?

This project uses **Conventional Commits** to automatically generate changelogs, version numbers, and GitHub releases.

## 📝 Commit Message Format

Every commit should follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
# Feature
git commit -m "feat: add dark mode toggle"
git commit -m "feat(ui): add toast notifications with icons"

# Bug Fix
git commit -m "fix: resolve localStorage quota error"
git commit -m "fix(validation): prevent negative budget amounts"

# Documentation
git commit -m "docs: update README with keyboard shortcuts"

# Style (formatting, no code change)
git commit -m "style: improve button hover states"

# Refactor (no feature/bug change)
git commit -m "refactor: extract validation logic to separate class"

# Performance
git commit -m "perf: optimize expense list rendering"

# Test
git commit -m "test: add unit tests for StorageService"

# Chore (maintenance)
git commit -m "chore: update dependencies"
```

## 🏷️ Commit Types

| Type | Description | Changelog Section | Version Bump |
|------|-------------|-------------------|--------------|
| `feat` | New feature | ✨ Features | MINOR (0.X.0) |
| `fix` | Bug fix | 🐛 Bug Fixes | PATCH (0.0.X) |
| `docs` | Documentation | 📚 Documentation | PATCH |
| `style` | Formatting/styling | 🎨 Styling | PATCH |
| `refactor` | Code refactoring | ♻️ Refactoring | PATCH |
| `perf` | Performance improvement | ⚡ Performance | PATCH |
| `test` | Adding tests | ✅ Tests | PATCH |
| `chore` | Maintenance | (hidden) | PATCH |

## 🚨 Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the commit body or use `!`:

```bash
git commit -m "feat!: change storage format to support multi-user" -m "BREAKING CHANGE: Old data format will not work. Users must export and re-import data."
```

This will:
- ✅ Bump MAJOR version (X.0.0)
- ✅ Add prominent section in CHANGELOG
- ✅ Alert users in release notes

## 🎯 Quick Reference

### Adding a New Feature
```bash
git add .
git commit -m "feat: add expense export to CSV"
git push
```

### Fixing a Bug
```bash
git add .
git commit -m "fix: correct date sorting in expense list"
git push
```

### Updating Documentation
```bash
git add .
git commit -m "docs: add troubleshooting section to README"
git push
```

## 🤖 How Automation Works

1. **You commit** with conventional format
2. **GitHub Actions** runs on push to `main`
3. **Release Please** analyzes commits
4. **Pull Request** created with:
   - Updated CHANGELOG.md
   - Bumped version number
   - Release notes
5. **You merge** the PR
6. **GitHub Release** automatically created!

## 📦 Version Bumping Logic

```
feat:     1.0.0 → 1.1.0 (minor)
fix:      1.1.0 → 1.1.1 (patch)
feat!:    1.1.1 → 2.0.0 (major - breaking)
```

## 🛠️ Setup Instructions

### 1. Create `.github/workflows` folder
```bash
mkdir -p .github/workflows
```

### 2. Add workflow file
Copy `release-please.yml` to `.github/workflows/`

### 3. Enable GitHub Actions
- Go to repo Settings → Actions → General
- Enable "Read and write permissions"
- Enable "Allow GitHub Actions to create pull requests"

### 4. Start using conventional commits!
```bash
git commit -m "feat: your first automated feature"
git push
```

## 💡 Pro Tips

### Use Commitizen (Interactive Helper)
```bash
# Install globally
npm install -g commitizen cz-conventional-changelog

# Initialize in your project
commitizen init cz-conventional-changelog --save-dev --save-exact

# Use it!
git add .
git cz  # Interactive commit helper!
```

### Use Commitlint (Enforce Format)
```bash
# Install
npm install --save-dev @commitlint/{cli,config-conventional}

# Configure
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Add to package.json
{
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### Use VS Code Extension
Install: **Conventional Commits** by vivaxy

## 📊 Example Output

After commits:
```
feat: add dark mode toggle
fix: resolve mobile menu bug
docs: update installation guide
```

Auto-generated CHANGELOG.md:
```markdown
## [1.2.0] - 2026-02-12

### ✨ Features
- add dark mode toggle

### 🐛 Bug Fixes
- resolve mobile menu bug

### 📚 Documentation
- update installation guide
```

## 🎓 Learning Resources

- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Release Please Docs](https://github.com/google-github-actions/release-please-action)
- [Semantic Versioning](https://semver.org/)

## ❓ Troubleshooting

**Q: Workflow not running?**
- Check GitHub Actions is enabled
- Verify workflow file is in `.github/workflows/`
- Check branch name matches (default: `main`)

**Q: PR not created?**
- Ensure commits use conventional format
- Check permissions in workflow file
- Look at Actions tab for error logs

**Q: Want to skip release?**
- Use `chore:` type commits
- They update code but don't trigger releases

---

**Happy Automating! 🚀**
