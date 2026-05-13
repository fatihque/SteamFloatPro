console.log('isolated.js loaded, chrome.i18n:', chrome.i18n);
console.log('UI Language:', chrome.i18n.getUILanguage());

(function() {
    'use strict';

    if (typeof chrome !== 'undefined' && chrome.i18n) {
        const translations = {
            sortBy: chrome.i18n.getMessage('sortBy'),
            sortLow: chrome.i18n.getMessage('sortLow'),
            sortHigh: chrome.i18n.getMessage('sortHigh'),
            filterPlaceholder: chrome.i18n.getMessage('filterPlaceholder'),
            addFilter: chrome.i18n.getMessage('addFilter'),
            globalActive: chrome.i18n.getMessage('globalActive'),
            makeGlobal: chrome.i18n.getMessage('makeGlobal'),
            sponsorText: chrome.i18n.getMessage('sponsorText')
        };

        console.log('Çeviriler (ham):', translations);

        window.postMessage({ type: 'STEAM_FLOAT_TRANSLATIONS', translations: translations }, '*');
        console.log('Çeviriler gönderildi');
    } else {
        console.error('chrome.i18n bulunamadı!');
    }
})();