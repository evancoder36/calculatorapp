// AI Math & Science Assistant Module
// Uses built-in math solver + educational responses

class AIAssistant {
    constructor() {
        this.chatHistory = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.bindEvents();
        // Hide API key setup - not needed
        const setup = document.getElementById('aiSetup');
        const settingsBtn = document.getElementById('aiSettingsBtn');
        const keyStatus = document.getElementById('apiKeyStatus');
        if (setup) setup.style.display = 'none';
        if (settingsBtn) settingsBtn.style.display = 'none';
        if (keyStatus) keyStatus.textContent = 'Ready';
    }

    bindEvents() {
        const sendBtn = document.getElementById('aiSendBtn');
        const input = document.getElementById('aiInput');
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
            input.addEventListener('input', () => this.updateSendButton());
        }

        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }

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
            sendBtn.classList.toggle('active', input.value.trim().length > 0);
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
                    <button class="ai-suggestion" data-query="Explain the Pythagorean theorem">
                        <span class="suggestion-icon">📚</span>
                        <span>Explain theorems</span>
                    </button>
                    <button class="ai-suggestion" data-query="What is the derivative of sin(x)?">
                        <span class="suggestion-icon">∫</span>
                        <span>Calculus help</span>
                    </button>
                    <button class="ai-suggestion" data-query="Explain Newton's laws of motion">
                        <span class="suggestion-icon">🚀</span>
                        <span>Physics concepts</span>
                    </button>
                </div>
            </div>
        `;
        this.bindSuggestions();
    }

    bindSuggestions() {
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

        const welcome = document.querySelector('.ai-welcome');
        if (welcome) welcome.remove();

        this.addMessage(message, 'user');
        input.value = '';
        this.updateSendButton();

        this.showTyping();
        this.isProcessing = true;

        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        try {
            const response = this.generateResponse(message);
            this.removeTyping();
            this.addMessage(response, 'assistant');
            this.chatHistory.push({ role: 'user', content: message });
            this.chatHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            this.removeTyping();
            this.addSystemMessage('Error: ' + error.message, 'error');
        }

        this.isProcessing = false;
    }

    generateResponse(question) {
        const q = question.toLowerCase();

        // Try to solve math expressions
        if (this.isMathExpression(question)) {
            return this.solveMath(question);
        }

        // Quadratic equations
        if (q.includes('solve') && (q.includes('x²') || q.includes('x^2'))) {
            return this.solveQuadratic(question);
        }

        // Derivative questions
        if (q.includes('derivative')) {
            return this.explainDerivative(question);
        }

        // Pythagorean theorem
        if (q.includes('pythagorean')) {
            return `**The Pythagorean Theorem**

The Pythagorean theorem states that in a right triangle:

**a² + b² = c²**

Where:
• a and b are the lengths of the two shorter sides (legs)
• c is the length of the longest side (hypotenuse)

**Example:**
If a = 3 and b = 4, then:
c² = 3² + 4² = 9 + 16 = 25
c = √25 = 5

So a 3-4-5 triangle is a right triangle!`;
        }

        // Newton's laws
        if (q.includes('newton') && q.includes('law')) {
            return `**Newton's Three Laws of Motion**

**1st Law (Inertia):**
An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.
• Example: A ball won't move until you kick it

**2nd Law (F = ma):**
Force equals mass times acceleration.
• F = m × a
• More force = more acceleration
• More mass = less acceleration

**3rd Law (Action-Reaction):**
For every action, there is an equal and opposite reaction.
• Example: When you push a wall, the wall pushes back on you`;
        }

        // Speed/velocity/distance
        if (q.includes('speed') || q.includes('velocity') || (q.includes('distance') && q.includes('time'))) {
            return `**Speed, Distance, and Time**

The formula is: **Speed = Distance ÷ Time**

Or rearranged:
• Distance = Speed × Time
• Time = Distance ÷ Speed

**Example:**
If you travel 100 km in 2 hours:
Speed = 100 ÷ 2 = 50 km/h`;
        }

        // Area formulas
        if (q.includes('area')) {
            if (q.includes('circle')) {
                return `**Area of a Circle**\n\nFormula: A = πr²\n\nWhere r is the radius.\n\nExample: If r = 5, then A = π × 5² = 25π ≈ 78.54 square units`;
            }
            if (q.includes('triangle')) {
                return `**Area of a Triangle**\n\nFormula: A = ½ × base × height\n\nExample: If base = 6 and height = 4, then A = ½ × 6 × 4 = 12 square units`;
            }
            if (q.includes('rectangle') || q.includes('square')) {
                return `**Area of a Rectangle**\n\nFormula: A = length × width\n\nFor a square: A = side²\n\nExample: If length = 5 and width = 3, then A = 5 × 3 = 15 square units`;
            }
        }

        // Trigonometry
        if (q.includes('sin') || q.includes('cos') || q.includes('tan')) {
            return `**Trigonometric Functions**

In a right triangle:
• **sin(θ)** = Opposite / Hypotenuse
• **cos(θ)** = Adjacent / Hypotenuse
• **tan(θ)** = Opposite / Adjacent

Remember: **SOH-CAH-TOA**

Common values:
• sin(0°) = 0, sin(30°) = 0.5, sin(90°) = 1
• cos(0°) = 1, cos(60°) = 0.5, cos(90°) = 0`;
        }

        // Quadratic formula
        if (q.includes('quadratic formula')) {
            return `**The Quadratic Formula**

For ax² + bx + c = 0:

**x = (-b ± √(b² - 4ac)) / 2a**

The discriminant (b² - 4ac) tells us:
• If > 0: Two real solutions
• If = 0: One real solution
• If < 0: No real solutions`;
        }

        // E = mc²
        if (q.includes('e=mc') || q.includes('e = mc') || (q.includes('einstein') && q.includes('energy'))) {
            return `**E = mc²**

Einstein's famous equation shows that energy and mass are equivalent.

• **E** = Energy (in Joules)
• **m** = Mass (in kilograms)
• **c** = Speed of light (299,792,458 m/s)

This means a small amount of mass contains an enormous amount of energy!`;
        }

        // Default response
        return `I can help you with:

• **Math problems** - Type an expression like "5 + 3 * 2"
• **Algebra** - "Solve x² + 5x + 6 = 0"
• **Geometry** - "What is the area of a circle?"
• **Physics** - "Explain Newton's laws"
• **Calculus** - "What is the derivative of sin(x)?"

Try asking a specific question!`;
    }

    isMathExpression(str) {
        // Check if it's primarily a math expression
        const mathPattern = /^[\d\s\+\-\*\/\^\(\)\.\%]+$/;
        const cleaned = str.replace(/[=?]/g, '').trim();
        return mathPattern.test(cleaned) || /^\d+\s*[\+\-\*\/]\s*\d+/.test(str);
    }

    solveMath(expression) {
        try {
            // Clean the expression
            let expr = expression.replace(/[=?]/g, '').trim();
            expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');

            // Use math.js if available, otherwise use eval carefully
            let result;
            if (window.math) {
                result = math.evaluate(expr);
            } else {
                // Safe eval for basic math only
                if (!/^[\d\s\+\-\*\/\.\(\)\%]+$/.test(expr)) {
                    throw new Error('Invalid expression');
                }
                result = Function('"use strict"; return (' + expr + ')')();
            }

            // Format result
            if (typeof result === 'number') {
                if (Number.isInteger(result)) {
                    return `**${expression.trim()}**\n\n= **${result}**`;
                } else {
                    return `**${expression.trim()}**\n\n= **${result.toFixed(6).replace(/\.?0+$/, '')}**`;
                }
            }
            return `Result: ${result}`;
        } catch (e) {
            return `I couldn't calculate that. Try a simpler expression like "5 + 3 * 2"`;
        }
    }

    solveQuadratic(question) {
        // Try to extract coefficients from "x² + 5x + 6 = 0" format
        const match = question.match(/(-?\d*)x[²2]\s*([+-]\s*\d*)x\s*([+-]\s*\d+)/i);
        if (match) {
            let a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseInt(match[1]);
            let b = parseInt(match[2].replace(/\s/g, ''));
            let c = parseInt(match[3].replace(/\s/g, ''));

            const discriminant = b * b - 4 * a * c;

            let response = `**Solving: ${a}x² + ${b}x + ${c} = 0**\n\n`;
            response += `Using the quadratic formula: x = (-b ± √(b²-4ac)) / 2a\n\n`;
            response += `• a = ${a}, b = ${b}, c = ${c}\n`;
            response += `• Discriminant = ${b}² - 4(${a})(${c}) = ${discriminant}\n\n`;

            if (discriminant > 0) {
                const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                response += `**Solutions:**\n• x₁ = ${x1}\n• x₂ = ${x2}`;
            } else if (discriminant === 0) {
                const x = -b / (2 * a);
                response += `**Solution:** x = ${x}`;
            } else {
                response += `**No real solutions** (discriminant is negative)`;
            }
            return response;
        }
        return `To solve a quadratic equation, write it like: "Solve x² + 5x + 6 = 0"`;
    }

    explainDerivative(question) {
        const q = question.toLowerCase();

        if (q.includes('sin')) {
            return `**Derivative of sin(x)**\n\nd/dx [sin(x)] = **cos(x)**\n\nThe derivative of sine is cosine.`;
        }
        if (q.includes('cos')) {
            return `**Derivative of cos(x)**\n\nd/dx [cos(x)] = **-sin(x)**\n\nThe derivative of cosine is negative sine.`;
        }
        if (q.includes('x^2') || q.includes('x²')) {
            return `**Derivative of x²**\n\nd/dx [x²] = **2x**\n\nUsing the power rule: d/dx [xⁿ] = n·xⁿ⁻¹`;
        }
        if (q.includes('x^3') || q.includes('x³')) {
            return `**Derivative of x³**\n\nd/dx [x³] = **3x²**\n\nUsing the power rule: d/dx [xⁿ] = n·xⁿ⁻¹`;
        }
        if (q.includes('e^x') || q.includes('eˣ')) {
            return `**Derivative of eˣ**\n\nd/dx [eˣ] = **eˣ**\n\nThe exponential function is its own derivative!`;
        }
        if (q.includes('ln')) {
            return `**Derivative of ln(x)**\n\nd/dx [ln(x)] = **1/x**`;
        }

        return `**Common Derivatives:**

• d/dx [xⁿ] = n·xⁿ⁻¹ (Power Rule)
• d/dx [sin(x)] = cos(x)
• d/dx [cos(x)] = -sin(x)
• d/dx [eˣ] = eˣ
• d/dx [ln(x)] = 1/x

Ask about a specific function!`;
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
        let formatted = this.escapeHtml(text);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = formatted.replace(/•/g, '&bull;');
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
        if (typing) typing.remove();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});
