// Background script for Visual Web Comic Dubber

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // Set default settings on install
        chrome.storage.sync.set({
            voiceIndex: 0,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            ocrQuality: "standard",
        });

        // Open options page on install
        chrome.tabs.create({
            url: "popup.html",
        });
    }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle any background tasks here
    if (message.action === "checkTesseractStatus") {
        // Tesseract is always available since it's included in the extension
        sendResponse({ status: "available" });
        return true;
    }
});
