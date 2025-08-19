
/*
export default async function handler(req, res) {
    const apiKey = process.env.API_KEY;
    
    const response = await fetch("https://ai.services.hax.psu.edu/call-ollama", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(req.body),
        mode: 'cors',
    });

    const data = await response.json();
    res.status(200).json(data);
}
*/

/*
export default async function handler(req, res) {
    const apiKey = process.env.API_KEY;

    try {
        // Log the incoming request body to check if it's properly formatted
        console.log("Incoming request body:", req.body);

        const response = await fetch("https://ai.services.hax.psu.edu/call-ollama", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(req.body), // Convert to JSON string
        });

        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
}
*/

/* ORIG before SSL
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const apiKey = process.env.API_KEY;
    console.log("Incoming request body:", req.body);
    
    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }
    
    try {
        // Create a custom fetch with SSL verification disabled
        const https = require('https');
        
        const agent = new https.Agent({
            rejectUnauthorized: false  // Disable SSL verification
        });
        
        const response = await fetch("http://ai.services.hax.psu.edu/call-ollama", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(req.body),
            agent: agent  // Use the custom agent
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Backend error:", errorText);
            throw new Error(`Backend API failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Success:", Object.keys(data));
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: "An error occurred while processing your request.",
            details: error.message
        });
    }
}
*/
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const apiKey = process.env.API_KEY;
    console.log("API Proxy - Incoming request for:", req.url);
    console.log("Request method:", req.method);
    console.log("Request body keys:", Object.keys(req.body || {}));
    
    if (!apiKey) {
        console.error("API key not configured");
        return res.status(500).json({ error: "API key not configured" });
    }
    
    try {
        // We'll use the built-in Node.js https module instead of fetch
        // because fetch doesn't properly support SSL bypass in Vercel's environment
        
        console.log("Making request to PSU server...");
        
        // Use the built-in Node.js https module with custom agent
        const https = require('https');
        const { URL } = require('url');
        
        const url = new URL("https://ai.services.hax.psu.edu/call-ollama");
        const postData = JSON.stringify(req.body);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Content-Length': Buffer.byteLength(postData)
            },
            rejectUnauthorized: false  // Bypass SSL verification
        };
        
        const response = await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        json: () => Promise.resolve(JSON.parse(data)),
                        text: () => Promise.resolve(data)
                    });
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
        console.log("PSU server response status:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("PSU server error:", response.status, errorText);
            throw new Error(`PSU API failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("PSU server success - response keys:", Object.keys(data));
        res.status(200).json(data);
        
    } catch (error) {
        console.error('API Proxy error:', error.message);
        console.error('Error details:', error);
        res.status(500).json({ 
            error: "An error occurred while processing your request.",
            details: error.message
        });
    }
}