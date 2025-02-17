document
    .getElementById("updateForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        let name = document.getElementById("nameInput").value;
        let recaptchaResponse = grecaptcha.getResponse();
        let loadingMessage = document.getElementById("loadingMessage");
        let displayImage = document.getElementById("displayImage");
        let errorMessage = document.getElementById("errorMessage");

        loadingMessage.style.display = "block";
        errorMessage.textContent = "";

        if (!recaptchaResponse) {
            errorMessage.textContent = "Please complete the CAPTCHA.";
            loadingMessage.style.display = "none";
            return;
        }

        fetch("/update-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body:
                "name=" +
                encodeURIComponent(name) +
                "&g-recaptcha-response=" +
                encodeURIComponent(recaptchaResponse),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    let newImage = new Image();
                    newImage.src = data.new_url;

                    newImage.onload = function () {
                        displayImage.src = data.new_url;
                        loadingMessage.style.display = "none";
                        errorMessage.textContent = "";
                    };
                } else {
                    loadingMessage.style.display = "none";
                    errorMessage.textContent = "Something went wrong.";
                }
            })
            .catch(() => {
                loadingMessage.style.display = "none";
                errorMessage.textContent =
                    "An error occurred. Please try again.";
            });
    });

document
    .getElementById("nameInput")
    .addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();

            let name = document.getElementById("nameInput").value;
            let recaptchaResponse = grecaptcha.getResponse();
            let loadingMessage = document.getElementById("loadingMessage");
            let displayImage = document.getElementById("displayImage");
            let errorMessage = document.getElementById("errorMessage");

            loadingMessage.style.display = "block";
            errorMessage.textContent = "";

            if (!recaptchaResponse) {
                errorMessage.textContent = "Please complete the CAPTCHA.";
                loadingMessage.style.display = "none";
                return;
            }

            fetch("/update-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body:
                    "name=" +
                    encodeURIComponent(name) +
                    "&g-recaptcha-response=" +
                    encodeURIComponent(recaptchaResponse),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        let newImage = new Image();
                        newImage.src = data.new_url;

                        newImage.onload = function () {
                            displayImage.src = data.new_url;
                            loadingMessage.style.display = "none";
                            errorMessage.textContent = "";
                        };
                    } else {
                        loadingMessage.style.display = "none";
                        errorMessage.textContent = "Something went wrong.";
                    }
                })
                .catch(() => {
                    loadingMessage.style.display = "none";
                    errorMessage.textContent =
                        "An error occurred. Please try again.";
                });
        }
    });
