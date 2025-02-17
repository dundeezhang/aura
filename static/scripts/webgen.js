const copyButton = document.getElementById("copy-button");
const generatedCode = document.getElementById("generated-code");
const downloadButton = document.getElementById("download-button");

if (copyButton && generatedCode) {
    copyButton.addEventListener("click", function () {
        navigator.clipboard
            .writeText(generatedCode.textContent)
            .then(() => {
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    copyButton.textContent = "Copy Code";
                }, 2000);
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                copyButton.textContent = "Copy Failed";
                setTimeout(() => {
                    copyButton.textContent = "Copy Code";
                }, 2000);
            });
    });
}

if (downloadButton && generatedCode) {
    downloadButton.addEventListener("click", function () {
        const blob = new Blob([generatedCode.textContent], {
            type: "text/html",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "index.html"; // Set the filename
        link.style.display = "none"; // Hide the link
        document.body.appendChild(link); // Add to the DOM
        link.click(); // Simulate click
        document.body.removeChild(link); // Remove from the DOM
        URL.revokeObjectURL(link.href); // Release the URL
    });
}

if (copyButton && generatedCode) {
    copyButton.addEventListener("click", function () {
        navigator.clipboard
            .writeText(generatedCode.textContent) // Use textContent for raw text
            .then(() => {
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                    copyButton.textContent = "Copy Code";
                }, 2000);
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                copyButton.textContent = "Copy Failed";
                setTimeout(() => {
                    copyButton.textContent = "Copy Code";
                }, 2000);
            });
    });
}
