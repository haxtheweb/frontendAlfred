const dotenv = require('dotenv');
dotenv.config()

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

const PineconeClient = require('@pinecone-database/pinecone').Pinecone;
const pc = new PineconeClient({
    apiKey: PINECONE_API_KEY,
});

export default async function handler(req, res) {
    try {
        const allIndexes = await pc.listIndexes();
        //console.log('allIndexes:', JSON.stringify(allIndexes, null, 2));
        const indexesArray = allIndexes.indexes; 
        const response = [];

        indexesArray.forEach(index => {
            response.push({
                value: index.name, 
                label: index.name
            });
        });

        res.status(200).send(response);

    } catch (error) {
        console.error('Unhandled error in handler:', error);
        res.status(500).send('Internal Server Error');
    }
};