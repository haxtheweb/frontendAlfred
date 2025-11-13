# Authentication Deployment Checklist

## Before You Deploy to Vercel

### Step 1: Set the Environment Variable
- [ ] Go to https://vercel.com/dashboard
- [ ] Find your project (frontendAlfred)
- [ ] Click **Settings** → **Environment Variables**
- [ ] Click **Add New** 
- [ ] Variable name: `VITE_ACCESS_CODE`
- [ ] Value: Your desired access code (e.g., `alfred2024`, or a strong custom code)
- [ ] Click **Add**
- [ ] Click **Redeploy** or push new code to trigger a rebuild

### Step 2: Verify It Works
- [ ] Wait for Vercel to finish deploying
- [ ] Visit your deployment URL (e.g., https://frontendAlfred-xxx.vercel.app)
- [ ] You should see the login page with "🤖 Alfred" heading
- [ ] Enter your access code
- [ ] Click **Login**
- [ ] Should redirect to the main chat interface
- [ ] Chat, tools, and features should be accessible

### Step 3: If It Doesn't Work

**Check Browser Console:**
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Look for error messages
4. Check what `window.ACCESS_CODE_CONFIG` value was set to
5. If it says `VITE_ACCESS_CODE_PLACEHOLDER`, the environment variable wasn't injected

**Fix:**
- Verify environment variable is set in Vercel dashboard
- Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)
- Try in an incognito/private window
- Check Vercel build logs to see if build script ran
- Redeploy manually from Vercel dashboard

## For Local Development

### Setup (One Time)
- [ ] `.env.local` file exists in `frontendAlfred/` directory
- [ ] It contains: `VITE_ACCESS_CODE=alfred2024`
- [ ] Run: `node build-inject-env.js`

### Testing Locally
- [ ] Open auth.html in browser (or use local server)
- [ ] Login with `alfred2024`
- [ ] Verify chat and tools work

### Before Committing
- [ ] `.env.local` is in `.gitignore` ✓
- [ ] `validate-access.json` is in `.gitignore` ✓
- [ ] `auth.html` has `VITE_ACCESS_CODE_PLACEHOLDER` (not your actual code) ✓
- [ ] `build-inject-env.js` exists ✓
- [ ] `vercel.json` has `buildCommand` ✓

## File Checklist

### Files That Should Be Committed
- ✅ `auth.html` (with placeholder)
- ✅ `build-inject-env.js` (the build script)
- ✅ `vercel.json` (with buildCommand)
- ✅ `AUTHENTICATION_SETUP.md`
- ✅ `DEPLOYMENT_CHECKLIST.md`
- ✅ Updated `.gitignore`

### Files That Should NOT Be Committed (in .gitignore)
- ❌ `.env.local`
- ❌ `validate-access.json`
- ❌ `.env`
- ❌ Any `.env*` files

## How It Works

1. **Local Development**: You run `node build-inject-env.js` which reads `.env.local` and injects the code into `auth.html`

2. **Vercel Deployment**: 
   - You push code with placeholder `auth.html`
   - Vercel sees `buildCommand: "node build-inject-env.js"`
   - Vercel has `VITE_ACCESS_CODE` environment variable set
   - Build script runs and injects the actual code
   - Deployed HTML has the real access code

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login page doesn't appear | Check CORS headers in vercel.json are correct |
| Access code doesn't work | Verify VITE_ACCESS_CODE is set in Vercel Settings |
| "Invalid access code" error | Double-check the code you set, try clearing cookies/cache |
| Build script never runs | Ensure `buildCommand` is in vercel.json and Vercel redeployed |
| .env.local keeps appearing in git | Run `git rm --cached .env.local` and ensure it's in .gitignore |

## Environment Variable Best Practices

- ✅ Use strong, random codes in production (not `alfred2024`)
- ✅ Change the code periodically
- ✅ Never commit `.env.local` or actual codes to git
- ✅ Use Vercel's encrypted environment variables
- ✅ If code is compromised, update it in Vercel and redeploy

## Emergency: Change Access Code

**If you need to change the code:**

1. Go to Vercel Settings → Environment Variables
2. Edit `VITE_ACCESS_CODE` value
3. Save and redeploy
4. Users will need to use the new code to login

**OR:**

1. Go to Vercel Settings → Environment Variables  
2. Delete `VITE_ACCESS_CODE`
3. Redeploy
4. Users will fall back to `validate-access.json` (won't work unless you commit it - don't do this!)

**Better approach:**
- Always keep a valid code in Vercel environment variables
- Change it via Vercel dashboard, not git commits
