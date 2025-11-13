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

// Load from .env.local if it exists (for local development)
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  try {
    const envLocal = fs.readFileSync(envLocalPath, 'utf-8');
    const match = envLocal.match(/VITE_ACCESS_CODE=(.+)/);
    if (match && match[1]) {
      process.env.VITE_ACCESS_CODE = match[1].trim();
    }
  } catch (e) {
    console.warn('⚠️  Could not read .env.local file:', e.message);
  }
}

// Get environment variable with fallback for local development
const accessCode = process.env.VITE_ACCESS_CODE || 'alfred2024';

// Path to auth.html
const authPath = path.join(__dirname, 'auth.html');

console.log('🔨 Injecting environment variables into auth.html...');

try {
  // Read the auth.html file
  let content = fs.readFileSync(authPath, 'utf-8');

  // Replace the placeholder with the actual environment variable value
  // Escape single quotes in the value for safe JavaScript string injection
  const escapedCode = accessCode.replace(/'/g, "\\'");
  content = content.replace(
    "window.ACCESS_CODE_CONFIG = 'VITE_ACCESS_CODE_PLACEHOLDER';",
    `window.ACCESS_CODE_CONFIG = '${escapedCode}';`
  );

  // Write the modified content back to auth.html
  fs.writeFileSync(authPath, content, 'utf-8');

  console.log('✅ Successfully injected VITE_ACCESS_CODE environment variable');
  console.log(`📝 Access code value: ${accessCode.substring(0, 3)}${'*'.repeat(Math.max(0, accessCode.length - 3))}`);
} catch (error) {
  console.error('❌ Error injecting environment variables:', error.message);
  process.exit(1);
}
