# Tampermonkey Automation Scripts

A collection of custom user-scripts for browser automation and data extraction.

---

## Included Scripts

### 1. Weather Scraper
* **File:** `weather-scraper/weather_scraper.user.js`
* **Target Site:** `amindi.ge`
* **Features:**
  * Fetches real-time weather data for **Tbilisi, Kutaisi, Batumi, and Rustavi** via the Open-Meteo API.
  * Polls data automatically every 60 seconds.
  * Displays live temperatures in a custom UI overlay widget.
  * Persists records using `GM_setValue`.

### 2. Claude Response Extractor
* **File:** `claude-extractor/claude_extractor.user.js`
* **Target Site:** `claude.ai`
* **Features:**
  * Uses `MutationObserver` to monitor active chats.
  * Automatically detects when Claude completes text generation.
  * Extracts the raw response text and outputs it into an on-screen preview widget and DevTools console.
  * Saves extracted content locally via `GM_setValue`.

---

## Environment
* Developed and tested on **Google Chrome** using the **Tampermonkey** extension.
