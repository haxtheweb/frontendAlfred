#!/usr/bin/env node

/**
 * Build script to inject environment variables into auth.html at build time
 * This is necessary because Vercel serves static HTML files without access to 
 * Node.js environment variables at runtime.
 * 
 * Usage: node build-inject-env.js
 * This script should be run during the build process (e.g., in vercel.json or package.json scripts)
 */

const fs = require('fs');
const path = require('path');

let accessCode = null;

// Priority 1: Environment variable (from Vercel or CLI)
if (process.env.VITE_ACCESS_CODE) {
  accessCode = process.env.VITE_ACCESS_CODE;
  console.log('📝 Using VITE_ACCESS_CODE from environment variable');
}
// Priority 2: Load from .env.local if it exists (for local development)
else {
  const envLocalPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    try {
      const envLocal = fs.readFileSync(envLocalPath, 'utf-8');
      const match = envLocal.match(/VITE_ACCESS_CODE=(.+)/);
      if (match && match[1]) {
        accessCode = match[1].trim();
        console.log('📝 Using VITE_ACCESS_CODE from .env.local');
      }
    } catch (e) {
      console.warn('⚠️  Could not read .env.local file:', e.message);
    }
  }
}

// Fallback to default
if (!accessCode) {
  accessCode = 'alfred2024';
  console.log('📝 Using default access code');
}

// Path to auth.html
const authPath = path.join(__dirname, 'auth.html');

if (!fs.existsSync(authPath)) {
  console.error(`❌ Error: auth.html not found at ${authPath}`);
  process.exit(1);
}

console.log('🔨 Injecting environment variables into auth.html...');
console.log(`📍 Working directory: ${__dirname}`);

try {
  // Read the auth.html file
  let content = fs.readFileSync(authPath, 'utf-8');

  // Check if placeholder exists
  if (!content.includes("window.ACCESS_CODE_CONFIG = 'VITE_ACCESS_CODE_PLACEHOLDER';")) {
    console.warn('⚠️  Warning: Placeholder not found in auth.html. File may have already been processed.');
  }

  // Replace the placeholder with the actual environment variable value
  // Escape single quotes in the value for safe JavaScript string injection
  const escapedCode = accessCode.replace(/'/g, "\\'");
  const originalContent = content;
  content = content.replace(
    "window.ACCESS_CODE_CONFIG = 'VITE_ACCESS_CODE_PLACEHOLDER';",
    `window.ACCESS_CODE_CONFIG = '${escapedCode}';`
  );

  // Verify the replacement happened
  if (content === originalContent) {
    console.warn('⚠️  Warning: No changes made to auth.html');
  }

  // Write the modified content back to auth.html
  fs.writeFileSync(authPath, content, 'utf-8');

  console.log('✅ Successfully injected VITE_ACCESS_CODE environment variable');
  console.log(`🔐 Access code masked: ${accessCode.substring(0, 3)}${'*'.repeat(Math.max(0, accessCode.length - 3))}`);
  process.exit(0);
} catch (error) {
  console.error('❌ Error injecting environment variables:', error.message);
  console.error('📋 Stack trace:', error.stack);
  process.exit(1);
}
