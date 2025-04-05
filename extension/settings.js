// This file manages the extension settings
// It's imported by popup.js and content.js

// Default settings
const DEFAULT_SETTINGS = {
    voiceIndex: 0,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    ocrQuality: "standard", // Options: 'fast', 'standard', 'high'
};

// Load settings from storage
function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
            resolve(items);
        });
    });
}

// Save settings to storage
function saveSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.sync.set(settings, () => {
            resolve();
        });
    });
}

// Reset settings to defaults
function resetSettings() {
    return saveSettings(DEFAULT_SETTINGS);
}

// Export functions
if (typeof module !== "undefined") {
    module.exports = {
        DEFAULT_SETTINGS,
        loadSettings,
        saveSettings,
        resetSettings,
    };
}
