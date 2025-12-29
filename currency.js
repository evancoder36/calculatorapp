// Currency Converter Module with Live Exchange Rates

class CurrencyConverter {
    constructor() {
        // Using ExchangeRate-API free tier (no API key required for basic usage)
        this.apiBaseUrl = 'https://api.exchangerate-api.com/v4/latest/';
        this.rates = {};
        this.baseCurrency = 'USD';
        this.lastUpdated = null;
        this.isOnline = false;

        // Currency data with symbols and names
        this.currencies = {
            'USD': { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
            'EUR': { name: 'Euro', symbol: '€', flag: '🇪🇺' },
            'GBP': { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
            'JPY': { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
            'AUD': { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
            'CAD': { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
            'CHF': { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
            'CNY': { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
            'INR': { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
            'MXN': { name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
            'BRL': { name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
            'KRW': { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
            'SGD': { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
            'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
            'NOK': { name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
            'SEK': { name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
            'DKK': { name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
            'NZD': { name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
            'ZAR': { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
            'RUB': { name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
            'TRY': { name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
            'PLN': { name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
            'THB': { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
            'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
            'MYR': { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
            'PHP': { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
            'CZK': { name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
            'ILS': { name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' },
            'AED': { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
            'SAR': { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' }
        };

        this.popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

        this.init();
    }

    async init() {
        this.populateCurrencySelects();
        this.bindEvents();
        this.renderPopularCurrencies();
        await this.fetchRates();
    }

    populateCurrencySelects() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');

        if (!fromSelect || !toSelect) return;

        const options = Object.keys(this.currencies).map(code => {
            const currency = this.currencies[code];
            return `<option value="${code}">${currency.flag} ${code} - ${currency.name}</option>`;
        }).join('');

        fromSelect.innerHTML = options;
        toSelect.innerHTML = options;

        // Set defaults
        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
    }

    bindEvents() {
        const input = document.getElementById('currencyInput');
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const swapBtn = document.getElementById('swapCurrencyBtn');

        if (input) {
            input.addEventListener('input', () => this.convert());
        }

        if (fromSelect) {
            fromSelect.addEventListener('change', () => {
                this.fetchRates(fromSelect.value);
            });
        }

        if (toSelect) {
            toSelect.addEventListener('change', () => this.convert());
        }

        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapCurrencies());
        }
    }

    async fetchRates(base = 'USD') {
        this.updateStatus('loading');

        try {
            const response = await fetch(`${this.apiBaseUrl}${base}`);

            if (!response.ok) {
                throw new Error('Failed to fetch rates');
            }

            const data = await response.json();
            this.rates = data.rates;
            this.baseCurrency = base;
            this.lastUpdated = new Date();
            this.isOnline = true;

            this.updateStatus('online');
            this.updateRateDisplay();
            this.convert();

        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            this.updateStatus('offline');

            // Use fallback rates if available
            if (Object.keys(this.rates).length === 0) {
                this.useFallbackRates();
            }
        }
    }

    useFallbackRates() {
        // Fallback rates (approximate) in case API fails
        this.rates = {
            'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 149.50,
            'AUD': 1.53, 'CAD': 1.36, 'CHF': 0.88, 'CNY': 7.24,
            'INR': 83.12, 'MXN': 17.15, 'BRL': 4.97, 'KRW': 1320,
            'SGD': 1.34, 'HKD': 7.82, 'NOK': 10.65, 'SEK': 10.42,
            'DKK': 6.87, 'NZD': 1.64, 'ZAR': 18.65, 'RUB': 92.50,
            'TRY': 29.50, 'PLN': 4.02, 'THB': 35.20, 'IDR': 15650,
            'MYR': 4.72, 'PHP': 56.20, 'CZK': 22.85, 'ILS': 3.72,
            'AED': 3.67, 'SAR': 3.75
        };
        this.baseCurrency = 'USD';
        this.convert();
    }

    updateStatus(status) {
        const statusEl = document.getElementById('currencyStatus');
        if (!statusEl) return;

        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');

        switch (status) {
            case 'loading':
                dot.style.background = '#f59e0b';
                text.textContent = 'Fetching rates...';
                break;
            case 'online':
                dot.style.background = '#10b981';
                text.textContent = 'Live rates';
                break;
            case 'offline':
                dot.style.background = '#ef4444';
                text.textContent = 'Offline (cached)';
                break;
        }
    }

    convert() {
        const input = document.getElementById('currencyInput');
        const output = document.getElementById('currencyOutput');
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        const amount = parseFloat(input.value);

        if (isNaN(amount) || input.value === '') {
            output.value = '';
            return;
        }

        // Convert through base currency if needed
        let result;
        if (fromCurrency === this.baseCurrency) {
            result = amount * this.rates[toCurrency];
        } else if (toCurrency === this.baseCurrency) {
            result = amount / this.rates[fromCurrency];
        } else {
            // Convert to base first, then to target
            const inBase = amount / this.rates[fromCurrency];
            result = inBase * this.rates[toCurrency];
        }

        // Format result
        output.value = this.formatCurrency(result, toCurrency);
        this.updateRateDisplay();
    }

    formatCurrency(amount, currencyCode) {
        // Format based on currency decimal conventions
        const noDecimalCurrencies = ['JPY', 'KRW', 'IDR', 'VND'];

        if (noDecimalCurrencies.includes(currencyCode)) {
            return Math.round(amount).toLocaleString();
        }

        if (Math.abs(amount) < 0.01) {
            return amount.toExponential(4);
        }

        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });
    }

    swapCurrencies() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');
        const input = document.getElementById('currencyInput');
        const output = document.getElementById('currencyOutput');

        // Swap selections
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;

        // Swap values if there's a result
        if (output.value) {
            // Parse the output value (remove commas)
            const outputVal = parseFloat(output.value.replace(/,/g, ''));
            if (!isNaN(outputVal)) {
                input.value = outputVal;
            }
        }

        // Refetch rates for new base currency
        this.fetchRates(fromSelect.value);
    }

    updateRateDisplay() {
        const rateDisplay = document.getElementById('rateDisplay');
        const rateUpdated = document.getElementById('rateUpdated');
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        if (!rateDisplay || !rateUpdated) return;

        // Calculate the rate
        let rate;
        if (fromCurrency === this.baseCurrency) {
            rate = this.rates[toCurrency];
        } else if (toCurrency === this.baseCurrency) {
            rate = 1 / this.rates[fromCurrency];
        } else {
            rate = this.rates[toCurrency] / this.rates[fromCurrency];
        }

        if (rate) {
            const fromInfo = this.currencies[fromCurrency];
            const toInfo = this.currencies[toCurrency];

            rateDisplay.innerHTML = `
                <span class="rate-from">${fromInfo.flag} 1 ${fromCurrency}</span>
                <span class="rate-equals">=</span>
                <span class="rate-to">${toInfo.flag} ${rate.toFixed(4)} ${toCurrency}</span>
            `;
        }

        if (this.lastUpdated) {
            const timeAgo = this.getTimeAgo(this.lastUpdated);
            rateUpdated.textContent = `Updated ${timeAgo}`;
        }
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    renderPopularCurrencies() {
        const grid = document.getElementById('popularCurrencyGrid');
        if (!grid) return;

        grid.innerHTML = this.popularCurrencies.map(code => {
            const currency = this.currencies[code];
            return `
                <button class="popular-currency-btn" data-currency="${code}">
                    <span class="currency-flag">${currency.flag}</span>
                    <span class="currency-code">${code}</span>
                </button>
            `;
        }).join('');

        // Bind click events
        grid.querySelectorAll('.popular-currency-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.dataset.currency;
                const toSelect = document.getElementById('toCurrency');
                if (toSelect) {
                    toSelect.value = code;
                    this.convert();
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.currencyConverter = new CurrencyConverter();
});
