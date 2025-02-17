const formContainer = document.getElementById("form-container");
const generatingMessage = document.getElementById("generating-message");
const linkedinForm = document.getElementById("linkedin-form");
const generateButton = document.getElementById("generate-button");

linkedinForm.addEventListener("submit", function (event) {
    event.preventDefault();

    formContainer.style.display = "none";
    generatingMessage.style.display = "block";

    fetch(linkedinForm.action, {
        method: linkedinForm.method,
        body: new FormData(linkedinForm),
    })
        .then((response) => response.text())
        .then((responseText) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(responseText, "text/html");

            const markdownElement = doc.getElementById("generated-post");
            if (!markdownElement) {
                throw new Error(
                    "Element with ID 'generated-post' not found in response."
                );
            }
            const markdown = markdownElement.textContent;

            const html = marked.parse(markdown);

            markdownElement.innerHTML = html;

            document.documentElement.innerHTML = doc.documentElement.innerHTML;

            attachCopyButtonListener();

            generatingMessage.style.display = "none";
            formContainer.style.display = "block";
        })
        .catch((error) => {
            console.error("Error:", error);
            generatingMessage.style.display = "none";
            formContainer.style.display = "block";
            alert("An error occurred during post generation: " + error);
        });
});

function attachCopyButtonListener() {
    const copyButton = document.getElementById("copy-button");
    const generatedPost = document.getElementById("generated-post");

    if (copyButton && generatedPost) {
        copyButton.addEventListener("click", function () {
            const range = document.createRange();
            range.selectNodeContents(generatedPost);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            navigator.clipboard
                .writeText(range.toString())
                .then(() => {
                    copyButton.textContent = "Copied!";
                    setTimeout(() => {
                        copyButton.textContent = "Copy Post";
                    }, 2000);
                })
                .catch((err) => {
                    console.error("Failed to copy: ", err);
                    copyButton.textContent = "Copy Failed";
                    setTimeout(() => {
                        copyButton.textContent = "Copy Post";
                    }, 2000);
                });
            window.getSelection().removeAllRanges();
        });
    }
}

attachCopyButtonListener();
