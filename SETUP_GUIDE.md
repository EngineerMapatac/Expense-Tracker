# 🚀 Automated Changelog Setup Guide

Complete guide to setting up automated changelog generation for your Budget Tracker project.

## 📋 Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Full Setup with Tools (15 minutes)](#full-setup)
3. [Setup Options Comparison](#comparison)
4. [Usage Examples](#usage)
5. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start (5 minutes) {#quick-start}

**Best for:** Simple projects, no dependencies needed

### Step 1: Add GitHub Action

Create `.github/workflows/release-please.yml`:

```bash
mkdir -p .github/workflows
cp release-please.yml .github/workflows/
```

### Step 2: Enable GitHub Actions Permissions

1. Go to your repo on GitHub
2. Settings → Actions → General
3. Workflow permissions → **Read and write permissions** ✅
4. **Allow GitHub Actions to create pull requests** ✅
5. Save

### Step 3: Start Using Conventional Commits

```bash
# Stage your changes
git add .

# Commit with conventional format
git commit -m "feat: add dark mode toggle"

# Push
git push
```

### Step 4: Watch the Magic! ✨

1. GitHub Actions runs automatically
2. Pull request created with updated CHANGELOG
3. Merge the PR
4. Release created automatically!

**Done! That's it for basic automation.**

---

## 🛠️ Full Setup (15 minutes) {#full-setup}

**Best for:** Professional projects, enforced standards, team collaboration

This adds interactive commit helpers and validation.

### Step 1: Install Node.js Tools

```bash
# Install dependencies
npm install

# Or manually:
npm install --save-dev \
  @commitlint/cli \
  @commitlint/config-conventional \
  commitizen \
  cz-conventional-changelog \
  husky
```

### Step 2: Configure Git Template (Optional)

```bash
# Set commit message template
git config commit.template .gitmessage

# Now every 'git commit' shows the template
```

### Step 3: Make Helper Script Executable

```bash
# Make the commit helper script executable
chmod +x commit.sh

# Add to your PATH (optional)
echo 'export PATH="$PATH:$(pwd)"' >> ~/.bashrc
source ~/.bashrc
```

### Step 4: Use Interactive Tools

**Option A: Use Helper Script**
```bash
./commit.sh
# Interactive prompts guide you!
```

**Option B: Use Commitizen**
```bash
git add .
npm run commit  # or: git cz
# Interactive commit creator
```

**Option C: Use VS Code Extension**
1. Install "Conventional Commits" extension
2. Open Source Control
3. Click the extension icon
4. Fill in the form
5. Commit!

---

## 📊 Comparison Table {#comparison}

| Feature | Quick Start | Full Setup |
|---------|-------------|------------|
| **Auto-generate CHANGELOG** | ✅ | ✅ |
| **Auto version bumping** | ✅ | ✅ |
| **GitHub releases** | ✅ | ✅ |
| **Commit validation** | ❌ | ✅ |
| **Interactive helper** | ❌ | ✅ |
| **Enforce standards** | ❌ | ✅ |
| **Dependencies needed** | None | Node.js |
| **Setup time** | 5 min | 15 min |
| **Best for** | Solo dev | Teams |

---

## 💡 Usage Examples {#usage}

### Example 1: Adding a Feature

```bash
# Quick Start way
git add .
git commit -m "feat: add expense export to CSV"
git push

# Full Setup way (interactive)
git add .
./commit.sh
# Select: 1 (feat)
# Scope: export
# Subject: add CSV export functionality
# Body: Users can now download expenses as CSV
```

**Result in CHANGELOG:**
```markdown
### ✨ Features
- **export**: add CSV export functionality
```

### Example 2: Fixing a Bug

```bash
# Quick
git commit -m "fix(validation): prevent negative amounts"

# Interactive
./commit.sh
# Select: 2 (fix)
# Scope: validation
# Subject: prevent negative amounts
```

**Result:**
```markdown
### 🐛 Bug Fixes
- **validation**: prevent negative amounts
```

### Example 3: Breaking Change

```bash
git commit -m "feat!: change storage format to support categories" \
  -m "BREAKING CHANGE: Users must re-import their data"
```

**Result:**
- ⬆️ Version bump: 1.1.0 → 2.0.0 (MAJOR)
- 🚨 Highlighted in CHANGELOG
- 📢 Prominent in release notes

---

## 🎯 Commit Type Guide

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature for users | `feat: add dark mode` |
| `fix` | Bug fix users will notice | `fix: correct total calculation` |
| `docs` | Documentation only | `docs: update README` |
| `style` | Code formatting, whitespace | `style: fix indentation` |
| `refactor` | Code restructure, no behavior change | `refactor: extract validation function` |
| `perf` | Performance improvement | `perf: optimize list rendering` |
| `test` | Adding/updating tests | `test: add expense validation tests` |
| `chore` | Maintenance, no user impact | `chore: update dependencies` |

---

## 🔧 Troubleshooting {#troubleshooting}

### Problem: GitHub Action Not Running

**Check:**
1. Workflow file in `.github/workflows/` ✅
2. Branch name is `main` (or update workflow) ✅
3. Actions enabled in repo settings ✅
4. Commits pushed to `main` branch ✅

**View logs:**
- GitHub → Actions tab → Click workflow run

### Problem: PR Not Created

**Likely causes:**
1. No conventional commits since last release
2. Permissions not set correctly
3. Already a release PR open

**Solution:**
```bash
# Check your commits
git log --oneline

# Should see: "feat: ...", "fix: ...", etc.
```

### Problem: Commitlint Rejecting Commits

**Error example:**
```
⧗   input: random commit message
✖   subject may not be empty [subject-empty]
```

**Fix:**
Use proper format:
```bash
# ❌ Wrong
git commit -m "updated stuff"

# ✅ Right
git commit -m "feat: add new feature"
```

### Problem: Helper Script Not Working

```bash
# Make it executable
chmod +x commit.sh

# Run with bash explicitly
bash commit.sh
```

---

## 📚 Workflow Diagram

```
┌─────────────────┐
│  Make Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  git add .      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Conventional Commit        │
│  feat: add feature          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│   git push      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  GitHub Action Runs     │
│  - Analyzes commits     │
│  - Updates CHANGELOG    │
│  - Bumps version        │
│  - Creates PR           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│   Merge PR      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Release Created!       │
│  - Git tag              │
│  - GitHub release       │
│  - Release notes        │
└─────────────────────────┘
```

---

## 🎓 Best Practices

1. **Be Descriptive**: `feat: add button` → `feat: add CSV export button to dashboard`
2. **Use Scope**: `fix: bug` → `fix(validation): prevent negative values`
3. **One Logical Change**: Don't mix features and fixes
4. **Write for Humans**: Others read your CHANGELOG
5. **Use Breaking Changes Sparingly**: Only when truly breaking

---

## 🌟 Pro Tips

### Amend Last Commit
```bash
# Oops, wrong commit message
git commit --amend -m "feat: correct message"
```

### View Future CHANGELOG
```bash
# See what will be in next release
npx conventional-changelog -p angular -u
```

### Custom Release Notes
Add to commit body:
```bash
git commit -m "feat: add export" -m "This allows users to backup their data. Supports CSV and JSON formats."
```

---

## 📖 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Release Please](https://github.com/google-github-actions/release-please-action)
- [Commitlint](https://commitlint.js.org/)
- [Commitizen](https://github.com/commitizen/cz-cli)
- [Semantic Versioning](https://semver.org/)

---

## ✅ Quick Checklist

- [ ] `.github/workflows/release-please.yml` added
- [ ] GitHub Actions permissions enabled
- [ ] First conventional commit pushed
- [ ] Workflow runs successfully
- [ ] (Optional) Commitizen installed
- [ ] (Optional) Helper script executable
- [ ] Team trained on commit format

---

**Need help?** Open an issue or check the logs in GitHub Actions tab!

Happy automating! 🎉
