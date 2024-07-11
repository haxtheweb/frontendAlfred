const dotenv = require('dotenv');
dotenv.config()

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002";

const PineconeClient = require('@pinecone-database/pinecone').Pinecone;
const pc = new PineconeClient({
    apiKey: PINECONE_API_KEY,
});

const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});


const createIndex = async (INDEX_NAME) => {
    const allIndexes = await pc.listIndexes();
        if (allIndexes.indexes.some(index => index.name === INDEX_NAME)) {
            console.log("Deleting existing index");
            await pc.deleteIndex(INDEX_NAME);
        }

        let loopIndexes = await pc.listIndexes();
        while (loopIndexes.indexes.some(index => index.name === INDEX_NAME)) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            loopIndexes = await pc.listIndexes();
            console.log("still exists");
        }

        const dimension = 1536;
        const metric = 'cosine';
        const cloud = 'aws';
        const region = 'us-east-1';
    
        await pc.createIndex({
            name: INDEX_NAME,
            dimension: dimension,
            metric: metric,
            spec: {
                serverless: {
                    cloud: cloud,
                    region: region
                }
            }
        });

};


const scrapeWebsite = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.text();
        return data;
        } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        }
};


const chunkText = async (text) => {
    const chunkSize = 2048;
    const sentences = text.split(". ");
    const chunks = [];
    let currentChunk = "";

    sentences.forEach(sentence => {
        if (currentChunk.length + sentence.length <= chunkSize) {
            currentChunk += sentence + '. ';
        } else {
            chunks.push(currentChunk);
            currentChunk = sentence + '. ';
        }
    });

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
};


const getEmbedding = async (chunk) => {
    const url = 'https://api.openai.com/v1/embeddings';

    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const data = {
        'model': OPENAI_EMBEDDING_MODEL,
        'input': chunk
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        const responseJson = await response.json();
        const embedding = responseJson.data[0].embedding;
        return embedding;
    } catch (error) {
        console.error('Error fetching the embedding:', error);
        return null;
    }
};


const embedChunksAndUploadToPinecone = async (chunks, indexName) => {
    const embeddingsWithIds = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await getEmbedding(chunk);
        embeddingsWithIds.push({ id: String(i), embedding: embedding, chunk: chunk });
    }

    const upserts = embeddingsWithIds.map(({ id, embedding, chunk }) => ({
        id: id,
        values: embedding,
        metadata: { chunk_text: chunk }
    }));

    const index = pc.index(indexName);
    await index.upsert(upserts);
};


//MAIN
export default async function handler(req, res) {
    try {
    const data = req.body;
    const fullURL = data.url;
    ///const fullURL = 'https://oer.hax.psu.edu/e5f/sites/astro-140-feigelson/';
    const parts = new URL(fullURL).pathname.split('/');
    const siteIndex = parts.findIndex(part => part === 'sites');
    let extractedPart = '';
    if (siteIndex !== -1 && siteIndex + 1 < parts.length) {
        extractedPart = parts[siteIndex + 1].replace(/-/g, '');
    }

    const haxURL = 'https://haxapi.vercel.app/api/apps/haxcms/siteToHtml?site=' + fullURL + 
        '&type=link&magic=https://cdn.webcomponents.psu.edu/cdn/';

    const index = extractedPart;

    await createIndex(index);
    const urlText = await scrapeWebsite(haxURL);
    const chunks = await chunkText(urlText);
    await embedChunksAndUploadToPinecone(chunks, index);

    const messageReturn = "Chunks embedded and stored successfully";
    let sendResponse = {
        "data":{
            message: messageReturn,
            course: index
        }
    }
    res.status(200).send(sendResponse);

    } catch (error) {
        console.error('Unhandled error in handler:', error);
        res.status(500).send('Internal Server Error');
    }
};


