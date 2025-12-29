// Unit Converter Module

class UnitConverter {
    constructor() {
        this.currentCategory = 'length';

        // Unit definitions with conversion factors to base unit
        this.units = {
            length: {
                base: 'meter',
                units: {
                    'meter': { name: 'Meters (m)', factor: 1 },
                    'kilometer': { name: 'Kilometers (km)', factor: 1000 },
                    'centimeter': { name: 'Centimeters (cm)', factor: 0.01 },
                    'millimeter': { name: 'Millimeters (mm)', factor: 0.001 },
                    'mile': { name: 'Miles (mi)', factor: 1609.344 },
                    'yard': { name: 'Yards (yd)', factor: 0.9144 },
                    'foot': { name: 'Feet (ft)', factor: 0.3048 },
                    'inch': { name: 'Inches (in)', factor: 0.0254 },
                    'nautical_mile': { name: 'Nautical Miles', factor: 1852 }
                }
            },
            weight: {
                base: 'kilogram',
                units: {
                    'kilogram': { name: 'Kilograms (kg)', factor: 1 },
                    'gram': { name: 'Grams (g)', factor: 0.001 },
                    'milligram': { name: 'Milligrams (mg)', factor: 0.000001 },
                    'pound': { name: 'Pounds (lb)', factor: 0.453592 },
                    'ounce': { name: 'Ounces (oz)', factor: 0.0283495 },
                    'ton': { name: 'Metric Tons', factor: 1000 },
                    'stone': { name: 'Stones', factor: 6.35029 }
                }
            },
            temperature: {
                base: 'celsius',
                units: {
                    'celsius': { name: 'Celsius (°C)', factor: 1 },
                    'fahrenheit': { name: 'Fahrenheit (°F)', factor: 1 },
                    'kelvin': { name: 'Kelvin (K)', factor: 1 }
                },
                special: true
            },
            volume: {
                base: 'liter',
                units: {
                    'liter': { name: 'Liters (L)', factor: 1 },
                    'milliliter': { name: 'Milliliters (mL)', factor: 0.001 },
                    'gallon_us': { name: 'Gallons (US)', factor: 3.78541 },
                    'gallon_uk': { name: 'Gallons (UK)', factor: 4.54609 },
                    'quart': { name: 'Quarts (US)', factor: 0.946353 },
                    'pint': { name: 'Pints (US)', factor: 0.473176 },
                    'cup': { name: 'Cups (US)', factor: 0.236588 },
                    'fluid_oz': { name: 'Fluid Oz (US)', factor: 0.0295735 },
                    'cubic_meter': { name: 'Cubic Meters', factor: 1000 }
                }
            },
            area: {
                base: 'sqmeter',
                units: {
                    'sqmeter': { name: 'Square Meters (m²)', factor: 1 },
                    'sqkilometer': { name: 'Square Km (km²)', factor: 1000000 },
                    'sqcentimeter': { name: 'Square Cm (cm²)', factor: 0.0001 },
                    'sqfoot': { name: 'Square Feet (ft²)', factor: 0.092903 },
                    'sqyard': { name: 'Square Yards (yd²)', factor: 0.836127 },
                    'sqinch': { name: 'Square Inches (in²)', factor: 0.00064516 },
                    'sqmile': { name: 'Square Miles (mi²)', factor: 2589988.11 },
                    'acre': { name: 'Acres', factor: 4046.86 },
                    'hectare': { name: 'Hectares (ha)', factor: 10000 }
                }
            },
            speed: {
                base: 'mps',
                units: {
                    'mps': { name: 'Meters/sec (m/s)', factor: 1 },
                    'kmph': { name: 'Km/hour (km/h)', factor: 0.277778 },
                    'mph': { name: 'Miles/hour (mph)', factor: 0.44704 },
                    'knot': { name: 'Knots', factor: 0.514444 },
                    'fps': { name: 'Feet/sec (ft/s)', factor: 0.3048 }
                }
            },
            time: {
                base: 'second',
                units: {
                    'second': { name: 'Seconds (s)', factor: 1 },
                    'millisecond': { name: 'Milliseconds (ms)', factor: 0.001 },
                    'minute': { name: 'Minutes (min)', factor: 60 },
                    'hour': { name: 'Hours (hr)', factor: 3600 },
                    'day': { name: 'Days', factor: 86400 },
                    'week': { name: 'Weeks', factor: 604800 },
                    'month': { name: 'Months (30d)', factor: 2592000 },
                    'year': { name: 'Years (365d)', factor: 31536000 }
                }
            },
            data: {
                base: 'byte',
                units: {
                    'bit': { name: 'Bits (b)', factor: 0.125 },
                    'byte': { name: 'Bytes (B)', factor: 1 },
                    'kilobyte': { name: 'Kilobytes (KB)', factor: 1024 },
                    'megabyte': { name: 'Megabytes (MB)', factor: 1048576 },
                    'gigabyte': { name: 'Gigabytes (GB)', factor: 1073741824 },
                    'terabyte': { name: 'Terabytes (TB)', factor: 1099511627776 },
                    'petabyte': { name: 'Petabytes (PB)', factor: 1125899906842624 }
                }
            }
        };

        this.init();
    }

    init() {
        this.bindCategoryEvents();
        this.bindConverterEvents();
        this.loadCategory('length');
    }

    bindCategoryEvents() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;

                // Update active button
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.loadCategory(category);
            });
        });
    }

    bindConverterEvents() {
        const input = document.getElementById('converterInput');
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        const swapBtn = document.getElementById('swapUnitsBtn');

        if (input) {
            input.addEventListener('input', () => this.convert());
        }

        if (fromUnit) {
            fromUnit.addEventListener('change', () => this.convert());
        }

        if (toUnit) {
            toUnit.addEventListener('change', () => this.convert());
        }

        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapUnits());
        }
    }

    loadCategory(category) {
        this.currentCategory = category;
        const categoryData = this.units[category];

        if (!categoryData) return;

        const fromSelect = document.getElementById('fromUnit');
        const toSelect = document.getElementById('toUnit');

        if (!fromSelect || !toSelect) return;

        // Clear and populate options
        const unitKeys = Object.keys(categoryData.units);

        fromSelect.innerHTML = unitKeys.map(key =>
            `<option value="${key}">${categoryData.units[key].name}</option>`
        ).join('');

        toSelect.innerHTML = unitKeys.map(key =>
            `<option value="${key}">${categoryData.units[key].name}</option>`
        ).join('');

        // Set default selections (first two different units)
        if (unitKeys.length >= 2) {
            fromSelect.value = unitKeys[0];
            toSelect.value = unitKeys[1];
        }

        // Clear input/output
        document.getElementById('converterInput').value = '';
        document.getElementById('converterOutput').value = '';

        // Update reference
        this.updateReference();
    }

    convert() {
        const input = document.getElementById('converterInput');
        const output = document.getElementById('converterOutput');
        const fromUnit = document.getElementById('fromUnit').value;
        const toUnit = document.getElementById('toUnit').value;

        const value = parseFloat(input.value);

        if (isNaN(value) || input.value === '') {
            output.value = '';
            return;
        }

        let result;

        if (this.currentCategory === 'temperature') {
            result = this.convertTemperature(value, fromUnit, toUnit);
        } else {
            result = this.convertStandard(value, fromUnit, toUnit);
        }

        // Format result
        if (Math.abs(result) < 0.000001 || Math.abs(result) >= 1000000000) {
            output.value = result.toExponential(6);
        } else {
            output.value = this.formatNumber(result);
        }
    }

    convertStandard(value, fromUnit, toUnit) {
        const categoryData = this.units[this.currentCategory];
        const fromFactor = categoryData.units[fromUnit].factor;
        const toFactor = categoryData.units[toUnit].factor;

        // Convert to base unit, then to target unit
        const baseValue = value * fromFactor;
        return baseValue / toFactor;
    }

    convertTemperature(value, fromUnit, toUnit) {
        // First convert to Celsius
        let celsius;
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5 / 9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            default:
                celsius = value;
        }

        // Then convert from Celsius to target
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return (celsius * 9 / 5) + 32;
            case 'kelvin':
                return celsius + 273.15;
            default:
                return celsius;
        }
    }

    swapUnits() {
        const fromSelect = document.getElementById('fromUnit');
        const toSelect = document.getElementById('toUnit');
        const input = document.getElementById('converterInput');
        const output = document.getElementById('converterOutput');

        // Swap unit selections
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;

        // Swap values if there's a result
        if (output.value) {
            input.value = output.value;
            this.convert();
        }
    }

    formatNumber(num) {
        // Round to avoid floating point errors
        const rounded = Math.round(num * 1e10) / 1e10;

        if (Number.isInteger(rounded)) {
            return rounded.toString();
        }

        // Format with appropriate decimal places
        const str = rounded.toString();
        if (str.includes('.')) {
            // Remove trailing zeros after decimal
            return parseFloat(rounded.toPrecision(10)).toString();
        }
        return str;
    }

    updateReference() {
        const referenceList = document.getElementById('referenceList');
        if (!referenceList) return;

        const categoryData = this.units[this.currentCategory];
        const baseUnit = categoryData.base;
        const baseInfo = categoryData.units[baseUnit];

        // Generate reference items
        const references = [];

        if (this.currentCategory === 'temperature') {
            references.push(
                { text: '0°C', value: '32°F = 273.15K' },
                { text: '100°C', value: '212°F = 373.15K' },
                { text: '-40°C', value: '-40°F = 233.15K' },
                { text: '37°C', value: '98.6°F (body temp)' }
            );
        } else {
            // Show conversions from 1 base unit
            Object.keys(categoryData.units).forEach(key => {
                if (key !== baseUnit) {
                    const unit = categoryData.units[key];
                    const converted = 1 / unit.factor * categoryData.units[baseUnit].factor;
                    const formatted = this.formatReferenceValue(converted);
                    const shortName = unit.name.split(' ')[0];
                    const baseShortName = baseInfo.name.split(' ')[0];
                    references.push({
                        text: `1 ${shortName}`,
                        value: `${formatted} ${baseShortName}`
                    });
                }
            });
        }

        referenceList.innerHTML = references.slice(0, 6).map(ref =>
            `<div class="reference-item"><span>${ref.text}</span> = ${ref.value}</div>`
        ).join('');
    }

    formatReferenceValue(num) {
        if (Math.abs(num) < 0.001 || Math.abs(num) >= 100000) {
            return num.toExponential(2);
        }
        return parseFloat(num.toPrecision(4)).toString();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.unitConverter = new UnitConverter();
});
