
function summarize() {
    

    const link = document.getElementById('paperLink').value;
    const loader = document.getElementById('loader');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');


    if (link.trim() === "") {
        alert("Please paste a valid link first! 🔗");
        return; 
    }

    output.style.display = "none"; 

    loader.style.display = "block";
    statusText.style.display = "block";

    console.log("Analyzing:", link); 

    setTimeout(() => {
        
        loader.style.display = "none";
        statusText.style.display = "none";

        output.style.display = "block";

        output.innerHTML = `
            <div style="background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #38bdf8; text-align: left;">
                <h3 style="color: white; margin-bottom: 10px;">Analysis Complete ✅</h3>
                <p style="color: #94a3b8; font-size: 0.9rem;">Source: ${link}</p>
                <hr style="border-color: #334155; margin: 15px 0;">
                <p style="color: #f8fafc; line-height: 1.6;">
                    <strong>Key Insight:</strong> <br>
                    This is a simulated summary for Day 2. The loader worked! 🎉 <br><br>
                    On <strong>Day 3</strong>, we will connect Google Gemini API here to actually read the paper and summarize it!
                </p>
            </div>
        `;

    }, 2000);
}
