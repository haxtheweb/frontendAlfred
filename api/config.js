/**
 * Configuration API endpoint
 * Returns the VITE_ACCESS_CODE from environment variables
 * 
 * This is used by auth.html to get the access code at runtime
 * instead of trying to inject it at build time
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the access code from environment variables
  const accessCode = process.env.VITE_ACCESS_CODE || 'alfred2024';

  // Return the configuration
  res.status(200).json({
    accessCode: accessCode,
    timestamp: new Date().toISOString()
  });
}
