// ==UserScript==
// @name         Multi-City Reliable Weather Scraper
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  Scrapes exact temperatures for Tbilisi, Kutaisi, Batumi, and Rustavi every minute
// @match        https://amindi.ge/*
// @connect      api.open-meteo.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const cities = [
        { name: "Tbilisi", lat: 41.7151, lon: 44.8271 },
        { name: "Kutaisi", lat: 42.2662, lon: 42.7180 },
        { name: "Batumi", lat: 41.6434, lon: 41.6399 },
        { name: "Rustavi", lat: 41.5497, lon: 45.0031 }
    ];

    function createUI() {
        if (document.getElementById('multi-city-weather-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'multi-city-weather-widget';
        widget.style.position = 'fixed';
        widget.style.top = '20px';
        widget.style.right = '20px';
        widget.style.zIndex = '999999';
        widget.style.backgroundColor = '#1e1e2e';
        widget.style.color = '#cdd6f4';
        widget.style.padding = '14px 18px';
        widget.style.borderRadius = '10px';
        widget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        widget.style.fontFamily = 'monospace, sans-serif';
        widget.style.fontSize = '13px';
        widget.style.border = '1px solid #45475a';
        widget.style.minWidth = '200px';

        widget.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #89b4fa;" Multi-City Monitor</div>
            <div id="city-results">Fetching live temperatures...</div>
            <div id="ws-last-time" style="font-size: 11px; color: #a6adc8; margin-top: 8px;">Last update: --:--:--</div>
        `;
        document.body.appendChild(widget);
    }

    function fetchAllWeather() {
        const results = {};
        const now = new Date().toLocaleTimeString();
        let completed = 0;

        cities.forEach(city => {
            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;

            GM_xmlhttpRequest({
                method: "GET",
                url: apiUrl,
                onload: function(response) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const temp = Math.round(data.current_weather.temperature);
                        results[city.name] = `${temp}°`;
                    } catch (e) {
                        results[city.name] = "N/A";
                    }

                    completed++;
                    if (completed === cities.length) {
                        console.log(`[Weather Monitor ${now}] Scraped Results:`, results);
                        GM_setValue('multi_city_weather', { data: results, timestamp: now });
                        updateUI(results, now);
                    }
                },
                onerror: function() {
                    results[city.name] = "Error";
                    completed++;
                    if (completed === cities.length) updateUI(results, now);
                }
            });
        });
    }

    function updateUI(results, time) {
        const listEl = document.getElementById('city-results');
        const timeEl = document.getElementById('ws-last-time');
        if (!listEl) return;

        let html = '';
        cities.forEach(c => {
            const temp = results[c.name] || '...';
            const isError = temp === 'N/A' || temp === 'Error';
            html += `<div style="display: flex; justify-content: space-between; margin: 4px 0;">
                <span>${c.name}:</span>
                <b style="color: ${isError ? '#f38ba8' : '#a6e3a1'}">${temp}</b>
            </div>`;
        });

        listEl.innerHTML = html;
        if (timeEl) timeEl.innerText = `Last update: ${time}`;
    }

    window.addEventListener('load', () => {
        createUI();
        fetchAllWeather();
        setInterval(fetchAllWeather, 60000);
    });
})();
