const formContainer = document.getElementById("form-container");
    const generatingMessage = document.getElementById("generating-message");
    const emailForm = document.getElementById("email-form");
    const generateButton = document.getElementById("generate-button");

    emailForm.addEventListener("submit", function (event) {
        event.preventDefault();

        formContainer.style.display = "none";
        generatingMessage.style.display = "block";

        fetch(emailForm.action, {
            method: emailForm.method,
            body: new FormData(emailForm),
        })
            .then((response) => response.text())
            .then((html) => {
                document.documentElement.innerHTML = html;
                attachCopyButtonListener();
            })
            .catch((error) => {
                console.error("Error:", error);
                generatingMessage.style.display = "none";
                formContainer.style.display = "block";
                alert("An error occurred during email generation.");
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
                            copyButton.textContent = "Copy Email";
                        }, 2000);
                    })
                    .catch((err) => {
                        console.error("Failed to copy: ", err);
                        copyButton.textContent = "Copy Failed";
                        setTimeout(() => {
                            copyButton.textContent = "Copy Email";
                        }, 2000);
                    });
                window.getSelection().removeAllRanges();
            });
        }
    }

    attachCopyButtonListener();