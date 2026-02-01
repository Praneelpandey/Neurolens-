// Day 3: Connecting Real Gemini API

async function summarize() {
    const text = document.getElementById('paperText').value;
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');
    
    const API_KEY = 'AIzaSyBT8Kgw-yRUFkQKFolcxYtZjdKAaTxP5Bo'; 

    if (text.trim() === "") {
        alert("Please paste some text first! 📄");
        return;
    }

    // UI Updates
    output.style.display = "none";
    loader.style.display = "block";
    statusText.style.display = "block";
    statusText.innerText = "NEUROLENS IS READING...";

    // API Setup
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [{
                text: `Summarize the following text into 3 simple bullet points for a college student. Keep it professional but easy to understand:\n\n${text}`
            }]
        }]
    };

    try {
        // Fetch request bhejna (Sending data to Google)
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Response check karna
        if (data.candidates && data.candidates[0].content) {
            const summary = data.candidates[0].content.parts[0].text;
            
            // Format formatting (Markdown **Bold** ko HTML <b> mein badalna)
            const formattedSummary = summary.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

            // Result Show karna
            output.innerHTML = `
                <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #38bdf8; text-align: left;">
                    <h3 style="color: white; margin-bottom: 15px;">Neurolens Summary 🧠</h3>
                    <p style="color: #e2e8f0; line-height: 1.6;">${formattedSummary}</p>
                </div>
            `;
        } else {
            output.innerHTML = `<p style="color: red;">Error: Could not understand the text.</p>`;
        }

    } catch (error) {
        console.error("Error:", error);
        output.innerHTML = `<p style="color: red;">Something went wrong! Check console.</p>`;
    } finally {
        loader.style.display = "none";
        statusText.style.display = "none";
        output.style.display = "block";
    }
}
