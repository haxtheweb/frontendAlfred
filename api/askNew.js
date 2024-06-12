// api/askNew.js

module.exports = (req, res) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
        res.status(200).end();
        return;
    }

    // Your existing logic for handling the request
    const { question, course } = req.body;

    // Simulating an API response
    const response = {
        your_returned_value: `Question: ${question}, Course: ${course}`
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);
};
