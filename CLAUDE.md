# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern Calculator App - a feature-rich calculator web application with glassmorphism UI. Pure client-side vanilla JavaScript, no build tools or frameworks.

**Live Demo:** https://evancoder36.github.io/calculatorapp/

## Development

**No build process required.** Open `index.html` directly in a browser.

For deployment, use any static hosting (GitHub Pages, Netlify, Vercel).

## Architecture

### Module Structure

Each feature is a self-contained class in its own file:

| File | Class | Purpose |
|------|-------|---------|
| `calculator.js` | `Calculator` | Core calculation engine, history, keyboard handling |
| `graphing.js` | `GraphCalculator` | Function plotting with Plotly.js |
| `converter.js` | `UnitConverter` | Unit conversion (8 categories) |
| `currency.js` | `CurrencyConverter` | Live currency exchange rates |
| `ai-assistant.js` | `AIAssistant` | Math tutor using Gemini API |
| `styles.css` | - | All styling, glassmorphism effects, animations |
| `index.html` | - | Structure and tab navigation |

### Initialization Pattern

All classes instantiate on DOMContentLoaded and attach to `window`:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
    window.graphCalculator = new GraphCalculator();
    // etc.
});
```

### External Dependencies (CDN)

- **Math.js** (v11.11.0) - Expression evaluation via `math.compile(expr).evaluate()`
- **Plotly.js** (v2.27.0) - Interactive graphs

### External APIs

- **ExchangeRate-API** - Currency rates (has offline fallback)
- **Google Gemini API** - AI assistant (API key stored in localStorage)

## Key Implementation Details

### Calculator

- Uses Math.js for all expression evaluation
- History stored in localStorage (max 50 entries)
- Keyboard support: 0-9, operators, Enter=equals, Backspace, C/Escape=clear
- RAD/DEG mode for trigonometric functions

### Unit Converter

- Temperature has special handling (Celsius/Fahrenheit/Kelvin formulas)
- Other categories use base unit conversion factors

### Currency Converter

- Caches rates from ExchangeRate-API
- Falls back to hardcoded rates when offline
- Status indicator shows online/offline state

### AI Assistant

- Gemini 2.0 Flash model
- Chat history (last 10 messages) maintained for context
- System prompt constrains responses to math/science education
- Markdown formatting in responses (bold, italic, code blocks)

### Styling

CSS custom properties define the theme:
- Colors: `#00d4ff` (cyan), `#a855f7` (purple), `#ec4899` (pink), `#10b981` (green)
- Glassmorphism via `backdrop-filter: blur()` with frosted glass panels
- Animated floating background shapes

## Adding New Features

**New calculator function:** Add button in `index.html`, handle click in `Calculator.setupEventListeners()`, use Math.js functions.

**New unit category:** Add to `units` object in `UnitConverter` constructor with conversion factors.

**New tab:** Add tab button and panel in `index.html`, handle tab switching in inline script.
