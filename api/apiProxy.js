
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