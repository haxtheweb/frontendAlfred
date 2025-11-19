# OpenAI-Compatible API Documentation

## Overview

The Alfred backend provides an OpenAI-compatible API endpoint that allows external applications to call the llama3.2 model using standard OpenAI client libraries. This is a separate interface from the web chat interface.

## Authentication

All requests must include your API key in the Authorization header:
```
Authorization: Bearer <your-api-key>
```

**Note:** API keys are managed separately and not published in documentation. Contact your administrator for API key access.

## Base URL

```
https://ai.services.hax.psu.edu/v1
```

## Endpoints

### POST /v1/chat/completions

OpenAI-compatible chat completions endpoint.

**URL:** `https://ai.services.hax.psu.edu/v1/chat/completions`

**Request Format:**
```json
{
    "model": "llama3.2:latest",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "What is machine learning?"}
    ],
    "temperature": 0.7,
    "max_tokens": 500
}
```

**Request Parameters:**
- `model` (string, optional): Model to use. Default: `llama3.2:latest`
- `messages` (array, required): Array of message objects with `role` and `content`
  - `role`: One of `system`, `user`, or `assistant`
  - `content`: The message text
- `temperature` (number, optional): Sampling temperature (0.0-1.0). Default: 0.7. Lower values = more deterministic, higher values = more creative
- `max_tokens` (number, optional): Maximum tokens in response (informational, server may not enforce strictly)
- `stream` (boolean, optional): Whether to stream responses. Default: false

**Response Format:**
```json
{
    "id": "chatcmpl-abc123def456",
    "object": "chat.completion",
    "created": 1700000000,
    "model": "llama3.2:latest",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "Machine learning is a subset of artificial intelligence..."
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 15,
        "completion_tokens": 50,
        "total_tokens": 65
    }
}
```

### GET /v1/models

List available models (OpenAI-compatible endpoint).

**URL:** `https://ai.services.hax.psu.edu/v1/models`

**Authorization:** Required (Bearer token)

**Response:**
```json
{
    "object": "list",
    "data": [
        {
            "id": "llama3.2:latest",
            "object": "model",
            "owned_by": "meta",
            "permission": []
        }
    ]
}
```

## Usage Examples

### Using curl

**Basic request:**
```bash
curl -X POST https://ai.services.hax.psu.edu/v1/chat/completions \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:latest",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

### Using Python (OpenAI client)

```python
from openai import OpenAI

client = OpenAI(
    api_key="<your-api-key>",
    base_url="https://ai.services.hax.psu.edu/v1"
)

response = client.chat.completions.create(
    model="llama3.2:latest",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Explain machine learning"}
    ],
    temperature=0.7
)

print(response.choices[0].message.content)
```

### Using JavaScript/Node.js (OpenAI client)

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "<your-api-key>",
  baseURL: "https://ai.services.hax.psu.edu/v1",
});

const message = await client.chat.completions.create({
  model: "llama3.2:latest",
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "What is AI?" },
  ],
  temperature: 0.7,
});

console.log(message.choices[0].message.content);
```

### Using TypeScript/Node.js

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Store in environment variable
  baseURL: "https://ai.services.hax.psu.edu/v1",
});

async function chat() {
  const response = await openai.chat.completions.create({
    model: "llama3.2:latest",
    messages: [
      {
        role: "user",
        content: "Explain quantum computing in simple terms",
      },
    ],
  });

  console.log(response.choices[0].message.content);
}

chat();
```

## Error Responses

### 401 Unauthorized
Missing or invalid API key
```json
{
  "detail": "Invalid API key"
}
```

### 400 Bad Request
Invalid request format
```json
{
  "detail": "Messages array cannot be empty"
}
```

### 500 Internal Server Error
Server error or model failure
```json
{
  "detail": "Model error: ..."
}
```

## Key Features

- ✅ OpenAI-compatible API (use standard OpenAI SDKs)
- ✅ Bearer token authentication
- ✅ Supports conversation history (via message array)
- ✅ Temperature control for response creativity
- ✅ Token usage reporting
- ✅ Standard error responses

## Model Information

**Model:** llama3.2:latest (Meta Llama 3.2)
- **Type:** Large Language Model
- **Capabilities:** General-purpose conversation, coding, analysis, creative writing
- **Context Window:** Standard LLM capabilities

## Rate Limiting

Currently no rate limiting is enforced. This may change based on server load.

## Best Practices

1. **Store API keys securely:**
   - Use environment variables (`process.env.OPENAI_API_KEY`)
   - Never commit API keys to version control
   - Use `.env` files locally (add to `.gitignore`)

2. **Handle errors gracefully:**
   - Check HTTP status codes
   - Parse error messages from response body
   - Implement retry logic for temporary failures

3. **Optimize requests:**
   - Reuse client instances when possible
   - Use appropriate temperature settings for your use case
   - Consider message history length for performance

4. **Security:**
   - Always use HTTPS
   - Validate responses before using in production
   - Implement request timeouts

## Comparison with Chat Interface

| Feature | Web Chat | API |
|---------|----------|-----|
| Access | Browser | Programmatic |
| Authentication | Session | API Key |
| Format | Chat UI | OpenAI-compatible JSON |
| Use Case | Interactive chat | Application integration |
| URL | `/chat` | `/v1/chat/completions` |

## Support

For issues or questions about the API:
1. Check the error details in the response body
2. Verify your API key is correct and has not expired
3. Ensure your API key is stored securely (use environment variables, never hardcode)
4. Contact your administrator for API key or access issues

## Feedback

To request features or report issues with the API, contact the development team.
