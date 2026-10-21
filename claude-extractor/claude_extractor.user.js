// ==UserScript==
// @name         Claude Precise Response Extractor
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Extracts exact response text from Claude chats
// @match        https://claude.ai/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    let lastCapturedResponse = "";

    function createUI() {
        if (document.getElementById('claude-response-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'claude-response-widget';
        widget.style.position = 'fixed';
        widget.style.bottom = '20px';
        widget.style.right = '20px';
        widget.style.zIndex = '999999';
        widget.style.backgroundColor = '#1e1e2e';
        widget.style.color = '#cdd6f4';
        widget.style.padding = '14px 18px';
        widget.style.borderRadius = '10px';
        widget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
        widget.style.fontFamily = 'sans-serif';
        widget.style.fontSize = '12px';
        widget.style.border = '1px solid #45475a';
        widget.style.maxWidth = '400px';
        widget.style.maxHeight = '350px';
        widget.style.overflowY = 'auto';

        widget.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #89b4fa; border-bottom: 1px solid #45475a; padding-bottom: 4px;">
                 Claude Extractor Output
            </div>
            <div id="claude-last-text" style="color: #a6e3a1; white-space: pre-wrap; word-break: break-word; font-family: monospace;">მოლოდინის რეჟიმში...</div>
            <div id="claude-last-time" style="font-size: 10px; color: #a6adc8; margin-top: 8px;">Status: Listening...</div>
        `;
        document.body.appendChild(widget);
    }

    function extractLatestResponse() {
        const responseBlocks = document.querySelectorAll('.grid-cols-1, .font-claude-message');

        if (responseBlocks.length > 0) {
            const latestBlock = responseBlocks[responseBlocks.length - 1];

            const textNodes = Array.from(latestBlock.querySelectorAll('p, li, h1, h2, h3'))
                                   .map(el => el.innerText.trim())
                                   .filter(text => text.length > 0 && !text.includes('minute ago') && !text.includes('just now'));

            const cleanResponse = textNodes.join('\n');

            if (cleanResponse && cleanResponse !== lastCapturedResponse) {
                lastCapturedResponse = cleanResponse;
                const timestamp = new Date().toLocaleTimeString();

                console.log(`%c[Claude Extractor ${timestamp}] დაიჭირა პასუხი:`, "color: #a6e3a1; font-weight: bold;");
                console.log(cleanResponse);

                GM_setValue('last_claude_response', {
                    text: cleanResponse,
                    time: timestamp
                });

                updateUI(cleanResponse, timestamp);
            }
        }
    }

    function updateUI(text, time) {
        const textEl = document.getElementById('claude-last-text');
        const timeEl = document.getElementById('claude-last-time');

        if (textEl) {
            const previewText = text.length > 200 ? text.substring(0, 200) + "..." : text;
            textEl.innerText = text;
        }
        if (timeEl) {
            timeEl.innerText = `დაიჭირა: ${time}`;
        }
    }

    const observer = new MutationObserver(() => {
        const stopButton = document.querySelector('button[aria-label*="Stop"]');
        if (!stopButton) {
            extractLatestResponse();
        }
    });

    window.addEventListener('load', () => {
        createUI();
        observer.observe(document.body, { childList: true, subtree: true });
    });
})();
