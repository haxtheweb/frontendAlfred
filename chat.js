// Chat State Management
const chatState = {
    messages: [],
    context: null,
    contextType: null,
    conversationHistory: [] // For the LLM to maintain conversation context
};

const BACKEND_URL = 'https://ai.services.hax.psu.edu';
const CHAT_ENDPOINT = '/chat';

// Initialize chat event listeners
const chatFormEl = document.getElementById('chatForm');
const chatTextEl = document.getElementById('chatTextInput');

document.getElementById('chatForm').addEventListener('submit', handleChatSubmit);
document.getElementById('clearChatButton').addEventListener('click', clearChat);
document.getElementById('addContextButton').addEventListener('click', handleAddContext);

// Enter to send (Shift+Enter inserts newline)
chatTextEl.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatFormEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
});

// Initialize voice recognition (Chrome)
initializeVoiceRecognition();

/**
 * Handle chat form submission
 */
async function handleChatSubmit(event) {
    event.preventDefault();
    
    const userInput = document.getElementById('chatTextInput').value.trim();
    
    if (!userInput) {
        alert('Please enter a message');
        return;
    }
    
    // Add user message to display
    addMessageToDisplay(userInput, 'user');
    
    // Clear input
    document.getElementById('chatTextInput').value = '';
    
    // Add user message to conversation history
    chatState.conversationHistory.push({
        role: 'user',
        content: userInput
    });
    
    // Show spinner
    document.getElementById('chatSpinner').style.display = 'block';
    
    try {
        // Build the full conversation context
        let fullPrompt = buildConversationPrompt(userInput);
        
        // Call backend LLM
        const response = await fetch(`${BACKEND_URL}${CHAT_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: fullPrompt,
                context: chatState.context || ''
            }),
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantResponse = data.result || data.response || 'No response received';
        
        // Add assistant message to display
        addMessageToDisplay(assistantResponse, 'assistant');
        
        // Add assistant response to conversation history
        chatState.conversationHistory.push({
            role: 'assistant',
            content: assistantResponse
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        addMessageToDisplay(
            `Error: Failed to get response. ${error.message}`,
            'assistant'
        );
    } finally {
        document.getElementById('chatSpinner').style.display = 'none';
        scrollChatToBottom();
    }
}

/**
 * Build conversation prompt with history and context
 */
function buildConversationPrompt(userInput) {
    let prompt = '';
    
    // Add context if available
    if (chatState.context) {
        prompt += `CONTEXT:\n${chatState.context}\n\n`;
    }
    
    // Add conversation history (keep last 10 messages for context window)
    if (chatState.conversationHistory.length > 0) {
        prompt += 'CONVERSATION HISTORY:\n';
        const recentMessages = chatState.conversationHistory.slice(-10);
        recentMessages.forEach(msg => {
            prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
        });
        prompt += '\n';
    }
    
    // Add current user input
    prompt += `USER: ${userInput}\n\nPlease provide a helpful response.`;
    
    return prompt;
}

/**
 * Add message to chat display
 */
function addMessageToDisplay(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}-avatar`;
    avatar.textContent = sender === 'user' ? 'You' : 'AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Handle markdown-like formatting (basic)
    contentDiv.innerHTML = escapeHtml(content)
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    
    // Store in state
    chatState.messages.push({
        sender,
        content,
        timestamp: new Date()
    });
    
    scrollChatToBottom();
}

/**
 * Scroll chat to bottom
 */
function scrollChatToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Handle adding context (file or URL)
 */
async function handleAddContext() {
    const fileInput = document.getElementById('chatFileInput');
    const urlInput = document.getElementById('chatUrlInput');
    
    const hasFile = fileInput.files.length > 0;
    const hasUrl = urlInput.value.trim().length > 0;
    
    if (!hasFile && !hasUrl) {
        alert('Please select a file or enter a URL');
        return;
    }
    
    document.getElementById('chatSpinner').style.display = 'block';
    
    try {
        if (hasFile) {
            await handleFileUpload(fileInput.files[0]);
        } else if (hasUrl) {
            await handleUrlContext(urlInput.value.trim());
        }
        
        // Update context indicator
        updateContextIndicator();
        
        // Clear inputs
        fileInput.value = '';
        urlInput.value = '';
        
        addMessageToDisplay(
            'Context added successfully! You can now chat and reference this document.',
            'assistant'
        );
        
    } catch (error) {
        console.error('Context error:', error);
        addMessageToDisplay(
            `Error adding context: ${error.message}`,
            'assistant'
        );
    } finally {
        document.getElementById('chatSpinner').style.display = 'none';
    }
}

/**
 * Handle file upload for context
 */
async function handleFileUpload(file) {
    // Extract text from file (simplified approach)
    const text = await extractTextFromFile(file);
    chatState.context = text;
    chatState.contextType = file.name;
}

/**
 * Extract text from various file types
 */
async function extractTextFromFile(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.txt')) {
        return await file.text();
    } else if (fileName.endsWith('.pdf')) {
        // For PDF, we would need a library like pdf.js
        // For now, return a placeholder message
        return await extractPdfText(file);
    } else if (fileName.endsWith('.docx')) {
        return await extractDocxText(file);
    } else if (fileName.endsWith('.pptx')) {
        return '[PowerPoint file uploaded - text extraction not yet implemented]';
    } else {
        throw new Error('Unsupported file type');
    }
}

/**
 * Extract text from DOCX
 */
async function extractDocxText(file) {
    // Send to backend for text extraction (simple, not storing)
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${BACKEND_URL}/extract-text`, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.text || 'Could not extract text from DOCX';
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to process DOCX file');
        }
    } catch (error) {
        throw new Error('Could not extract DOCX text: ' + error.message);
    }
}

/**
 * Extract text from PDF
 */
async function extractPdfText(file) {
    // For production, send to backend or use pdf.js library
    // For now, return placeholder
    const placeholder = `[PDF File: ${file.name} - ${(file.size / 1024).toFixed(2)} KB]\n\nNote: Full text extraction requires server-side processing.`;
    return placeholder;
}

/**
 * Handle URL context
 */
async function handleUrlContext(url) {
    try {
        // Validate URL format
        new URL(url);
        
        // Fetch content from URL via backend
        console.log('Fetching content from URL:', url);
        const response = await fetch(`${BACKEND_URL}/fetch-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url }),
            mode: 'cors'
        });
        
        if (!response.ok) {
            // Try to parse JSON error; fall back to plain text/status
            try {
                const error = await response.json();
                const msg = typeof error === 'string' ? error : (error.detail || JSON.stringify(error));
                throw new Error(msg || `Failed to fetch URL (${response.status})`);
            } catch (e) {
                const text = await response.text().catch(() => '');
                throw new Error(text || `Failed to fetch URL (${response.status})`);
            }
        }
        
        const data = await response.json();
        console.log('Successfully fetched URL content:', data.character_count, 'characters');
        
        // Store the fetched content as context
        chatState.context = `URL Content from: ${data.title || url}\n\n${data.text}`;
        chatState.contextType = data.title || url;
    } catch (error) {
        throw new Error('Could not fetch URL content: ' + error.message);
    }
}

/**
 * Update context indicator
 */
function updateContextIndicator() {
    const indicator = document.getElementById('contextIndicator');
    
    if (chatState.context) {
        indicator.textContent = `Context: ${chatState.contextType}`;
        indicator.classList.add('active');
    } else {
        indicator.textContent = 'No context';
        indicator.classList.remove('active');
    }
}

/**
 * Clear chat history
 */
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        chatState.messages = [];
        chatState.conversationHistory = [];
        chatState.context = null;
        chatState.contextType = null;
        
        document.getElementById('chatMessages').innerHTML = '';
        updateContextIndicator();
        
        addMessageToDisplay(
            'Chat cleared. You can start a new conversation!',
            'assistant'
        );
    }
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Initialize chat on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    addMessageToDisplay(
        'Welcome to Alfred Chat! Ask me anything. You can also upload documents or paste URLs to provide context for our conversation.',
        'assistant'
    );
    updateContextIndicator();
});

// Voice recognition using Web Speech API
function initializeVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceBtn = document.getElementById('voiceButton');
    if (!voiceBtn) return;

    if (!SpeechRecognition) {
        // Disable button if not supported
        voiceBtn.disabled = true;
        voiceBtn.title = 'Voice input not supported in this browser';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let recognizing = false;

    recognition.onstart = () => {
        recognizing = true;
        updateVoiceButtonUI(true);
    };

    recognition.onend = () => {
        recognizing = false;
        updateVoiceButtonUI(false);
    };

    recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        recognizing = false;
        updateVoiceButtonUI(false);
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        chatTextEl.value = transcript;
        chatTextEl.focus();
    };

    voiceBtn.addEventListener('click', () => {
        if (recognizing) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (e) {
                // Some browsers throw if start is called rapidly
                console.error('Voice start error:', e);
            }
        }
    });

    function updateVoiceButtonUI(active) {
        if (active) {
            voiceBtn.classList.add('recording');
            voiceBtn.textContent = '⏺';
            voiceBtn.title = 'Stop voice input';
        } else {
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
            voiceBtn.title = 'Start voice input';
        }
    }
}
