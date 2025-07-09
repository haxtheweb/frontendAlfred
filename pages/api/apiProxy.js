
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
