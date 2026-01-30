function summarize() {
    const link = document.getElementById('paperLink').value;
    const resultArea = document.getElementById('result');

    if (link === "") {
        alert("Please paste a link first!");
        return;
    }

    // Day 1: Simple simulation
    resultArea.innerHTML = `
        <div style="color: #38bdf8; font-weight: bold;">
            Processing: ${link}...
        </div>
        <p>Neurolens is analyzing this paper. (Logic will be added in Day 2!)</p>
    `;
    
    console.log("Summarize clicked for:", link);
}