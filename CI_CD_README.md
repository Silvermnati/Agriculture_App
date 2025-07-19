# CI/CD and GitFlow Setup Guide

## Overview
This repository uses a customized GitFlow workflow with automated CI/CD pipelines designed for team collaboration using personal branches.

## 🌟 Quick Start for Team Members

### Your Daily Workflow
1. **Work on your personal branch**: `Godwin`, `Silver`, `felix`, or `lynn`
2. **Create PRs to `develop`** when features are ready
3. **Code gets automatically tested** and deployed to staging
4. **Production deployments** happen from `main` branch

## 🔄 Branch Structure

```
main (production)
├── develop (staging)
│   ├── Godwin (personal)
│   ├── Silver (personal)  
│   ├── felix (personal)
│   └── lynn (personal)
└── hotfix/* (emergency fixes)
```

## 🚀 GitHub Actions Workflows

### 1. Code Quality Checks (`code-quality.yml`)
**Triggers**: Pull requests to `develop` or `main`
- ✅ Python linting with flake8
- ✅ Python tests with pytest
- ✅ JavaScript/React tests with Jest
- ✅ Blocks merge if checks fail

### 2. Staging Deployment (`staging-deploy.yml`)
**Triggers**: Push to `develop` branch
- 🔨 Builds Python Flask backend
- 🔨 Builds React frontend
- 🧪 Runs full test suite
- 🚀 Deploys to staging environment
- 📢 Notifies team of deployment

### 3. Production Deployment (`production-deploy.yml`)
**Triggers**: Push to `main` branch
- 🔨 Builds applications for production
- 🧪 Runs comprehensive tests with coverage
- 🚀 Deploys to production environment
- 📢 Notifies team of production deployment

## 📝 Commit Message Format

Use the template in `.gitmessage`:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```bash
feat(auth): implement user login system
fix(navbar): resolve mobile responsive issues
docs(readme): update installation instructions
```

## 🔧 Setup Instructions for Repo Owner

### 1. Create Develop Branch
```bash
git checkout main
git pull origin main
git checkout -b develop
git push origin develop
```

### 2. Configure Branch Protection Rules

#### Main Branch Protection:
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators

#### Develop Branch Protection:
- ✅ Require pull request reviews (1 approval)  
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators

### 3. Enable GitHub Actions
- Go to **Settings** → **Actions** → **General**
- Select "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

## 🧪 Testing the Setup

### Test Code Quality Workflow
1. Create a test PR from personal branch to `develop`
2. Verify that code quality checks run automatically
3. Confirm that PR cannot be merged if checks fail

### Test Deployment Workflows
1. Merge a PR to `develop` → Should trigger staging deployment
2. Merge `develop` to `main` → Should trigger production deployment

## 📋 Pull Request Template

When creating PRs, use the template in `.github/PULL_REQUEST_TEMPLATE/`:
- ✅ Description of changes
- ✅ Features/changes completed checklist
- ✅ Files changed list
- ✅ Type of change selection
- ✅ Testing verification
- ✅ Quality checklist

## 🔍 Monitoring and Notifications

### Successful Deployments
- ✅ GitHub status checks show green
- ✅ Console logs show deployment success
- ✅ Team gets notified via GitHub notifications

### Failed Deployments
- ❌ GitHub status checks show red
- ❌ PR merge is blocked
- ❌ Detailed error logs available in Actions tab

## 🆘 Troubleshooting

### Common Issues

**1. Tests Failing**
```bash
# Run tests locally first
python -m pytest tests/ -v
npm test
```

**2. Merge Conflicts**
```bash
git checkout [your-branch]
git pull origin develop
# Resolve conflicts
git push origin [your-branch]
```

**3. Branch Protection Blocking Merge**
- Ensure all status checks pass
- Get required approvals
- Update branch with latest develop

### Getting Help
1. Check the Actions tab for detailed error logs
2. Review the GITFLOW_WORKFLOW.md for process questions
3. Ask team members for code review help

## 📊 Project Requirements Alignment

This setup addresses the technical expectations:
- ✅ **GitFlow workflow** for team collaboration
- ✅ **CI/CD with GitHub Actions** for smooth deployment
- ✅ **Consistent commit messages** and PR practices
- ✅ **Automated testing** before deployment
- ✅ **Proper repository structure** with detailed documentation

## 🎯 Next Steps

1. **Repo owner**: Set up branch protection rules
2. **Team**: Start using personal branch → develop workflow
3. **Everyone**: Follow commit message and PR templates
4. **Monitor**: Watch Actions tab for deployment status

---

**Happy coding! 🚀**