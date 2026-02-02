// Day 4: Formatting & Copy Feature

async function summarize() {
    const text = document.getElementById('paperText').value;
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');
    
    // ⚠️ DAY 3 wali API Key yahan paste karna mat bhoolna!
    const API_KEY = 'YOUR_GEMINI_API_KEY'; 

    if (text.trim() === "") {
        alert("Please paste some text first! 📄");
        return;
    }

    // UI Reset
    output.style.display = "none";
    loader.style.display = "block";
    statusText.style.display = "block";
    statusText.innerText = "NEUROLENS IS READING...";

    // Prompt ko thoda aur smart banate hain
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
            
            // Day 4 Magic: Marked.js se text ko HTML mein badalna
            const formattedSummary = marked.parse(rawSummary);

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
        } else {
            output.innerHTML = `<p style="color: #ef4444;">Error: AI couldn't read that text.</p>`;
        }

    } catch (error) {
        console.error("Error:", error);
        output.innerHTML = `<p style="color: #ef4444;">Connection Failed! Check console.</p>`;
    } finally {
        loader.style.display = "none";
        statusText.style.display = "none";
        output.style.display = "block";
    }
}

// Day 4: New Feature - Copy Function
function copyToClipboard() {
    const text = document.querySelector('.summary-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerText = "✅ Copied!";
        setTimeout(() => btn.innerText = "📋 Copy", 2000);
    });
}
