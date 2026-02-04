// ==========================================
// NEUROLENS | Day 5 Complete Logic
// Features: API Connection, Markdown, Copy, History
// ==========================================

// 1. Page load hote hi history check karo
document.addEventListener('DOMContentLoaded', loadHistory);

async function summarize() {
    // HTML elements uthana
    const text = document.getElementById('paperText').value;
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');
    
    // ⚠️ REPLACE THIS WITH YOUR ACTUAL API KEY
    const API_KEY = 'AIzaSyBT8Kgw-yRUFkQKFolcxYtZjdKAaTxP5Bo'; 

    // Validation: Agar input khaali hai toh roko
    if (text.trim() === "") {
        alert("Please paste some text first! 📄");
        return;
    }

    // UI Updates: Loading state ON
    output.style.display = "none";
    loader.style.display = "block";
    statusText.style.display = "block";
    statusText.innerText = "NEUROLENS IS READING...";

    // Gemini API Setup
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    // Prompt Engineering
    const requestBody = {
        contents: [{
            parts: [{
                text: `You are an expert tech summarizer. Summarize the following text into 3 clear bullet points using markdown formatting. Make the key terms **bold**. \n\nText: ${text}`
            }]
        }]
    };

    try {
        // Data bhejna (Fetch Request)
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Data aane ke baad kya karna hai
        if (data.candidates && data.candidates[0].content) {
            const rawSummary = data.candidates[0].content.parts[0].text;
            
            // Markdown ko HTML mein badalna (using marked.js)
            const formattedSummary = marked.parse(rawSummary);

            // Result show karna
            output.innerHTML = `
                <div class="summary-box">
                    <div class="summary-header">
                        <h3>Neurolens Insight 🧠</h3>
                        <button onclick="copyToClipboard()" class="copy-btn">📋 Copy</button>
                    </div>
                    <div class="summary-content">
                        ${formattedSummary}
                    </div>
                </div>
            `;

            // 🔥 HISTORY SAVE KARNA (Day 5 Feature)
            saveToHistory(text, formattedSummary);

        } else {
            output.innerHTML = `<p style="color: #ef4444;">Error: AI couldn't read that text.</p>`;
        }

    } catch (error) {
        console.error("Error:", error);
        output.innerHTML = `<p style="color: #ef4444;">Connection Failed! Check console.</p>`;
    } finally {
        // Loading state OFF
        loader.style.display = "none";
        statusText.style.display = "none";
        output.style.display = "block";
    }
}

// --- Copy Function ---
function copyToClipboard() {
    const text = document.querySelector('.summary-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerText = "✅ Copied!";
        setTimeout(() => btn.innerText = "📋 Copy", 2000);
    });
}

// ==========================================
// HISTORY MANAGEMENT (LOCAL STORAGE)
// ==========================================

// History Save karna
function saveToHistory(originalText, summaryHtml) {
    const historyItem = {
        title: originalText.substring(0, 40) + "...", // Sirf shuru ke 40 words dikhana
        summary: summaryHtml,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Sirf time (e.g., 10:30 AM)
    };

    // LocalStorage se purana data nikalo
    let history = JSON.parse(localStorage.getItem('neurolensHistory')) || [];
    
    // Naya item sabse upar add karo
    history.unshift(historyItem);
    
    // Agar 5 se zyada items ho jayein, toh purana delete kar do
    if (history.length > 5) {
        history.pop();
    }
    
    // Wapas save karo
    localStorage.setItem('neurolensHistory', JSON.stringify(history));
    
    // List update karo
    loadHistory();
}

// History Load karna (Page khulte hi)
function loadHistory() {
    const historyList = document.getElementById('historyList');
    let history = JSON.parse(localStorage.getItem('neurolensHistory')) || [];

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg" style="color: #64748b; font-style: italic;">No history yet.</p>';
        return;
    }

    // HTML generate karna har history item ke liye
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

// Purani summary wapas dikhana
function restoreSummary(index) {
    let history = JSON.parse(localStorage.getItem('neurolensHistory'));
    const item = history[index];
    
    const output = document.getElementById('output');
    output.style.display = 'block';
    
    output.innerHTML = `
        <div class="summary-box" style="border-color: #a855f7;"> <div class="summary-header">
                <h3 style="color: #a855f7;">🔄 Restored from History</h3>
                <button onclick="copyToClipboard()" class="copy-btn">📋 Copy</button>
            </div>
            <div class="summary-content">
                ${item.summary}
            </div>
        </div>
    `;
    
    // Smooth scroll karke result dikhana
    output.scrollIntoView({ behavior: 'smooth' });
}

// History Delete karna
function clearHistory() {
    if(confirm("Are you sure you want to delete all history?")) {
        localStorage.removeItem('neurolensHistory');
        loadHistory();
    }
}
