// Modern Calculator - Main Logic with History

class Calculator {
    constructor() {
        this.currentInput = '0';
        this.expression = '';
        this.result = '0';
        this.memory = 0;
        this.isRadianMode = true;
        this.lastAnswer = 0;
        this.waitingForOperand = false;
        this.history = [];
        this.maxHistory = 50;

        this.init();
    }

    init() {
        this.loadHistory();
        this.bindTabEvents();
        this.bindButtonEvents();
        this.bindKeyboardEvents();
        this.bindHistoryEvents();
        this.updateDisplay();
        this.renderHistory();
    }

    // Load history from localStorage
    loadHistory() {
        try {
            const saved = localStorage.getItem('calculatorHistory');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load history:', e);
            this.history = [];
        }
    }

    // Save history to localStorage
    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    // Add calculation to history
    addToHistory(expression, result) {
        const entry = {
            id: Date.now(),
            expression: expression,
            result: result,
            timestamp: new Date().toISOString()
        };

        this.history.unshift(entry);

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }

        this.saveHistory();
        this.renderHistory();
    }

    // Render history list
    renderHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }

        historyList.innerHTML = this.history.map((entry, index) => {
            const time = this.formatTime(entry.timestamp);
            const displayExpr = this.formatExpressionForDisplay(entry.expression);

            return `
                <div class="history-item" data-index="${index}">
                    <div class="history-expression">${this.escapeHtml(displayExpr)}</div>
                    <div class="history-result">
                        <span>= ${this.escapeHtml(entry.result)}</span>
                        <div>
                            <button class="history-use-btn" data-result="${this.escapeHtml(entry.result)}" title="Use this result">Use</button>
                            <button class="history-delete" data-id="${entry.id}" title="Delete">×</button>
                        </div>
                    </div>
                    <div class="history-time">${time}</div>
                </div>
            `;
        }).join('');

        // Bind click events for history items
        this.bindHistoryItemEvents();
    }

    // Bind events for history items
    bindHistoryItemEvents() {
        // Use result buttons
        document.querySelectorAll('.history-use-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const result = btn.dataset.result;
                this.useHistoryResult(result);
            });
        });

        // Delete buttons
        document.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                this.deleteHistoryItem(id);
            });
        });

        // Click on history item to use expression
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('history-use-btn') ||
                    e.target.classList.contains('history-delete')) {
                    return;
                }
                const index = parseInt(item.dataset.index);
                if (this.history[index]) {
                    this.useHistoryResult(this.history[index].result);
                }
            });
        });
    }

    // Use a result from history
    useHistoryResult(result) {
        this.currentInput = result;
        this.expression = result;
        this.result = result;
        this.waitingForOperand = false;
        this.updateDisplay();

        // Switch to basic tab
        const basicTab = document.querySelector('[data-tab="basic"]');
        if (basicTab) {
            basicTab.click();
        }
    }

    // Delete a history item
    deleteHistoryItem(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveHistory();
        this.renderHistory();
    }

    // Clear all history
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    // Bind history panel events
    bindHistoryEvents() {
        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }
    }

    // Format timestamp for display
    formatTime(isoString) {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diff = now - date;

            // Less than a minute
            if (diff < 60000) {
                return 'Just now';
            }
            // Less than an hour
            if (diff < 3600000) {
                const mins = Math.floor(diff / 60000);
                return `${mins} min${mins > 1 ? 's' : ''} ago`;
            }
            // Less than a day
            if (diff < 86400000) {
                const hours = Math.floor(diff / 3600000);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
            // Otherwise show date
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } catch (e) {
            return '';
        }
    }

    // Format expression for display
    formatExpressionForDisplay(expr) {
        return expr
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/pi/g, 'π')
            .replace(/sqrt/g, '√')
            .replace(/cbrt/g, '³√')
            .replace(/log10/g, 'log')
            .replace(/log2/g, 'log₂');
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Tab Navigation
    bindTabEvents() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.calculator-panel');
        const container = document.querySelector('.calculator-container');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update active panel
                panels.forEach(p => p.classList.remove('active'));
                document.getElementById(`${tab}-panel`).classList.add('active');

                // Adjust container width for different modes
                container.classList.remove('scientific-mode', 'graph-mode', 'history-mode', 'converter-mode');
                if (tab === 'scientific') {
                    container.classList.add('scientific-mode');
                } else if (tab === 'graph') {
                    container.classList.add('graph-mode');
                    if (window.graphCalculator) {
                        window.graphCalculator.initGraph();
                    }
                } else if (tab === 'history') {
                    container.classList.add('history-mode');
                    this.renderHistory(); // Refresh timestamps
                } else if (tab === 'converter') {
                    container.classList.add('converter-mode');
                }
            });
        });
    }

    // Button Events
    bindButtonEvents() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const value = btn.dataset.value;

                this.handleAction(action, value, btn);
            });
        });
    }

    // Keyboard Support
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;

            const key = e.key;

            if (/^[0-9]$/.test(key)) {
                this.handleAction('number', key);
            }
            else if (['+', '-', '*', '/'].includes(key)) {
                this.handleAction('operator', key);
            }
            else if (key === '.') {
                this.handleAction('decimal');
            }
            else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                this.handleAction('equals');
            }
            else if (key === 'Backspace') {
                this.handleAction('backspace');
            }
            else if (key === 'Escape' || key === 'c' || key === 'C') {
                this.handleAction('clear');
            }
            else if (key === '(') {
                this.handleAction('parenthesis', '(');
            }
            else if (key === ')') {
                this.handleAction('parenthesis', ')');
            }
            else if (key === '%') {
                this.handleAction('percent');
            }
        });
    }

    // Main Action Handler
    handleAction(action, value, btn) {
        switch (action) {
            case 'number':
                this.inputNumber(value);
                break;
            case 'operator':
                this.inputOperator(value);
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'clear':
                this.clear();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'percent':
                this.percent();
                break;
            case 'function':
                this.applyFunction(value);
                break;
            case 'power':
                this.applyPower(value);
                break;
            case 'powerof':
                this.inputOperator('^');
                break;
            case 'constant':
                this.inputConstant(value);
                break;
            case 'parenthesis':
                this.inputParenthesis(value);
                break;
            case 'mc':
                this.memoryClear();
                break;
            case 'mr':
                this.memoryRecall();
                break;
            case 'm+':
                this.memoryAdd();
                break;
            case 'm-':
                this.memorySubtract();
                break;
            case 'toggle-rad':
                this.toggleAngleMode(btn);
                break;
        }

        this.updateDisplay();
    }

    // Input Number
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            if (this.currentInput === '0' && num !== '0') {
                this.currentInput = num;
            } else if (this.currentInput !== '0') {
                this.currentInput += num;
            }
        }
        this.expression += num;
    }

    // Input Operator
    inputOperator(op) {
        if (this.expression === '' && this.lastAnswer !== 0) {
            this.expression = this.lastAnswer.toString();
        }

        const lastChar = this.expression.slice(-1);
        if (['+', '-', '*', '/', '^'].includes(lastChar)) {
            this.expression = this.expression.slice(0, -1);
        }

        this.expression += op;
        this.waitingForOperand = true;
    }

    // Input Decimal
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.expression += '0.';
            this.waitingForOperand = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
            this.expression += '.';
        }
    }

    // Input Parenthesis
    inputParenthesis(paren) {
        if (paren === '(') {
            const lastChar = this.expression.slice(-1);
            if (lastChar && !isNaN(lastChar) || lastChar === ')') {
                this.expression += '*';
            }
        }
        this.expression += paren;
        this.waitingForOperand = paren === '(';
    }

    // Input Constant
    inputConstant(constant) {
        let value;
        if (constant === 'pi') {
            value = 'pi';
        } else if (constant === 'e') {
            value = 'e';
        }

        const lastChar = this.expression.slice(-1);
        if (lastChar && !isNaN(lastChar) || lastChar === ')') {
            this.expression += '*';
        }

        this.expression += value;
        this.currentInput = value;
        this.waitingForOperand = false;
    }

    // Apply Function
    applyFunction(func) {
        const lastChar = this.expression.slice(-1);
        if (lastChar && (!isNaN(lastChar) || lastChar === ')')) {
            this.expression += '*';
        }

        let mathFunc = func;
        if (func === 'factorial') {
            if (this.expression !== '') {
                this.expression = `factorial(${this.expression})`;
            }
            return;
        }

        this.expression += `${mathFunc}(`;
        this.waitingForOperand = true;
    }

    // Apply Power
    applyPower(power) {
        if (this.expression === '' && this.lastAnswer !== 0) {
            this.expression = this.lastAnswer.toString();
        }
        this.expression += `^${power}`;
        this.waitingForOperand = true;
    }

    // Calculate Result
    calculate() {
        if (this.expression === '') return;

        const originalExpression = this.expression;

        try {
            let expr = this.expression;

            if (!this.isRadianMode) {
                expr = expr.replace(/sin\(/g, 'sin(pi/180*');
                expr = expr.replace(/cos\(/g, 'cos(pi/180*');
                expr = expr.replace(/tan\(/g, 'tan(pi/180*');
            }

            const result = math.evaluate(expr);

            if (typeof result === 'number') {
                if (Number.isFinite(result)) {
                    this.result = this.formatNumber(result);
                    this.lastAnswer = result;

                    // Add to history
                    this.addToHistory(originalExpression, this.result);
                } else {
                    this.result = 'Error';
                }
            } else {
                this.result = result.toString();
                this.addToHistory(originalExpression, this.result);
            }

            this.expression = '';
            this.currentInput = this.result;
            this.waitingForOperand = true;

        } catch (error) {
            this.result = 'Error';
            console.error('Calculation error:', error);
        }
    }

    // Format Number
    formatNumber(num) {
        if (Math.abs(num) < 1e-10 && num !== 0) {
            return num.toExponential(6);
        }
        if (Math.abs(num) >= 1e10) {
            return num.toExponential(6);
        }

        const rounded = Math.round(num * 1e10) / 1e10;

        if (Number.isInteger(rounded)) {
            return rounded.toString();
        }

        return rounded.toPrecision(10).replace(/\.?0+$/, '');
    }

    // Percent
    percent() {
        if (this.currentInput !== '0') {
            const value = parseFloat(this.currentInput) / 100;
            this.currentInput = value.toString();
            this.expression = this.expression.replace(/[\d.]+$/, value.toString());
        }
    }

    // Clear
    clear() {
        this.currentInput = '0';
        this.expression = '';
        this.result = '0';
        this.waitingForOperand = false;
    }

    // Backspace
    backspace() {
        if (this.expression.length > 0) {
            const funcMatch = this.expression.match(/(sin|cos|tan|asin|acos|atan|log|log10|log2|sqrt|cbrt|abs|exp|factorial)\($/);
            if (funcMatch) {
                this.expression = this.expression.slice(0, -funcMatch[0].length);
            } else {
                this.expression = this.expression.slice(0, -1);
            }

            if (this.expression === '') {
                this.currentInput = '0';
                this.result = '0';
            }
        }
    }

    // Memory Functions
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }

    memoryRecall() {
        if (this.memory !== 0) {
            const memStr = this.memory.toString();
            if (this.waitingForOperand || this.currentInput === '0') {
                this.currentInput = memStr;
                this.expression += memStr;
            } else {
                this.expression += memStr;
            }
            this.waitingForOperand = false;
        }
    }

    memoryAdd() {
        try {
            const current = this.result !== '0' ? parseFloat(this.result) : parseFloat(this.currentInput);
            if (!isNaN(current)) {
                this.memory += current;
                this.updateMemoryIndicator();
            }
        } catch (e) {
            console.error('Memory add error:', e);
        }
    }

    memorySubtract() {
        try {
            const current = this.result !== '0' ? parseFloat(this.result) : parseFloat(this.currentInput);
            if (!isNaN(current)) {
                this.memory -= current;
                this.updateMemoryIndicator();
            }
        } catch (e) {
            console.error('Memory subtract error:', e);
        }
    }

    updateMemoryIndicator() {
        const indicator = document.getElementById('memoryIndicator');
        if (this.memory !== 0) {
            indicator.textContent = `M: ${this.formatNumber(this.memory)}`;
        } else {
            indicator.textContent = '';
        }
    }

    // Toggle Radian/Degree Mode
    toggleAngleMode(btn) {
        this.isRadianMode = !this.isRadianMode;
        btn.textContent = this.isRadianMode ? 'RAD' : 'DEG';
        btn.style.background = this.isRadianMode ?
            'rgba(16, 185, 129, 0.3)' :
            'rgba(251, 191, 36, 0.5)';
    }

    // Update Display
    updateDisplay() {
        const expressionEl = document.getElementById('expression');
        const resultEl = document.getElementById('result');

        let displayExpr = this.expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/pi/g, 'π')
            .replace(/sqrt/g, '√')
            .replace(/cbrt/g, '³√')
            .replace(/log10/g, 'log')
            .replace(/log2/g, 'log₂')
            .replace(/\^/g, '^');

        expressionEl.textContent = displayExpr;
        resultEl.textContent = this.result;

        if (this.result === 'Error') {
            resultEl.classList.add('error');
        } else {
            resultEl.classList.remove('error');
        }
    }
}

// Initialize Calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
});
