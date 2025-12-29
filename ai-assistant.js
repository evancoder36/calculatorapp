// AI Math & Science Assistant Module
// Uses Google Gemini API for intelligent responses

class AIAssistant {
    constructor() {
        this.apiKey = localStorage.getItem('geminiApiKey') || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.chatHistory = [];
        this.isProcessing = false;

        this.systemPrompt = `You are a friendly and helpful math and science tutor named "Evan AI" integrated into a calculator app called "The Evan Multiuse Calculator".

Your expertise includes:
- Mathematics: algebra, calculus, geometry, trigonometry, statistics
- Physics: mechanics, thermodynamics, electromagnetism, quantum physics
- Chemistry: reactions, equations, periodic table, organic chemistry
- General science questions

Guidelines:
- Solve problems step by step, showing your work clearly
- Use simple notation: x^2 for squared, sqrt() for square root, pi for π
- Keep explanations concise but thorough
- Be encouraging and educational
- If a question is unclear, ask for clarification
- For complex equations, break them down into smaller steps`;

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
        const clearChatBtn = document.getElementById('clearChatBtn');

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

            // Auto-resize input
            input.addEventListener('input', () => {
                this.updateSendButton();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.toggleSettings());
        }

        if (saveKeyBtn) {
            saveKeyBtn.addEventListener('click', () => this.saveApiKey());
        }

        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }

        // Suggestion buttons
        document.querySelectorAll('.ai-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                document.getElementById('aiInput').value = query;
                this.updateSendButton();
                this.sendMessage();
            });
        });
    }

    updateSendButton() {
        const input = document.getElementById('aiInput');
        const sendBtn = document.getElementById('aiSendBtn');
        if (input && sendBtn) {
            if (input.value.trim()) {
                sendBtn.classList.add('active');
            } else {
                sendBtn.classList.remove('active');
            }
        }
    }

    checkApiKey() {
        const setup = document.getElementById('aiSetup');
        const settingsBtn = document.getElementById('aiSettingsBtn');
        const keyStatus = document.getElementById('apiKeyStatus');

        if (!this.apiKey) {
            if (setup) setup.classList.add('show');
            if (settingsBtn) settingsBtn.innerHTML = '<span class="key-icon">🔑</span> Add Key';
            if (keyStatus) keyStatus.textContent = 'Not configured';
        } else {
            if (setup) setup.classList.remove('show');
            if (settingsBtn) settingsBtn.innerHTML = '<span class="key-icon">✓</span> Key Set';
            if (keyStatus) keyStatus.textContent = 'Ready';
        }
    }

    toggleSettings() {
        const setup = document.getElementById('aiSetup');
        setup.classList.toggle('show');

        if (setup.classList.contains('show')) {
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.value = this.apiKey;
                apiKeyInput.focus();
            }
        }
    }

    saveApiKey() {
        const input = document.getElementById('apiKeyInput');
        const key = input.value.trim();

        if (key) {
            this.apiKey = key;
            localStorage.setItem('geminiApiKey', key);
            this.checkApiKey();
            this.toggleSettings();
            this.addSystemMessage('API key saved! You can now ask questions.', 'success');
        } else {
            this.addSystemMessage('Please enter a valid API key', 'error');
        }
    }

    clearChat() {
        const chat = document.getElementById('aiChat');
        this.chatHistory = [];

        chat.innerHTML = `
            <div class="ai-welcome">
                <div class="ai-avatar-large">🧮</div>
                <h4>Hi! I'm Evan AI</h4>
                <p>Your math & science assistant. Ask me anything!</p>
                <div class="ai-suggestions">
                    <button class="ai-suggestion" data-query="Solve x² + 5x + 6 = 0">
                        <span class="suggestion-icon">📐</span>
                        <span>Solve equations</span>
                    </button>
                    <button class="ai-suggestion" data-query="Explain the Pythagorean theorem with an example">
                        <span class="suggestion-icon">📚</span>
                        <span>Explain theorems</span>
                    </button>
                    <button class="ai-suggestion" data-query="What is the derivative of sin(x)?">
                        <span class="suggestion-icon">∫</span>
                        <span>Calculus help</span>
                    </button>
                    <button class="ai-suggestion" data-query="Explain Newton's laws of motion simply">
                        <span class="suggestion-icon">🚀</span>
                        <span>Physics concepts</span>
                    </button>
                </div>
            </div>
        `;

        // Re-bind suggestion buttons
        document.querySelectorAll('.ai-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                document.getElementById('aiInput').value = query;
                this.updateSendButton();
                this.sendMessage();
            });
        });
    }

    async sendMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();

        if (!message || this.isProcessing) return;

        if (!this.apiKey) {
            this.addSystemMessage('Please set up your API key first', 'error');
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
        this.updateSendButton();

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

            let errorMsg = 'Something went wrong. Please try again.';
            if (error.message.includes('API key') || error.message.includes('API_KEY')) {
                errorMsg = 'Invalid API key. Please check your key in settings.';
            } else if (error.message.includes('quota') || error.message.includes('429')) {
                errorMsg = 'Rate limit reached. Please wait a moment and try again.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMsg = 'Network error. Please check your connection.';
            }

            this.addSystemMessage(errorMsg, 'error');
        }

        this.isProcessing = false;
    }

    async callGeminiAPI(message) {
        // Build contents array with chat history
        const contents = [];

        // Add chat history for context
        const recentHistory = this.chatHistory.slice(-10);
        for (const msg of recentHistory) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const requestBody = {
            system_instruction: {
                parts: [{ text: this.systemPrompt }]
            },
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        };

        console.log('Sending request to Gemini API...');

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error Response:', data);
            const errorMessage = data.error?.message || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }

        console.log('API Response:', data);

        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid response structure:', data);
            throw new Error('No response generated');
        }

        const assistantMessage = data.candidates[0].content.parts[0].text;

        // Save to chat history
        this.chatHistory.push({ role: 'user', content: message });
        this.chatHistory.push({ role: 'assistant', content: assistantMessage });

        return assistantMessage;
    }

    addMessage(content, role) {
        const chat = document.getElementById('aiChat');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${role}`;

        if (role === 'user') {
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div class="message-content">${this.escapeHtml(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-avatar user-avatar">You</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar ai-avatar">AI</div>
                <div class="message-bubble">
                    <div class="message-content">${this.formatMessage(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }

        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;
    }

    addSystemMessage(content, type = 'info') {
        const chat = document.getElementById('aiChat');

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-system-message ${type}`;
        messageDiv.innerHTML = `
            <span class="system-icon">${type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'}</span>
            <span>${content}</span>
        `;

        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;

        // Auto remove after delay
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, type === 'error' ? 5000 : 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatMessage(text) {
        // Escape HTML first
        let formatted = this.escapeHtml(text);

        // Format code blocks
        formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
        });

        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // Format bold
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Format italic
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');

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
            <div class="message-avatar ai-avatar">AI</div>
            <div class="message-bubble typing-bubble">
                <div class="typing-indicator">
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});
