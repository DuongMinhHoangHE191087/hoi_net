# 🔧 Vercel GitHub Integration Setup Guide

## ✅ Recommended Configuration

### For Production Project (WEB-SSG)

```
Pull Request Comments:        ✅ ON
Commit Comments:             ✅ ON
Require Verified Commits:    ❌ OFF
deployment_status Events:    ✅ ON
repository_dispatch Events:  ❌ OFF
```

---

## 📍 Where to Configure

1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Project**: WEB-SSG
3. **Navigate**: Settings → Git → GitHub
4. **Toggle Options** as recommended above
5. **Save Changes**

---

## 🎯 What Each Option Does

### 1. Pull Request Comments ✅
**Status: ENABLED**

**What it does:**
- Vercel bot comments on PRs with deployment info
- Provides preview URL for testing
- Shows build status and metrics

**Example Comment:**
```
✅ Deployment ready!
🔗 Preview: https://web-ssg-pr123.vercel.app
📊 Build Time: 1m 23s
✨ Lighthouse Score: 95/100
```

**Why enable:**
- ✅ Preview changes before merge
- ✅ Team can test features
- ✅ Catch issues early

---

### 2. Commit Comments ✅
**Status: ENABLED**

**What it does:**
- Vercel bot comments on commits
- Links to deployment URL
- Shows deployment status

**Example Comment:**
```
✅ Deployed to Production
🔗 https://web-ssg.vercel.app
⏱️ Build Time: 1m 45s
📦 Bundle Size: 245 KB
```

**Why enable:**
- ✅ Quick access to deployments
- ✅ Track each commit's deployment
- ✅ Easier debugging

---

### 3. Require Verified Commits ❌
**Status: DISABLED**

**What it does:**
- Only deploys commits with GPG signature
- Requires GPG key setup

**Why disable:**
- ❌ Adds complexity
- ❌ Not needed for most projects
- ❌ Requires GPG configuration

**When to enable:**
- ✅ Enterprise projects
- ✅ Security-critical apps
- ✅ Compliance requirements

---

### 4. deployment_status Events ✅
**Status: ENABLED**

**What it does:**
- Sends deployment status to GitHub
- Shows in GitHub UI
- Enables GitHub Actions integration

**GitHub UI Display:**
```
Commits:
├─ feat: add feature   ✅ Deployed
├─ fix: bug           🟡 Building
└─ chore: refactor    ❌ Failed
```

**Why enable:**
- ✅ Visual feedback in GitHub
- ✅ GitHub Actions integration
- ✅ Status tracking

---

### 5. repository_dispatch Events ❌
**Status: DISABLED**

**What it does:**
- Allows triggering deploys via GitHub API
- For advanced CI/CD workflows

**Why disable:**
- ❌ Not needed for standard workflows
- ❌ Vercel auto-deploys on push
- ❌ Adds complexity

**When to enable:**
- ✅ Custom automation needed
- ✅ External service triggers
- ✅ Advanced CI/CD pipelines

---

## 🚀 How to Apply These Settings

### Step-by-Step:

1. **Open Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project**
   ```
   Click on: WEB-SSG
   ```

3. **Go to Settings**
   ```
   Top menu: Settings
   ```

4. **Navigate to Git Section**
   ```
   Left sidebar: Git
   ```

5. **Find GitHub Integration**
   ```
   Scroll to "GitHub" section
   ```

6. **Toggle These Options:**
   ```
   ☑ Comments on Pull Requests      → ON
   ☑ Comments on Commits            → ON
   ☐ Require Verified Commits       → OFF
   ☑ Deployment Status Events       → ON
   ☐ Repository Dispatch Events     → OFF
   ```

7. **Save**
   ```
   Click "Save" button at bottom
   ```

---

## ✨ What You'll See After Setup

### On Pull Requests:
```markdown
💬 vercel bot commented 2 minutes ago

✅ Preview deployment ready!

🔗 Preview: https://web-ssg-git-feature-branch.vercel.app
📊 Visit Preview
🔍 Inspect
```

### On Commits:
```markdown
💬 vercel bot commented 1 minute ago

✅ Successfully deployed to production

🔗 https://web-ssg.vercel.app
⚡ Deployment: https://vercel.com/deployments/abc123
```

### In GitHub UI:
```
✅ All checks have passed
├─ ✅ Vercel — Deployment has completed
└─ 🔗 Visit Preview
```

---

## 🔍 Troubleshooting

### Not seeing comments?
```
1. Check Vercel GitHub App permissions
2. Re-install Vercel GitHub integration
3. Verify repository access
```

### Deployment status not showing?
```
1. Enable "deployment_status Events"
2. Check GitHub Settings → Integrations
3. Verify Vercel has access
```

---

## 📚 Additional Resources

- [Vercel Git Integration Docs](https://vercel.com/docs/git)
- [GitHub Webhooks](https://docs.github.com/webhooks)
- [Vercel Preview Deployments](https://vercel.com/docs/deployments/preview-deployments)

---

**Last Updated:** January 29, 2026  
**Project:** WEB-SSG  
**Status:** ✅ Ready to Configure
