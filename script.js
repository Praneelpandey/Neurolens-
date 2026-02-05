// ==========================================
// NEUROLENS | Day 7 Complete Logic
// Features: API, Markdown, History, Mobile Toasts, PDF Export
// ==========================================

document.addEventListener('DOMContentLoaded', loadHistory);

// --- Main Summarize Function ---
async function summarize() {
    const text = document.getElementById('paperText').value;
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');
    
    // ⚠️ PASTE YOUR API KEY HERE
    const API_KEY = 'AIzaSyBT8Kgw-yRUFkQKFolcxYtZjdKAaTxP5Bo'; 

    if (text.trim() === "") {
        showToast("Please paste some text first! 📄", "error");
        return;
    }

    output.style.display = "none";
    loader.style.display = "block";
    statusText.style.display = "block";
    statusText.innerText = "NEUROLENS IS READING...";

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

            // UI Update: Added Download Button
            output.innerHTML = `
                <div class="summary-box" id="summaryContent">
                    <div class="summary-header">
                        <h3>Neurolens Insight 🧠</h3>
                        <div class="action-buttons">
                            <button onclick="copyToClipboard()" class="copy-btn">📋 Copy</button>
                            <button onclick="downloadPDF()" class="download-btn">⬇️ PDF</button>
                        </div>
                    </div>
                    <div class="summary-content">
                        ${formattedSummary}
                    </div>
                </div>
            `;

            saveToHistory(text, formattedSummary);
            showToast("Analysis Complete! 🚀");

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

// --- Copy Function ---
function copyToClipboard() {
    const text = document.querySelector('.summary-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Summary copied to clipboard! 📋");
    });
}

// --- Day 7: Download PDF Function ---
function downloadPDF() {
    const element = document.getElementById('summaryContent');
    
    // PDF Generation Options
    const opt = {
        margin:       10,
        filename:     'Neurolens_Summary.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, backgroundColor: "#1e293b" }, // Dark background preserve karega
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate
    html2pdf().set(opt).from(element).save().then(() => {
        showToast("PDF Downloaded! 📄");
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
    
    // Day 7: Restore mein bhi Download button add kiya
    output.innerHTML = `
        <div class="summary-box" id="summaryContent" style="border-color: #a855f7;">
            <div class="summary-header">
                <h3 style="color: #a855f7;">🔄 Restored from History</h3>
                <div class="action-buttons">
                    <button onclick="copyToClipboard()" class="copy-btn">📋 Copy</button>
                    <button onclick="downloadPDF()" class="download-btn">⬇️ PDF</button>
                </div>
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

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = "toast show"; 
    if (type === "error") toast.classList.add("error");
    setTimeout(function() { toast.className = toast.className.replace("show", ""); }, 3000);
}
