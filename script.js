// ==========================================
// NEUROLENS | Day 9: Complete Logic
// Features: Security, Settings, Modes, History, PDF, Voice
// ==========================================

// Global Variables
let userKey = "";           // API Key yahan store hogi
let summaryMode = "bullet"; // Default mode
let speechController = new SpeechSynthesisUtterance();
let isSpeaking = false;

// 1. Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();  // Purani history load karo
    loadSettings(); // Saved API Key aur Mode load karo
});

// ==========================================
// MAIN LOGIC: SUMMARIZE
// ==========================================

async function summarize() {
    const text = document.getElementById('paperText').value;
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');
    
    // SECURITY CHECK: Agar API Key nahi hai, toh user ko roko
    if (!userKey) {
        showToast("⚠️ API Key missing! Open Settings ⚙️ to add it.", "error");
        openSettings(); // Auto open settings modal
        return;
    }

    if (text.trim() === "") {
        showToast("Please paste some text first! 📄", "error");
        return;
    }

    // Stop speaking if active
    window.speechSynthesis.cancel();

    // UI Updates
    output.style.display = "none";
    loader.style.display = "block";
    statusText.style.display = "block";
    statusText.innerText = "NEUROLENS IS THINKING...";

    // DAY 9: DYNAMIC PROMPT (Based on Mode)
    let promptText = "";
    if (summaryMode === "detailed") {
        promptText = `You are a professional researcher. Provide a detailed summary of the following text in 3-4 paragraphs. Use bold formatting for key concepts.\n\nText: ${text}`;
    } else if (summaryMode === "eli5") {
        promptText = `Explain the following text like I am a 5-year-old. Use simple words, fun analogies, and bullet points.\n\nText: ${text}`;
    } else {
        // Default (Bullet)
        promptText = `Summarize the following text into 3 clear bullet points using markdown formatting. Make key terms **bold**.\n\nText: ${text}`;
    }

    // API Setup (Using User's Key)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userKey}`;
    
    const requestBody = {
        contents: [{ parts: [{ text: promptText }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Handle Invalid Key Error
        if (data.error) {
            showToast("Invalid API Key! Please check Settings.", "error");
            openSettings();
            return;
        }

        if (data.candidates && data.candidates[0].content) {
            const rawSummary = data.candidates[0].content.parts[0].text;
            const formattedSummary = marked.parse(rawSummary);

            // Render Output with Buttons
            output.innerHTML = `
                <div class="summary-box" id="summaryContent">
                    <div class="summary-header">
                        <h3>Neurolens Insight 🧠</h3>
                        <div class="action-buttons">
                            <button onclick="copyToClipboard()" class="copy-btn" title="Copy Text">📋</button>
                            <button onclick="downloadPDF()" class="download-btn" title="Download PDF">⬇️</button>
                            <button onclick="speakSummary()" id="listenBtn" class="listen-btn" title="Listen">🔊 Listen</button>
                        </div>
                    </div>
                    <div class="summary-content">${formattedSummary}</div>
                    <div id="rawSpeechText" style="display:none;">${rawSummary}</div>
                </div>
            `;
            
            saveToHistory(text, formattedSummary, rawSummary);
            showToast("Analysis Complete! 🚀");

        } else {
            output.innerHTML = `<p style="color: #ef4444;">Error: AI couldn't read that text.</p>`;
        }

    } catch (error) {
        console.error("Error:", error);
        output.innerHTML = `<p style="color: #ef4444;">Connection Failed! Check internet.</p>`;
    } finally {
        loader.style.display = "none";
        statusText.style.display = "none";
        output.style.display = "block";
    }
}

// ==========================================
// DAY 9: SETTINGS MANAGEMENT
// ==========================================

function openSettings() {
    document.getElementById("settingsModal").style.display = "block";
    // Pre-fill input if key exists
    if(userKey) document.getElementById("userApiKey").value = userKey;
    document.getElementById("summaryStyle").value = summaryMode;
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

// Modal ke bahar click karne par close ho jaye
window.onclick = function(event) {
    const modal = document.getElementById("settingsModal");
    if (event.target == modal) {
        closeSettings();
    }
}

function saveSettings() {
    const keyInput = document.getElementById("userApiKey").value.trim();
    const modeInput = document.getElementById("summaryStyle").value;

    if (keyInput === "") {
        showToast("API Key cannot be empty!", "error");
        return;
    }

    // Save to LocalStorage
    localStorage.setItem("neurolensKey", keyInput);
    localStorage.setItem("neurolensMode", modeInput);

    // Update global variables
    userKey = keyInput;
    summaryMode = modeInput;

    closeSettings();
    showToast("Settings Saved! ✅");
}

function loadSettings() {
    const savedKey = localStorage.getItem("neurolensKey");
    const savedMode = localStorage.getItem("neurolensMode");

    if (savedKey) userKey = savedKey;
    if (savedMode) summaryMode = savedMode;
}

// ==========================================
// UTILITIES: COPY, PDF, VOICE
// ==========================================

function copyToClipboard() {
    const text = document.querySelector('.summary-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Summary copied! 📋");
    });
}

function downloadPDF() {
    const element = document.getElementById('summaryContent');
    const opt = {
        margin: 10,
        filename: 'Neurolens_Summary.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#1e293b" },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => showToast("PDF Downloaded! 📄"));
}

function speakSummary() {
    const btn = document.getElementById('listenBtn');
    
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        btn.innerText = "🔊 Listen";
        btn.classList.remove("speaking");
        return;
    }

    let textToSpeak = document.getElementById('rawSpeechText').innerText;
    textToSpeak = textToSpeak.replace(/[*#]/g, ''); // Remove Markdown symbols

    speechController.text = textToSpeak;
    speechController.lang = 'en-US';
    
    speechController.onend = function() {
        isSpeaking = false;
        btn.innerText = "🔊 Listen";
        btn.classList.remove("speaking");
    };

    window.speechSynthesis.speak(speechController);
    isSpeaking = true;
    btn.innerText = "⏹️ Stop";
    btn.classList.add("speaking");
}

// ==========================================
// HISTORY MANAGEMENT
// ==========================================

function saveToHistory(originalText, summaryHtml, rawSummary) {
    const historyItem = {
        title: originalText.substring(0, 40) + "...",
        summary: summaryHtml,
        raw: rawSummary || "Text unavailable",
        mode: summaryMode, // Save mode too
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let history = JSON.parse(localStorage.getItem('neurolensHistory')) || [];
    history.unshift(historyItem);
    if (history.length > 5) history.pop();
    
    localStorage.setItem('neurolensHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('historyList');
    let history = JSON.parse(localStorage.getItem('neurolensHistory')) || [];

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg" style="color: #64748b; font-style: italic;">No history yet.</p>';
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-card" onclick="restoreSummary(${index})">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="color: #38bdf8; font-weight: bold; font-size: 0.8rem;">SCAN #${index + 1}</span>
                <span style="color: #64748b; font-size: 0.8rem;">${item.date}</span>
            </div>
            <p>${item.title}</p>
        </div>
    `).join('');
}

function restoreSummary(index) {
    let history = JSON.parse(localStorage.getItem('neurolensHistory'));
    const item = history[index];
    
    const output = document.getElementById('output');
    output.style.display = 'block';
    
    output.innerHTML = `
        <div class="summary-box" id="summaryContent" style="border-color: #a855f7;">
            <div class="summary-header">
                <h3 style="color: #a855f7;">🔄 Restored (${item.mode || "bullet"})</h3>
                <div class="action-buttons">
                    <button onclick="copyToClipboard()" class="copy-btn">📋</button>
                    <button onclick="downloadPDF()" class="download-btn">⬇️</button>
                    <button onclick="speakSummary()" id="listenBtn" class="listen-btn">🔊 Listen</button>
                </div>
            </div>
            <div class="summary-content">${item.summary}</div>
            <div id="rawSpeechText" style="display:none;">${item.raw}</div>
        </div>
    `;
    
    output.scrollIntoView({ behavior: 'smooth' });
    showToast("Restored from History 🕒");
}

function clearHistory() {
    if(confirm("Are you sure you want to delete all history?")) {
        localStorage.removeItem('neurolensHistory');
        loadHistory();
        showToast("History Cleared! 🗑️", "error");
    }
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    
    toast.className = "toast show"; 
    if (type === "error") toast.classList.add("error");
    
    setTimeout(function() { 
        toast.className = toast.className.replace("show", ""); 
    }, 3000);
}
