# GitFlow Workflow Guide

## Overview

This document outlines the GitFlow workflow for the Agricultural Super App project, adapted for our team's personal branch structure.

## Branch Structure

- **main**: Production-ready code
- **develop**: Integration branch (to be created)
- **Personal branches**: Godwin, Silver, felix, lynn
- **release/***: Release preparation (when needed)
- **hotfix/***: Critical production fixes (when needed)

## Workflow Process

### 1. Daily Development

Each team member works on their personal branch:

```bash
# Switch to your personal branch
git checkout [your-name]  # e.g., git checkout Godwin

# Pull latest changes
git pull origin [your-name]

# Make your changes and commit
git add .
git commit -m "feat(component): add new feature

- Detailed description of what was added
- Any important notes about the implementation"
```

### 2. Creating Pull Requests

When you're ready to integrate your work:

1. **Push your branch**:
   ```bash
   git push origin [your-name]
   ```

2. **Create PR**: `[your-name]` → `develop`

3. **PR Description should include**:
   - Summary of features/fixes completed
   - List of files changed
   - Any testing done
   - Screenshots (if UI changes)

### 3. Code Review Process

- At least one team member must review the PR
- All CI/CD checks must pass
- Address any feedback before merging

### 4. After Merge

- Your changes are automatically deployed to staging
- Your personal branch remains for continued development
- Pull latest develop changes when starting new work

## Commit Message Format

Use this format for clear commit history:

```
<type>(<scope>): <subject>

<body>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat(auth): implement user login functionality"
git commit -m "fix(navbar): resolve mobile responsive issues"
git commit -m "docs(readme): update setup instructions"
```

## Branch Protection Rules (For Repo Owner)

The following protection rules should be applied:

### Main Branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators

### Develop Branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging

## Team Member Responsibilities

### Before Starting Work
1. Pull latest changes from your branch
2. Check if develop has updates you need

### When Completing Features
1. Test your changes locally
2. Write clear commit messages
3. Create descriptive PR with summary of work
4. Respond to code review feedback promptly

### During Code Review
1. Review teammates' PRs when requested
2. Provide constructive feedback
3. Test changes locally if needed
4. Approve when satisfied with the code quality

## Common Commands

```bash
# Check current branch
git branch --show-current

# Switch to your branch
git checkout [your-name]

# Pull latest changes
git pull origin [your-name]

# Check status
git status

# Add and commit changes
git add .
git commit -m "your commit message"

# Push changes
git push origin [your-name]

# View commit history
git log --oneline

# Check what files changed
git diff --name-only
```

## Troubleshooting

### Merge Conflicts
If you encounter merge conflicts:
1. Pull latest develop changes
2. Resolve conflicts in your editor
3. Test that everything still works
4. Commit the resolution
5. Push and update your PR

### Sync with Develop
To get latest changes from develop:
```bash
git checkout [your-name]
git pull origin develop
# Resolve any conflicts
git push origin [your-name]
```