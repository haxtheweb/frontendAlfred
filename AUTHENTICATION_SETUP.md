# Authentication Setup with Environment Variables

## Overview

The Alfred frontend now uses environment variable-based authentication to securely manage access codes without committing sensitive information to git.

## How It Works

### Architecture

1. **Build Script** (`build-inject-env.js`): Runs during build time on Vercel to inject the environment variable into `auth.html`
2. **Placeholder** (`auth.html`): Contains `VITE_ACCESS_CODE_PLACEHOLDER` which gets replaced with the actual code
3. **Fallback** (`validate-access.json`): Local development file for local testing (in `.gitignore`)

### Process Flow

```
Build Time:
1. Vercel receives code push
2. Vercel reads VITE_ACCESS_CODE environment variable
3. build-inject-env.js runs and replaces placeholder with actual code
4. Modified auth.html is deployed

Local Development:
1. node build-inject-env.js reads .env.local
2. Replaces placeholder with local access code
3. Works for local testing
```

## Setup Instructions

### For Vercel Deployment

1. **Set Environment Variable in Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Find your project (frontendAlfred)
   - Click Settings → Environment Variables
   - Add new variable: `VITE_ACCESS_CODE`
   - Set the value to your desired access code (e.g., `alfred2024`, `MySecret123`, etc.)
   - Save and redeploy

2. **Verify Deployment**
   - Visit your Vercel deployment URL
   - You should see the login page
   - Enter the access code you set in Vercel
   - Should successfully log in

### For Local Development

1. **Check `.env.local` File**
   - File should exist at `frontendAlfred/.env.local`
   - Contains: `VITE_ACCESS_CODE=alfred2024`
   - This file is in `.gitignore` so it won't be committed

2. **Run Build Script Before Testing**
   ```bash
   cd frontendAlfred
   node build-inject-env.js
   ```

3. **Test Locally**
   - Open `auth.html` in a browser (or run a local server)
   - Enter the access code from `.env.local` (default: `alfred2024`)
   - Should successfully authenticate

## Files Modified

- **auth.html**: Updated with placeholder `VITE_ACCESS_CODE_PLACEHOLDER` and fallback logic
- **build-inject-env.js**: New script that injects environment variables at build time
- **vercel.json**: Added `buildCommand` to run injection script
- **.gitignore**: Already includes `validate-access.json` and `.env*`

## Security Considerations

✅ **Protected**:
- Access code never committed to git
- Vercel environment variables are encrypted and secure
- Local `.env.local` is in `.gitignore`

⚠️ **Notes**:
- Access code is visible in deployed HTML after injection (this is acceptable since it's also needed as a password at login)
- Validate-access.json is a fallback for local development only
- Always use strong access codes in production

## Troubleshooting

### Login Not Working on Vercel

1. **Check Vercel Environment Variable**
   - Verify `VITE_ACCESS_CODE` is set in Vercel Settings → Environment Variables
   - Redeploy the project after setting the variable

2. **Clear Browser Cache**
   - Clear browser cache and cookies
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
   - Try incognito/private window

3. **Check Browser Console**
   - Open DevTools → Console tab
   - Look for any error messages
   - Check what code value is being used

### Local Testing Issues

1. **Run Build Script**
   ```bash
   node build-inject-env.js
   ```

2. **Verify .env.local Exists**
   - Should be in `frontendAlfred/.env.local`
   - Should contain `VITE_ACCESS_CODE=alfred2024` (or your custom code)

3. **Clear Browser Storage**
   - Open DevTools → Application tab
   - Clear all storage (sessionStorage, localStorage)
   - Reload page

## Changing the Access Code

### On Vercel (Production)
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Edit `VITE_ACCESS_CODE` with new value
4. Trigger a redeploy by pushing code changes or manually redeploying

### Locally (Development)
1. Edit `frontendAlfred/.env.local`
2. Update `VITE_ACCESS_CODE=yourNewCode`
3. Run: `node build-inject-env.js`
4. Test locally

## How the Injection Works

The build script replaces this line:
```javascript
window.ACCESS_CODE_CONFIG = 'VITE_ACCESS_CODE_PLACEHOLDER';
```

With:
```javascript
window.ACCESS_CODE_CONFIG = 'your_actual_code_here';
```

This happens at build time on Vercel, so the actual code is never in the git repository.
