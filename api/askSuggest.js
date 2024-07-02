const dotenv = require('dotenv');
dotenv.config()
 
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002";

const PineconeClient = require('@pinecone-database/pinecone').Pinecone;
const pc = new PineconeClient({
    apiKey: PINECONE_API_KEY,
});

const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});


//functions starting here
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

const queryPinecone = async (course, query, topK = 15) => {
    const index = pc.Index(course);
    const questionEmbedding = await getEmbedding(query);

    if (!questionEmbedding) return null;

    try {
        const response = await index.query({
            vector: questionEmbedding,
            topK,
            includeMetadata: true
        });
        return response;
    } catch (error) {
        console.error(`Error querying Pinecone: ${error}`);
        return null;
    }
};

const generateResponseOpenAI = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0].message;

    } catch (error) {
        console.error(`Error generating response: ${error}`);
        return null;
    }
};

//Two different GPT engines above and below

const generateResponseAnthropic = async (prompt) => {
    try {
        const response = await anthropic.completions.create({
            prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
            model: 'claude-v1',
            max_tokens_to_sample: 1000,
        });
        //console.log("answer coming...");
        //console.log(response.completion);
        return response.completion;

    } catch (error) {
        console.error(`Error generating response: ${error}`);
        return null;
    }
};


export default async function handler(req, res) {
    try {
    const data = req.body;
    const query = data.question;
    const course = data.course;
    const engine = data.engine;

    const response = await queryPinecone(course, query);
    if (!response) {
        console.log("No response from Pinecone");
        return;
    }

    const chunks = response.matches
        .filter(match => match.metadata && match.metadata.chunk_text)
        .map(match => match.metadata.chunk_text);

    const combinedText = chunks.join(" ");

    //const llmPrompt = `Based on the following information, answer the query: ${query}\n\n${combinedText}`;
    //ORIG - not including suggested prompts

    const llmPrompt = `Based on the following information, answer the query: ${query}\n\n${combinedText}.
      In addition, give me three suggestions for topics related to ${query} and label them as ONE, TWO, and THREE
    `;

    //call the appropriate engine    
    switch (engine) {
        case "Alfred": {
            let llmResponse = await generateResponseOpenAI(llmPrompt);

            let sendResponse = {
                "data":{
                    answers: llmResponse,
                    question: query
                }
            }
            res.status(200).send(sendResponse);

            break;
        }
        case "Robin": {
            let llmResponse = await generateResponseAnthropic(llmPrompt);
            //console.log("answer after...");
            //console.log(llmResponse);
            let sendResponse = {
                "data":{
                    answers: {
                        content: llmResponse
                    },
                    question: query
                }
            }
            res.status(200).send(sendResponse);
            break;
        }
        case "Catwoman": {
            let llmResponseBlank = `Answer the query: ${query}`;
            let llmResponse = await generateResponseOpenAI(llmResponseBlank);

            let sendResponse = {
                "data":{
                    answers: llmResponse,
                    question: query
                }
            }
            res.status(200).send(sendResponse);

            break;
        }
        default: {
            let llmResponse = await generateResponseOpenAI(llmPrompt);

            let sendResponse = {
                "data":{
                    answers: llmResponse,
                    question: query
                }
            }
            res.status(200).send(sendResponse);

            break;
        }
    }
    
    //ORIG
    /*
    let sendResponse = {
        "data":{
            answers: llmResponse,
            question: query
        }
      }

    res.status(200).send(sendResponse);
    //res.status(200).json(sendResponse);
    */

    } catch (error) {
        console.error('Unhandled error in handler:', error);
        res.status(500).send('Internal Server Error');
    }
};

