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
