// Modern Calculator - Graph Plotting Module (Stable Version)

class GraphCalculator {
    constructor() {
        this.functions = [];
        this.colors = [
            '#00d4ff', '#a855f7', '#ec4899', '#10b981',
            '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'
        ];
        this.colorIndex = 0;
        this.showGrid = true;
        this.graphInitialized = false;
        this.maxFunctions = 10;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const plotBtn = document.getElementById('plotBtn');
        const funcInput = document.getElementById('functionInput');
        const clearBtn = document.getElementById('clearGraphBtn');
        const gridBtn = document.getElementById('toggleGridBtn');

        if (plotBtn) {
            plotBtn.addEventListener('click', () => this.plotFunction());
        }

        if (funcInput) {
            funcInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.plotFunction();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearGraph());
        }

        if (gridBtn) {
            gridBtn.addEventListener('click', () => this.toggleGrid());
        }

        // Debounced range updates
        let rangeTimeout;
        ['xMin', 'xMax', 'yMin', 'yMax'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', () => {
                    clearTimeout(rangeTimeout);
                    rangeTimeout = setTimeout(() => this.updateGraphRange(), 300);
                });
            }
        });
    }

    initGraph() {
        if (this.graphInitialized) return;

        try {
            const layout = this.getLayout();
            Plotly.newPlot('plotArea', [], layout, {
                responsive: true,
                displayModeBar: true,
                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                displaylogo: false,
                scrollZoom: true
            });
            this.graphInitialized = true;
        } catch (error) {
            console.error('Failed to initialize graph:', error);
        }
    }

    getLayout() {
        const xMin = this.safeParseFloat('xMin', -10);
        const xMax = this.safeParseFloat('xMax', 10);
        const yMin = this.safeParseFloat('yMin', -10);
        const yMax = this.safeParseFloat('yMax', 10);

        return {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(10,15,30,0.6)',
            font: {
                color: '#ffffff',
                family: 'Segoe UI, sans-serif',
                size: 13
            },
            xaxis: {
                range: [xMin, xMax],
                gridcolor: this.showGrid ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0)',
                gridwidth: 1,
                zerolinecolor: 'rgba(0,212,255,0.6)',
                zerolinewidth: 2,
                tickfont: { size: 11, color: '#fff' },
                showline: true,
                linewidth: 2,
                linecolor: 'rgba(0,212,255,0.4)',
                mirror: true
            },
            yaxis: {
                range: [yMin, yMax],
                gridcolor: this.showGrid ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0)',
                gridwidth: 1,
                zerolinecolor: 'rgba(0,212,255,0.6)',
                zerolinewidth: 2,
                tickfont: { size: 11, color: '#fff' },
                showline: true,
                linewidth: 2,
                linecolor: 'rgba(0,212,255,0.4)',
                mirror: true
            },
            autosize: true,
            margin: { l: 45, r: 15, t: 15, b: 40 },
            showlegend: this.functions.length > 0,
            legend: {
                x: 0.02,
                y: 0.98,
                bgcolor: 'rgba(0,0,0,0.6)',
                bordercolor: 'rgba(255,255,255,0.2)',
                borderwidth: 1,
                font: { size: 11, color: '#fff' }
            },
            hovermode: 'closest'
        };
    }

    safeParseFloat(id, defaultVal) {
        const el = document.getElementById(id);
        if (!el) return defaultVal;
        const val = parseFloat(el.value);
        if (isNaN(val) || !isFinite(val)) return defaultVal;
        return val;
    }

    plotFunction() {
        const input = document.getElementById('functionInput');
        if (!input) return;

        const funcStr = input.value.trim();
        if (!funcStr) {
            this.showError('Please enter a function');
            return;
        }

        if (this.functions.length >= this.maxFunctions) {
            this.showError(`Max ${this.maxFunctions} functions`);
            return;
        }

        try {
            // Validate function
            const compiled = math.compile(funcStr);
            const testResult = compiled.evaluate({ x: 1 });

            if (typeof testResult !== 'number') {
                this.showError('Function must return a number');
                return;
            }

            // Generate points
            const xMin = this.safeParseFloat('xMin', -10);
            const xMax = this.safeParseFloat('xMax', 10);
            const numPoints = 200; // Reduced for stability
            const step = (xMax - xMin) / numPoints;

            const xValues = [];
            const yValues = [];

            for (let i = 0; i <= numPoints; i++) {
                const x = xMin + i * step;
                xValues.push(x);
                try {
                    const y = compiled.evaluate({ x: x });
                    if (typeof y === 'number' && isFinite(y) && Math.abs(y) < 1e10) {
                        yValues.push(y);
                    } else {
                        yValues.push(null);
                    }
                } catch {
                    yValues.push(null);
                }
            }

            const color = this.colors[this.colorIndex % this.colors.length];
            this.colorIndex++;

            const trace = {
                x: xValues,
                y: yValues,
                type: 'scattergl', // WebGL for better performance
                mode: 'lines',
                name: funcStr,
                line: { color: color, width: 2.5 },
                connectgaps: false,
                hovertemplate: `${funcStr}<br>x: %{x:.3f}<br>y: %{y:.3f}<extra></extra>`
            };

            this.functions.push({
                expression: funcStr,
                color: color
            });

            if (!this.graphInitialized) {
                this.initGraph();
            }

            Plotly.addTraces('plotArea', trace).catch(err => {
                console.error('Plot error:', err);
                this.functions.pop();
            });

            this.updateFunctionList();
            input.value = '';

        } catch (error) {
            this.showError('Invalid function');
            console.error('Parse error:', error);
        }
    }

    updateFunctionList() {
        const listEl = document.getElementById('functionListItems');
        if (!listEl) return;

        listEl.innerHTML = '';

        this.functions.forEach((func, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>
                    <span class="function-color" style="background-color: ${func.color}"></span>
                    ${this.escapeHtml(func.expression)}
                </span>
                <button class="remove-function" data-index="${index}">×</button>
            `;
            listEl.appendChild(li);
        });

        listEl.querySelectorAll('.remove-function').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeFunction(index);
            });
        });
    }

    removeFunction(index) {
        if (index >= 0 && index < this.functions.length) {
            this.functions.splice(index, 1);
            try {
                Plotly.deleteTraces('plotArea', index);
            } catch (err) {
                console.error('Remove error:', err);
            }
            this.updateFunctionList();
        }
    }

    clearGraph() {
        this.functions = [];
        this.colorIndex = 0;

        try {
            Plotly.react('plotArea', [], this.getLayout());
        } catch (err) {
            console.error('Clear error:', err);
            this.graphInitialized = false;
            this.initGraph();
        }

        this.updateFunctionList();
        const input = document.getElementById('functionInput');
        if (input) input.value = '';
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;

        const btn = document.getElementById('toggleGridBtn');
        if (btn) btn.textContent = this.showGrid ? 'Hide Grid' : 'Show Grid';

        try {
            Plotly.relayout('plotArea', {
                'xaxis.gridcolor': this.showGrid ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0)',
                'yaxis.gridcolor': this.showGrid ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0)'
            });
        } catch (err) {
            console.error('Grid toggle error:', err);
        }
    }

    updateGraphRange() {
        if (!this.graphInitialized || this.functions.length === 0) {
            try {
                Plotly.relayout('plotArea', this.getLayout());
            } catch (err) {
                console.error('Layout error:', err);
            }
            return;
        }

        this.replotAllFunctions();
    }

    replotAllFunctions() {
        const xMin = this.safeParseFloat('xMin', -10);
        const xMax = this.safeParseFloat('xMax', 10);
        const numPoints = 200;
        const step = (xMax - xMin) / numPoints;

        try {
            const traces = this.functions.map(func => {
                const compiled = math.compile(func.expression);
                const xValues = [];
                const yValues = [];

                for (let i = 0; i <= numPoints; i++) {
                    const x = xMin + i * step;
                    xValues.push(x);
                    try {
                        const y = compiled.evaluate({ x: x });
                        if (typeof y === 'number' && isFinite(y) && Math.abs(y) < 1e10) {
                            yValues.push(y);
                        } else {
                            yValues.push(null);
                        }
                    } catch {
                        yValues.push(null);
                    }
                }

                return {
                    x: xValues,
                    y: yValues,
                    type: 'scattergl',
                    mode: 'lines',
                    name: func.expression,
                    line: { color: func.color, width: 2.5 },
                    connectgaps: false
                };
            });

            Plotly.react('plotArea', traces, this.getLayout());
        } catch (err) {
            console.error('Replot error:', err);
        }
    }

    showError(message) {
        const input = document.getElementById('functionInput');
        if (!input) return;

        const originalPlaceholder = input.placeholder;
        input.style.borderColor = '#ef4444';
        input.placeholder = message;

        setTimeout(() => {
            input.style.borderColor = '';
            input.placeholder = originalPlaceholder;
        }, 2000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    window.graphCalculator = new GraphCalculator();
});
