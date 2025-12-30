// AI Math & Science Assistant Module
// Enhanced built-in math solver using math.js + educational responses

class AIAssistant {
    constructor() {
        this.chatHistory = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.bindEvents();
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

        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            input.addEventListener('input', () => this.updateSendButton());
        }
        if (clearChatBtn) clearChatBtn.addEventListener('click', () => this.clearChat());
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
                    <button class="ai-suggestion" data-query="derivative of x^3 + 2x">
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

        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

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
        const q = question.toLowerCase().trim();
        const original = question.trim();

        // Try direct math evaluation first
        const mathResult = this.tryMathEval(original);
        if (mathResult) return mathResult;

        // Solve equations (linear and quadratic)
        if (q.includes('solve') || q.includes('find x') || q.includes('what is x')) {
            return this.solveEquation(original);
        }

        // Derivatives
        if (q.includes('derivative') || q.includes('differentiate') || q.includes('d/dx')) {
            return this.computeDerivative(original);
        }

        // Integrals
        if (q.includes('integral') || q.includes('integrate') || q.includes('antiderivative')) {
            return this.explainIntegral(original);
        }

        // Factoring
        if (q.includes('factor')) {
            return this.factorExpression(original);
        }

        // Simplify
        if (q.includes('simplify')) {
            return this.simplifyExpression(original);
        }

        // Square root, cube root
        if (q.includes('square root') || q.includes('sqrt') || q.includes('√')) {
            return this.solveRoot(original, 2);
        }
        if (q.includes('cube root') || q.includes('cbrt') || q.includes('∛')) {
            return this.solveRoot(original, 3);
        }

        // Percentage calculations
        if (q.includes('percent') || q.includes('%')) {
            return this.solvePercentage(original);
        }

        // GCD / LCM
        if (q.includes('gcd') || q.includes('gcf') || q.includes('greatest common')) {
            return this.solveGCD(original);
        }
        if (q.includes('lcm') || q.includes('least common multiple')) {
            return this.solveLCM(original);
        }

        // Prime numbers
        if (q.includes('prime')) {
            return this.checkPrime(original);
        }

        // Factorial
        if (q.includes('factorial') || /\d+!/.test(original)) {
            return this.solveFactorial(original);
        }

        // Logarithms
        if (q.includes('log') || q.includes('ln')) {
            return this.solveLogarithm(original);
        }

        // Trigonometry calculations
        if (/^(sin|cos|tan|sec|csc|cot)\s*\(?\s*\d+/.test(q)) {
            return this.solveTrig(original);
        }

        // Combinations and permutations
        if (q.includes('combination') || q.includes('choose') || q.includes('nCr')) {
            return this.solveCombination(original);
        }
        if (q.includes('permutation') || q.includes('nPr')) {
            return this.solvePermutation(original);
        }

        // Statistics
        if (q.includes('mean') || q.includes('average')) {
            return this.solveMean(original);
        }
        if (q.includes('median')) {
            return this.solveMedian(original);
        }
        if (q.includes('mode')) {
            return this.solveMode(original);
        }
        if (q.includes('standard deviation') || q.includes('std dev')) {
            return this.solveStdDev(original);
        }

        // Unit conversions
        if (q.includes('convert') || q.includes(' to ') || q.includes(' in ')) {
            return this.convertUnits(original);
        }

        // Educational topics
        return this.getEducationalResponse(q, original);
    }

    tryMathEval(expr) {
        // Clean and check if it's a math expression
        let cleaned = expr.replace(/[=?]/g, '').trim();
        cleaned = cleaned.replace(/what is/gi, '').replace(/calculate/gi, '').replace(/compute/gi, '').trim();
        cleaned = cleaned.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        cleaned = cleaned.replace(/\^/g, '^'); // Keep ^ for math.js

        // Check if it looks like a math expression
        if (!/[\d\+\-\*\/\^\(\)√πe]/.test(cleaned)) return null;
        if (/^[a-zA-Z\s]+$/.test(cleaned)) return null;

        try {
            if (window.math) {
                // Replace common symbols
                cleaned = cleaned.replace(/√(\d+)/g, 'sqrt($1)');
                cleaned = cleaned.replace(/π/g, 'pi');

                const result = math.evaluate(cleaned);

                if (typeof result === 'number' && !isNaN(result)) {
                    const formatted = Number.isInteger(result) ? result :
                        parseFloat(result.toPrecision(10));
                    return `**${expr.trim()}**\n\n= **${formatted}**`;
                }
                if (result !== undefined) {
                    return `**${expr.trim()}**\n\n= **${result.toString()}**`;
                }
            }
        } catch (e) {
            // Not a valid math expression, continue to other handlers
        }
        return null;
    }

    solveEquation(question) {
        // Try to solve linear equation: ax + b = c
        let match = question.match(/(-?\d*\.?\d*)?\s*x\s*([+-]\s*\d+\.?\d*)?\s*=\s*(-?\d+\.?\d*)/i);
        if (match) {
            let a = parseFloat(match[1]) || 1;
            if (match[1] === '-') a = -1;
            let b = parseFloat((match[2] || '0').replace(/\s/g, '')) || 0;
            let c = parseFloat(match[3]);

            const x = (c - b) / a;
            return `**Solving: ${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}**\n\n` +
                   `Step 1: Subtract ${b} from both sides\n` +
                   `${a}x = ${c - b}\n\n` +
                   `Step 2: Divide by ${a}\n` +
                   `x = ${c - b} ÷ ${a}\n\n` +
                   `**x = ${x}**`;
        }

        // Quadratic equation: ax² + bx + c = 0
        match = question.match(/(-?\d*\.?\d*)?x[²2\^2]\s*([+-]\s*\d*\.?\d*)?x?\s*([+-]\s*\d+\.?\d*)?\s*=\s*0/i);
        if (match) {
            let a = parseFloat(match[1]) || 1;
            if (match[1] === '-') a = -1;
            if (match[1] === '' || match[1] === '+') a = 1;

            let bStr = (match[2] || '+0').replace(/\s/g, '');
            let b = parseFloat(bStr) || 0;
            if (bStr === '+' || bStr === '') b = 1;
            if (bStr === '-') b = -1;

            let c = parseFloat((match[3] || '0').replace(/\s/g, '')) || 0;

            const discriminant = b * b - 4 * a * c;
            let response = `**Solving: ${a}x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0**\n\n`;
            response += `Using quadratic formula: x = (-b ± √(b²-4ac)) / 2a\n\n`;
            response += `• a = ${a}, b = ${b}, c = ${c}\n`;
            response += `• Discriminant = (${b})² - 4(${a})(${c}) = ${discriminant}\n\n`;

            if (discriminant > 0) {
                const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                response += `**Solutions:**\n• x₁ = ${parseFloat(x1.toFixed(6))}\n• x₂ = ${parseFloat(x2.toFixed(6))}`;
            } else if (discriminant === 0) {
                const x = -b / (2 * a);
                response += `**Solution:** x = ${parseFloat(x.toFixed(6))}`;
            } else {
                const real = -b / (2 * a);
                const imag = Math.sqrt(-discriminant) / (2 * a);
                response += `**Complex Solutions:**\n• x₁ = ${real.toFixed(4)} + ${imag.toFixed(4)}i\n• x₂ = ${real.toFixed(4)} - ${imag.toFixed(4)}i`;
            }
            return response;
        }

        return `**Equation Solver**\n\nI can solve:\n• Linear equations: "solve 2x + 5 = 15"\n• Quadratic equations: "solve x² + 5x + 6 = 0"\n\nPlease write your equation in one of these formats.`;
    }

    computeDerivative(question) {
        const q = question.toLowerCase();
        let expr = question.replace(/derivative of|differentiate|d\/dx|\[|\]/gi, '').trim();

        // Common derivatives with steps
        const derivatives = {
            'x': { result: '1', rule: 'Constant rule' },
            'x^2': { result: '2x', rule: 'Power rule: d/dx[xⁿ] = n·xⁿ⁻¹' },
            'x^3': { result: '3x²', rule: 'Power rule: d/dx[xⁿ] = n·xⁿ⁻¹' },
            'x^4': { result: '4x³', rule: 'Power rule: d/dx[xⁿ] = n·xⁿ⁻¹' },
            'x^n': { result: 'n·xⁿ⁻¹', rule: 'Power rule' },
            'sin(x)': { result: 'cos(x)', rule: 'Trigonometric derivative' },
            'cos(x)': { result: '-sin(x)', rule: 'Trigonometric derivative' },
            'tan(x)': { result: 'sec²(x)', rule: 'Trigonometric derivative' },
            'e^x': { result: 'eˣ', rule: 'Exponential rule: derivative of eˣ is itself' },
            'ln(x)': { result: '1/x', rule: 'Logarithmic derivative' },
            'log(x)': { result: '1/(x·ln(10))', rule: 'Logarithmic derivative' },
            'sqrt(x)': { result: '1/(2√x)', rule: 'Power rule with n=1/2' },
            '1/x': { result: '-1/x²', rule: 'Power rule with n=-1' },
        };

        // Check for exact matches
        const normalized = expr.toLowerCase().replace(/\s/g, '');
        for (let [func, info] of Object.entries(derivatives)) {
            if (normalized === func.replace(/\s/g, '')) {
                return `**Derivative of ${expr}**\n\nd/dx [${expr}] = **${info.result}**\n\n*${info.rule}*`;
            }
        }

        // Try to compute with math.js
        if (window.math) {
            try {
                const derivative = math.derivative(expr, 'x');
                return `**Derivative of ${expr}**\n\nd/dx [${expr}] = **${derivative.toString()}**`;
            } catch (e) {
                // Continue to fallback
            }
        }

        // Polynomial derivative
        const polyMatch = expr.match(/(-?\d*\.?\d*)?\s*x\^?(\d+)?/g);
        if (polyMatch && polyMatch.length > 0) {
            let terms = [];
            let original = [];
            for (let term of polyMatch) {
                const m = term.match(/(-?\d*\.?\d*)?\s*x\^?(\d+)?/);
                if (m) {
                    let coef = parseFloat(m[1]) || 1;
                    if (m[1] === '-') coef = -1;
                    let pow = parseInt(m[2]) || 1;
                    original.push(`${coef}x^${pow}`);
                    if (pow > 0) {
                        let newCoef = coef * pow;
                        let newPow = pow - 1;
                        if (newPow === 0) terms.push(`${newCoef}`);
                        else if (newPow === 1) terms.push(`${newCoef}x`);
                        else terms.push(`${newCoef}x^${newPow}`);
                    }
                }
            }
            if (terms.length > 0) {
                return `**Derivative of ${expr}**\n\nUsing power rule: d/dx[xⁿ] = n·xⁿ⁻¹\n\nd/dx [${expr}] = **${terms.join(' + ').replace(/\+ -/g, '- ')}**`;
            }
        }

        return `**Common Derivatives:**\n\n` +
               `• d/dx [xⁿ] = n·xⁿ⁻¹\n` +
               `• d/dx [sin(x)] = cos(x)\n` +
               `• d/dx [cos(x)] = -sin(x)\n` +
               `• d/dx [tan(x)] = sec²(x)\n` +
               `• d/dx [eˣ] = eˣ\n` +
               `• d/dx [ln(x)] = 1/x\n` +
               `• d/dx [aˣ] = aˣ·ln(a)\n\n` +
               `Try: "derivative of x^3 + 2x"`;
    }

    explainIntegral(question) {
        const q = question.toLowerCase();
        let expr = question.replace(/integral of|integrate|antiderivative of/gi, '').trim();

        const integrals = {
            'x': 'x²/2 + C',
            'x^2': 'x³/3 + C',
            'x^3': 'x⁴/4 + C',
            'x^n': 'xⁿ⁺¹/(n+1) + C (n ≠ -1)',
            '1/x': 'ln|x| + C',
            'sin(x)': '-cos(x) + C',
            'cos(x)': 'sin(x) + C',
            'e^x': 'eˣ + C',
            'sec^2(x)': 'tan(x) + C',
            '1': 'x + C',
        };

        const normalized = expr.toLowerCase().replace(/\s/g, '');
        for (let [func, result] of Object.entries(integrals)) {
            if (normalized === func.replace(/\s/g, '')) {
                return `**Integral of ${expr}**\n\n∫ ${expr} dx = **${result}**`;
            }
        }

        return `**Common Integrals:**\n\n` +
               `• ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C\n` +
               `• ∫ 1/x dx = ln|x| + C\n` +
               `• ∫ sin(x) dx = -cos(x) + C\n` +
               `• ∫ cos(x) dx = sin(x) + C\n` +
               `• ∫ eˣ dx = eˣ + C\n` +
               `• ∫ sec²(x) dx = tan(x) + C\n\n` +
               `Try: "integral of x^2"`;
    }

    factorExpression(question) {
        // Try to factor quadratics
        const match = question.match(/x[²2\^2]\s*([+-]\s*\d+)x\s*([+-]\s*\d+)/i);
        if (match) {
            const b = parseInt(match[1].replace(/\s/g, ''));
            const c = parseInt(match[2].replace(/\s/g, ''));

            // Find factors of c that add to b
            for (let i = -Math.abs(c); i <= Math.abs(c); i++) {
                if (i !== 0 && c % i === 0) {
                    const j = c / i;
                    if (i + j === b) {
                        return `**Factoring: x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}**\n\n` +
                               `Find two numbers that:\n` +
                               `• Multiply to ${c}\n` +
                               `• Add to ${b}\n\n` +
                               `Those numbers are ${i} and ${j}\n\n` +
                               `**= (x ${i >= 0 ? '+' : ''}${i})(x ${j >= 0 ? '+' : ''}${j})**`;
                    }
                }
            }
            return `**x² ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c}** cannot be factored with integers.`;
        }
        return `**Factoring**\n\nTo factor a quadratic like x² + 5x + 6:\n1. Find two numbers that multiply to 6 and add to 5\n2. Those are 2 and 3\n3. Answer: (x + 2)(x + 3)\n\nTry: "factor x² + 5x + 6"`;
    }

    simplifyExpression(question) {
        let expr = question.replace(/simplify/gi, '').trim();
        if (window.math) {
            try {
                const simplified = math.simplify(expr);
                return `**Simplify: ${expr}**\n\n= **${simplified.toString()}**`;
            } catch (e) {
                return `Could not simplify "${expr}". Check your expression.`;
            }
        }
        return `Simplification requires the math.js library.`;
    }

    solveRoot(question, n) {
        const match = question.match(/(\d+\.?\d*)/);
        if (match) {
            const num = parseFloat(match[1]);
            const result = Math.pow(num, 1/n);
            const symbol = n === 2 ? '√' : '∛';
            return `**${symbol}${num}**\n\n= **${parseFloat(result.toFixed(10))}**`;
        }
        return `Please provide a number. Example: "square root of 144"`;
    }

    solvePercentage(question) {
        // X% of Y
        let match = question.match(/(\d+\.?\d*)\s*%\s*of\s*(\d+\.?\d*)/i);
        if (match) {
            const percent = parseFloat(match[1]);
            const num = parseFloat(match[2]);
            const result = (percent / 100) * num;
            return `**${percent}% of ${num}**\n\n= ${percent}/100 × ${num}\n= **${result}**`;
        }

        // What percent is X of Y
        match = question.match(/what\s*percent.*?(\d+\.?\d*).*?of\s*(\d+\.?\d*)/i);
        if (match) {
            const part = parseFloat(match[1]);
            const whole = parseFloat(match[2]);
            const result = (part / whole) * 100;
            return `**What percent is ${part} of ${whole}?**\n\n= (${part} ÷ ${whole}) × 100\n= **${parseFloat(result.toFixed(4))}%**`;
        }

        return `**Percentage Calculations**\n\n• "25% of 80" → 20\n• "What percent is 20 of 80" → 25%\n\nTry one of these formats!`;
    }

    solveGCD(question) {
        const numbers = question.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
            const nums = numbers.map(n => parseInt(n));
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            let result = nums[0];
            for (let i = 1; i < nums.length; i++) {
                result = gcd(result, nums[i]);
            }
            return `**GCD of ${nums.join(', ')}**\n\n= **${result}**`;
        }
        return `Please provide at least two numbers. Example: "GCD of 24 and 36"`;
    }

    solveLCM(question) {
        const numbers = question.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
            const nums = numbers.map(n => parseInt(n));
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const lcm = (a, b) => (a * b) / gcd(a, b);
            let result = nums[0];
            for (let i = 1; i < nums.length; i++) {
                result = lcm(result, nums[i]);
            }
            return `**LCM of ${nums.join(', ')}**\n\n= **${result}**`;
        }
        return `Please provide at least two numbers. Example: "LCM of 4 and 6"`;
    }

    checkPrime(question) {
        const match = question.match(/(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            if (num < 2) return `**${num}** is not a prime number.`;
            for (let i = 2; i <= Math.sqrt(num); i++) {
                if (num % i === 0) {
                    return `**${num}** is **not prime**.\n\nIt's divisible by ${i} (${num} = ${i} × ${num/i})`;
                }
            }
            return `**${num}** is a **prime number**!\n\nIt's only divisible by 1 and itself.`;
        }
        return `Please provide a number. Example: "Is 17 prime?"`;
    }

    solveFactorial(question) {
        const match = question.match(/(\d+)\s*!/);
        if (match) {
            const num = parseInt(match[1]);
            if (num > 170) return `${num}! is too large to calculate (exceeds JavaScript limits).`;
            let result = 1;
            let steps = [];
            for (let i = num; i > 1; i--) {
                result *= i;
                if (num <= 10) steps.push(i);
            }
            return `**${num}!** = ${steps.length > 0 ? steps.join(' × ') + ' = ' : ''}**${result}**`;
        }
        const match2 = question.match(/factorial\s*(?:of)?\s*(\d+)/i);
        if (match2) {
            const num = parseInt(match2[1]);
            if (num > 170) return `${num}! is too large to calculate.`;
            let result = 1;
            for (let i = num; i > 1; i--) result *= i;
            return `**${num}!** = **${result}**`;
        }
        return `Use format: "5!" or "factorial of 5"`;
    }

    solveLogarithm(question) {
        // log base b of x
        let match = question.match(/log\s*(?:base)?\s*(\d+)?\s*(?:of)?\s*(\d+\.?\d*)/i);
        if (match) {
            const base = parseFloat(match[1]) || 10;
            const x = parseFloat(match[2]);
            const result = Math.log(x) / Math.log(base);
            return `**log${base === 10 ? '' : '₍' + base + '₎'}(${x})**\n\n= **${parseFloat(result.toFixed(10))}**`;
        }
        // natural log
        match = question.match(/ln\s*\(?\s*(\d+\.?\d*)/i);
        if (match) {
            const x = parseFloat(match[1]);
            const result = Math.log(x);
            return `**ln(${x})**\n\n= **${parseFloat(result.toFixed(10))}**`;
        }
        return `**Logarithm Examples:**\n• "log 100" → 2\n• "log base 2 of 8" → 3\n• "ln 10" → 2.303`;
    }

    solveTrig(question) {
        const match = question.match(/(sin|cos|tan|sec|csc|cot)\s*\(?\s*(\d+\.?\d*)\s*(deg|rad|°)?/i);
        if (match) {
            const func = match[1].toLowerCase();
            let angle = parseFloat(match[2]);
            const unit = match[3] || 'deg';

            // Convert to radians if in degrees
            const radians = unit.toLowerCase() === 'rad' ? angle : angle * Math.PI / 180;

            let result;
            switch(func) {
                case 'sin': result = Math.sin(radians); break;
                case 'cos': result = Math.cos(radians); break;
                case 'tan': result = Math.tan(radians); break;
                case 'sec': result = 1 / Math.cos(radians); break;
                case 'csc': result = 1 / Math.sin(radians); break;
                case 'cot': result = 1 / Math.tan(radians); break;
            }

            return `**${func}(${angle}${unit === 'rad' ? ' rad' : '°'})**\n\n= **${parseFloat(result.toFixed(10))}**`;
        }
        return `**Trigonometry Examples:**\n• "sin 30" → 0.5\n• "cos 60" → 0.5\n• "tan 45" → 1`;
    }

    solveCombination(question) {
        const match = question.match(/(\d+)\s*(?:choose|C|nCr)\s*(\d+)/i);
        if (match) {
            const n = parseInt(match[1]);
            const r = parseInt(match[2]);
            const factorial = (x) => x <= 1 ? 1 : x * factorial(x - 1);
            const result = factorial(n) / (factorial(r) * factorial(n - r));
            return `**C(${n}, ${r})** = ${n}! / (${r}! × ${n-r}!)\n\n= **${result}**`;
        }
        return `**Combinations:** "10 choose 3" or "10 C 3"`;
    }

    solvePermutation(question) {
        const match = question.match(/(\d+)\s*(?:P|nPr)\s*(\d+)/i);
        if (match) {
            const n = parseInt(match[1]);
            const r = parseInt(match[2]);
            const factorial = (x) => x <= 1 ? 1 : x * factorial(x - 1);
            const result = factorial(n) / factorial(n - r);
            return `**P(${n}, ${r})** = ${n}! / ${n-r}!\n\n= **${result}**`;
        }
        return `**Permutations:** "10 P 3"`;
    }

    solveMean(question) {
        const numbers = question.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
            const nums = numbers.map(n => parseFloat(n));
            const sum = nums.reduce((a, b) => a + b, 0);
            const mean = sum / nums.length;
            return `**Mean of [${nums.join(', ')}]**\n\n= (${nums.join(' + ')}) / ${nums.length}\n= **${parseFloat(mean.toFixed(6))}**`;
        }
        return `Provide numbers: "mean of 5, 10, 15, 20"`;
    }

    solveMedian(question) {
        const numbers = question.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
            const nums = numbers.map(n => parseFloat(n)).sort((a, b) => a - b);
            const mid = Math.floor(nums.length / 2);
            const median = nums.length % 2 === 0 ? (nums[mid-1] + nums[mid]) / 2 : nums[mid];
            return `**Median of [${nums.join(', ')}]**\n\nSorted: [${nums.join(', ')}]\n\n= **${median}**`;
        }
        return `Provide numbers: "median of 3, 1, 4, 1, 5"`;
    }

    solveMode(question) {
        const numbers = question.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
            const nums = numbers.map(n => parseFloat(n));
            const freq = {};
            nums.forEach(n => freq[n] = (freq[n] || 0) + 1);
            const maxFreq = Math.max(...Object.values(freq));
            const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(n => parseFloat(n));
            if (maxFreq === 1) return `**No mode** - all values appear once.`;
            return `**Mode of [${nums.join(', ')}]**\n\n= **${modes.join(', ')}** (appears ${maxFreq} times)`;
        }
        return `Provide numbers: "mode of 1, 2, 2, 3, 3, 3"`;
    }

    solveStdDev(question) {
        const numbers = question.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
            const nums = numbers.map(n => parseFloat(n));
            const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
            const variance = nums.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / nums.length;
            const stdDev = Math.sqrt(variance);
            return `**Standard Deviation of [${nums.join(', ')}]**\n\nMean = ${mean.toFixed(4)}\nVariance = ${variance.toFixed(4)}\n\n**σ = ${stdDev.toFixed(6)}**`;
        }
        return `Provide numbers: "standard deviation of 2, 4, 6, 8"`;
    }

    convertUnits(question) {
        const conversions = {
            // Length
            'km to miles': (x) => ({ result: x * 0.621371, unit: 'miles' }),
            'miles to km': (x) => ({ result: x * 1.60934, unit: 'km' }),
            'meters to feet': (x) => ({ result: x * 3.28084, unit: 'feet' }),
            'feet to meters': (x) => ({ result: x * 0.3048, unit: 'meters' }),
            'inches to cm': (x) => ({ result: x * 2.54, unit: 'cm' }),
            'cm to inches': (x) => ({ result: x / 2.54, unit: 'inches' }),
            // Temperature
            'celsius to fahrenheit': (x) => ({ result: (x * 9/5) + 32, unit: '°F' }),
            'fahrenheit to celsius': (x) => ({ result: (x - 32) * 5/9, unit: '°C' }),
            'celsius to kelvin': (x) => ({ result: x + 273.15, unit: 'K' }),
            'kelvin to celsius': (x) => ({ result: x - 273.15, unit: '°C' }),
            // Weight
            'kg to pounds': (x) => ({ result: x * 2.20462, unit: 'lbs' }),
            'pounds to kg': (x) => ({ result: x * 0.453592, unit: 'kg' }),
            'kg to lbs': (x) => ({ result: x * 2.20462, unit: 'lbs' }),
            'lbs to kg': (x) => ({ result: x * 0.453592, unit: 'kg' }),
            // Degrees/Radians
            'degrees to radians': (x) => ({ result: x * Math.PI / 180, unit: 'rad' }),
            'radians to degrees': (x) => ({ result: x * 180 / Math.PI, unit: '°' }),
        };

        const q = question.toLowerCase();
        const numMatch = question.match(/(-?\d+\.?\d*)/);
        const value = numMatch ? parseFloat(numMatch[1]) : null;

        for (let [conv, fn] of Object.entries(conversions)) {
            if (q.includes(conv.split(' to ')[0]) && q.includes(conv.split(' to ')[1])) {
                if (value !== null) {
                    const { result, unit } = fn(value);
                    return `**${value} ${conv}**\n\n= **${parseFloat(result.toFixed(6))} ${unit}**`;
                }
            }
        }

        return `**Unit Conversions:**\n• "100 km to miles"\n• "32 fahrenheit to celsius"\n• "10 kg to pounds"\n• "180 degrees to radians"`;
    }

    getEducationalResponse(q, original) {
        // Pythagorean theorem
        if (q.includes('pythagorean')) {
            return `**The Pythagorean Theorem**\n\nIn a right triangle: **a² + b² = c²**\n\nWhere:\n• a and b are the legs\n• c is the hypotenuse\n\n**Example:** If a = 3, b = 4\nc² = 9 + 16 = 25\nc = 5`;
        }

        // Newton's laws
        if (q.includes('newton') && q.includes('law')) {
            return `**Newton's Laws of Motion**\n\n**1st Law (Inertia):**\nAn object stays at rest or in motion unless acted upon by a force.\n\n**2nd Law (F = ma):**\nForce = mass × acceleration\n\n**3rd Law (Action-Reaction):**\nFor every action, there's an equal and opposite reaction.`;
        }

        // Quadratic formula
        if (q.includes('quadratic formula')) {
            return `**The Quadratic Formula**\n\nFor ax² + bx + c = 0:\n\n**x = (-b ± √(b² - 4ac)) / 2a**\n\nThe discriminant (b² - 4ac):\n• > 0: Two real solutions\n• = 0: One real solution\n• < 0: Two complex solutions`;
        }

        // Circle formulas
        if (q.includes('circle') && (q.includes('area') || q.includes('circumference'))) {
            return `**Circle Formulas**\n\n• **Area:** A = πr²\n• **Circumference:** C = 2πr\n• **Diameter:** d = 2r\n\nWhere r = radius`;
        }

        // Trigonometry
        if (q.includes('trigonometry') || q.includes('sohcahtoa')) {
            return `**Trigonometry Basics**\n\n**SOH-CAH-TOA:**\n• sin(θ) = Opposite / Hypotenuse\n• cos(θ) = Adjacent / Hypotenuse\n• tan(θ) = Opposite / Adjacent\n\n**Common Values:**\n• sin(30°) = 0.5, cos(30°) = √3/2\n• sin(45°) = √2/2, cos(45°) = √2/2\n• sin(60°) = √3/2, cos(60°) = 0.5`;
        }

        // E = mc²
        if (q.includes('e=mc') || q.includes('e = mc') || q.includes('mass energy')) {
            return `**E = mc²**\n\nEinstein's mass-energy equivalence:\n\n• **E** = Energy (Joules)\n• **m** = Mass (kg)\n• **c** = Speed of light (3×10⁸ m/s)\n\nA small mass contains enormous energy!`;
        }

        // Ohm's Law
        if (q.includes('ohm')) {
            return `**Ohm's Law**\n\n**V = I × R**\n\n• V = Voltage (Volts)\n• I = Current (Amperes)\n• R = Resistance (Ohms)\n\nRearranged:\n• I = V / R\n• R = V / I`;
        }

        // Speed, distance, time
        if (q.includes('speed') || q.includes('velocity') || (q.includes('distance') && q.includes('time'))) {
            return `**Speed, Distance, Time**\n\n**Speed = Distance / Time**\n\nRearranged:\n• Distance = Speed × Time\n• Time = Distance / Speed\n\n**Example:** 100 km in 2 hours = 50 km/h`;
        }

        // Area formulas
        if (q.includes('area')) {
            return `**Area Formulas**\n\n• **Rectangle:** A = length × width\n• **Triangle:** A = ½ × base × height\n• **Circle:** A = πr²\n• **Trapezoid:** A = ½(a + b) × h\n• **Square:** A = side²`;
        }

        // Volume formulas
        if (q.includes('volume')) {
            return `**Volume Formulas**\n\n• **Cube:** V = s³\n• **Rectangular prism:** V = l × w × h\n• **Cylinder:** V = πr²h\n• **Sphere:** V = (4/3)πr³\n• **Cone:** V = (1/3)πr²h`;
        }

        // Slope formula
        if (q.includes('slope')) {
            return `**Slope Formula**\n\n**m = (y₂ - y₁) / (x₂ - x₁)**\n\nSlope-intercept form: **y = mx + b**\n\nWhere:\n• m = slope\n• b = y-intercept`;
        }

        // Distance formula
        if (q.includes('distance formula') || q.includes('distance between')) {
            return `**Distance Formula**\n\nBetween points (x₁, y₁) and (x₂, y₂):\n\n**d = √[(x₂-x₁)² + (y₂-y₁)²]**`;
        }

        // Midpoint
        if (q.includes('midpoint')) {
            return `**Midpoint Formula**\n\nBetween points (x₁, y₁) and (x₂, y₂):\n\n**M = ((x₁+x₂)/2, (y₁+y₂)/2)**`;
        }

        // Default help
        return `**Evan AI - Math & Science Assistant**\n\nI can help with:\n\n` +
               `**Calculations:**\n• Math: "5^3 + sqrt(16)"\n• Percentages: "25% of 80"\n• Roots: "square root of 144"\n\n` +
               `**Algebra:**\n• "Solve 2x + 5 = 15"\n• "Solve x² + 5x + 6 = 0"\n• "Factor x² + 7x + 12"\n\n` +
               `**Calculus:**\n• "Derivative of x^3 + 2x"\n• "Integral of sin(x)"\n\n` +
               `**Statistics:**\n• "Mean of 5, 10, 15, 20"\n• "Standard deviation of 2, 4, 6, 8"\n\n` +
               `**Science:**\n• "Explain Newton's laws"\n• "What is E=mc²?"\n\n` +
               `Try asking a question!`;
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
                    <span></span><span></span><span></span>
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

document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});
