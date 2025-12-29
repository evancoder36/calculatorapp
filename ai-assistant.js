// AI Math & Science Assistant Module
// Uses Google Gemini API for intelligent responses

class AIAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.chatHistory = [];
        this.isProcessing = false;

        this.systemPrompt = `You are a helpful math and science assistant integrated into a calculator app.
Your role is to:
- Solve mathematical problems step by step
- Explain scientific concepts clearly
- Help with equations, calculus, algebra, geometry, physics, chemistry, and more
- Provide formulas and show your work
- Keep responses concise but thorough
- Use simple formatting (no complex markdown)
- When showing math, use plain text notation (e.g., x^2 for x squared, sqrt() for square root)

Be friendly, educational, and precise. If you're unsure about something, say so.`;

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkApiKey();
    }

    bindEvents() {
        const sendBtn = document.getElementById('aiSendBtn');
        const input = document.getElementById('aiInput');
        const settingsBtn = document.getElementById('aiSettingsBtn');
        const saveKeyBtn = document.getElementById('saveApiKeyBtn');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.toggleSettings());
        }

        if (saveKeyBtn) {
            saveKeyBtn.addEventListener('click', () => this.saveApiKey());
        }

        // Suggestion buttons
        document.querySelectorAll('.ai-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                document.getElementById('aiInput').value = query;
                this.sendMessage();
            });
        });
    }

    checkApiKey() {
        const setup = document.getElementById('aiSetup');
        const settingsBtn = document.getElementById('aiSettingsBtn');

        if (!this.apiKey) {
            setup.classList.add('show');
            settingsBtn.textContent = 'API Key';
        } else {
            setup.classList.remove('show');
            settingsBtn.textContent = 'Change Key';
        }
    }

    toggleSettings() {
        const setup = document.getElementById('aiSetup');
        setup.classList.toggle('show');

        if (setup.classList.contains('show')) {
            document.getElementById('apiKeyInput').value = this.apiKey;
        }
    }

    saveApiKey() {
        const input = document.getElementById('apiKeyInput');
        const key = input.value.trim();

        if (key) {
            this.apiKey = key;
            localStorage.setItem('geminiApiKey', key);
            this.checkApiKey();
            this.showSuccess('API key saved successfully!');
        } else {
            this.showError('Please enter a valid API key');
        }
    }

    async sendMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();

        if (!message || this.isProcessing) return;

        if (!this.apiKey) {
            this.showError('Please set up your API key first');
            this.toggleSettings();
            return;
        }

        // Clear welcome message on first use
        const welcome = document.querySelector('.ai-welcome');
        if (welcome) {
            welcome.remove();
        }

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();
        this.isProcessing = true;

        try {
            const response = await this.callGeminiAPI(message);
            this.removeTyping();
            this.addMessage(response, 'assistant');
        } catch (error) {
            this.removeTyping();
            console.error('AI Error:', error);

            if (error.message.includes('API key')) {
                this.showError('Invalid API key. Please check your key and try again.');
            } else if (error.message.includes('quota')) {
                this.showError('API quota exceeded. Please try again later.');
            } else {
                this.showError('Failed to get response. Please try again.');
            }
        }

        this.isProcessing = false;
    }

    async callGeminiAPI(message) {
        // Add to chat history for context
        this.chatHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Keep only last 10 messages for context
        if (this.chatHistory.length > 20) {
            this.chatHistory = this.chatHistory.slice(-20);
        }

        const requestBody = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: this.systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I\'m ready to help with math and science questions.' }]
                },
                ...this.chatHistory
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        };

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 400) {
                throw new Error('Invalid API key');
            } else if (response.status === 429) {
                throw new Error('API quota exceeded');
            }
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response from API');
        }

        const assistantMessage = data.candidates[0].content.parts[0].text;

        // Add to chat history
        this.chatHistory.push({
            role: 'model',
            parts: [{ text: assistantMessage }]
        });

        return assistantMessage;
    }

    addMessage(content, role) {
        const chat = document.getElementById('aiChat');

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-message-content';
        contentDiv.innerHTML = this.formatMessage(content);

        messageDiv.appendChild(contentDiv);
        chat.appendChild(messageDiv);

        // Scroll to bottom
        chat.scrollTop = chat.scrollHeight;
    }

    formatMessage(text) {
        // Escape HTML
        let formatted = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Format code blocks
        formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code>${code.trim()}</code></pre>`;
        });

        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Format bold
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Format line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    showTyping() {
        const chat = document.getElementById('aiChat');

        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message assistant';
        typingDiv.id = 'aiTyping';

        typingDiv.innerHTML = `
            <div class="ai-message-content">
                <div class="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        chat.appendChild(typingDiv);
        chat.scrollTop = chat.scrollHeight;
    }

    removeTyping() {
        const typing = document.getElementById('aiTyping');
        if (typing) {
            typing.remove();
        }
    }

    showError(message) {
        const chat = document.getElementById('aiChat');

        const errorDiv = document.createElement('div');
        errorDiv.className = 'ai-error';
        errorDiv.textContent = message;

        chat.appendChild(errorDiv);
        chat.scrollTop = chat.scrollHeight;

        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        const chat = document.getElementById('aiChat');

        const successDiv = document.createElement('div');
        successDiv.className = 'ai-error';
        successDiv.style.background = 'rgba(16, 185, 129, 0.2)';
        successDiv.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        successDiv.style.color = '#6ee7b7';
        successDiv.textContent = message;

        chat.appendChild(successDiv);
        chat.scrollTop = chat.scrollHeight;

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});
