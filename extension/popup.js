document.addEventListener("DOMContentLoaded", function () {
    // UI Elements
    const startButton = document.getElementById("startReading");
    const stopButton = document.getElementById("stopReading");
    const voiceSelect = document.getElementById("voice");
    const rateInput = document.getElementById("rate");
    const pitchInput = document.getElementById("pitch");
    const volumeInput = document.getElementById("volume");
    const rateValue = document.getElementById("rateValue");
    const pitchValue = document.getElementById("pitchValue");
    const volumeValue = document.getElementById("volumeValue");
    const statusElement = document.getElementById("status");
    const ocrQualitySelect = document.getElementById("ocrQuality");

    // Initialize TTS voices
    function loadVoices() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = "";

        voices.forEach((voice, index) => {
            const option = document.createElement("option");
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = index;

            // Set default voice (prefer English)
            if (voice.default || voice.lang.includes("en-")) {
                option.selected = true;
            }

            voiceSelect.appendChild(option);
        });

        // If no voices are available yet, try again
        if (voices.length === 0) {
            setTimeout(loadVoices, 100);
        }
    }

    // Load voices when available
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    // Load saved settings
    function loadSettings() {
        chrome.storage.sync.get(
            {
                voiceIndex: 0,
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                ocrQuality: "standard",
            },
            function (items) {
                // Set values after voices are loaded
                setTimeout(() => {
                    if (voiceSelect.options.length > 0) {
                        voiceSelect.value =
                            items.voiceIndex < voiceSelect.options.length
                                ? items.voiceIndex
                                : 0;
                    }
                }, 100);

                rateInput.value = items.rate;
                pitchInput.value = items.pitch;
                volumeInput.value = items.volume;
                ocrQualitySelect.value = items.ocrQuality;

                // Update displayed values
                rateValue.textContent = items.rate.toFixed(1);
                pitchValue.textContent = items.pitch.toFixed(1);
                volumeValue.textContent = items.volume.toFixed(1);
            }
        );
    }

    // Save settings
    function saveSettings() {
        chrome.storage.sync.set({
            voiceIndex: parseInt(voiceSelect.value, 10),
            rate: parseFloat(rateInput.value),
            pitch: parseFloat(pitchInput.value),
            volume: parseFloat(volumeInput.value),
            ocrQuality: ocrQualitySelect.value,
        });
    }

    // Update displayed values when sliders change
    rateInput.addEventListener("input", function () {
        rateValue.textContent = parseFloat(this.value).toFixed(1);
        saveSettings();
    });

    pitchInput.addEventListener("input", function () {
        pitchValue.textContent = parseFloat(this.value).toFixed(1);
        saveSettings();
    });

    volumeInput.addEventListener("input", function () {
        volumeValue.textContent = parseFloat(this.value).toFixed(1);
        saveSettings();
    });

    // Save settings when voice or OCR quality changes
    voiceSelect.addEventListener("change", saveSettings);
    ocrQualitySelect.addEventListener("change", saveSettings);

    // Start reading comics
    startButton.addEventListener("click", function () {
        // Update status
        statusElement.textContent = "Starting comic reader...";
        statusElement.className = "status";

        // Get current settings
        const settings = {
            voiceIndex: parseInt(voiceSelect.value, 10),
            rate: parseFloat(rateInput.value),
            pitch: parseFloat(pitchInput.value),
            volume: parseFloat(volumeInput.value),
            ocrQuality: ocrQualitySelect.value,
        };

        // Check if OCR quality is selected
        if (!settings.ocrQuality) {
            statusElement.textContent = "Error: OCR quality is required";
            statusElement.className = "status error";
            return;
        }

        // Send message to content script
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "startReading",
                        settings: settings,
                    },
                    function (response) {
                        if (chrome.runtime.lastError) {
                            statusElement.textContent =
                                "Error: " + chrome.runtime.lastError.message;
                            statusElement.className = "status error";
                            return;
                        }

                        if (response && response.success) {
                            statusElement.textContent =
                                "Reading comic images...";
                            statusElement.className = "status success";
                        } else if (response && response.error) {
                            statusElement.textContent =
                                "Error: " + response.error;
                            statusElement.className = "status error";
                        }
                    }
                );
            }
        );
    });

    // Stop reading
    stopButton.addEventListener("click", function () {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "stopReading",
                    },
                    function (_) {
                        statusElement.textContent = "Reading stopped.";
                        statusElement.className = "status";
                    }
                );
            }
        );

        // Also stop any speech synthesis in the popup
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    });

    // Load settings when popup opens
    loadSettings();
});
