// ==========================================
// NEUROLENS | Day 6 Complete Logic
// Features: API, Markdown, History, Mobile Toasts
// ==========================================

// 1. Page load hote hi history check karo
document.addEventListener('DOMContentLoaded', loadHistory);

// --- Main Summarize Function ---
async function summarize() {
    const text = document.getElementById('paperText').value;
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');
    
    // ⚠️ PASTE YOUR API KEY HERE
    const API_KEY = 'AIzaSyBT8Kgw-yRUFkQKFolcxYtZjdKAaTxP5Bo'; 

    // Validation with Toast (Day 6 Update)
    if (text.trim() === "") {
        showToast("Please paste some text first! 📄", "error");
        return;
    }

    // UI Updates: Loading state ON
    output.style.display = "none";
    loader.style.display = "block";
    statusText.style.display = "block";
    statusText.innerText = "NEUROLENS IS READING...";

    // Gemini API Setup
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: `You are an expert tech summarizer. Summarize the following text into 3 clear bullet points using markdown formatting. Make the key terms **bold**. \n\nText: ${text}`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            const rawSummary = data.candidates[0].content.parts[0].text;
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

            // History mein save karo
            saveToHistory(text, formattedSummary);
            showToast("Analysis Complete! 🚀"); // Success Toast

        } else {
            output.innerHTML = `<p style="color: #ef4444;">Error: AI couldn't read that text.</p>`;
            showToast("AI Error: Could not generate summary", "error");
        }

    } catch (error) {
        console.error("Error:", error);
        output.innerHTML = `<p style="color: #ef4444;">Connection Failed! Check console.</p>`;
        showToast("Network Error! check internet", "error");
    } finally {
        loader.style.display = "none";
        statusText.style.display = "none";
        output.style.display = "block";
    }
}

// --- Copy Function with Toast ---
function copyToClipboard() {
    const text = document.querySelector('.summary-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerText = "✅ Copied!";
        showToast("Summary copied to clipboard! 📋"); // Toast Notification
        setTimeout(() => btn.innerText = "📋 Copy", 2000);
    });
}

// ==========================================
// HISTORY MANAGEMENT
// ==========================================

function saveToHistory(originalText, summaryHtml) {
    const historyItem = {
        title: originalText.substring(0, 40) + "...",
        summary: summaryHtml,
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
        <div class="summary-box" style="border-color: #a855f7;">
            <div class="summary-header">
                <h3 style="color: #a855f7;">🔄 Restored from History</h3>
                <button onclick="copyToClipboard()" class="copy-btn">📋 Copy</button>
            </div>
            <div class="summary-content">
                ${item.summary}
            </div>
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
// DAY 6: CUSTOM TOAST NOTIFICATION FUNCTION
// ==========================================

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    
    // Set Message
    toast.innerText = message;
    
    // Reset Classes
    toast.className = "toast show"; 
    
    // Agar error hai toh red color add karo
    if (type === "error") {
        toast.classList.add("error");
    }

    // 3 Seconds baad hide kar do
    setTimeout(function() { 
        toast.className = toast.className.replace("show", ""); 
    }, 3000);
}
