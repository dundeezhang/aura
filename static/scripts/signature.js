document
    .getElementById("updateForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        let name = document.getElementById("nameInput").value;
        let loadingMessage = document.getElementById("loadingMessage");
        let displayImage = document.getElementById("displayImage");
        let errorMessage = document.getElementById("errorMessage");

        // Show loading message
        loadingMessage.style.display = "block";
        errorMessage.textContent = "";

        fetch("/update-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "name=" + encodeURIComponent(name),
        })
            .then((response) => response.json())
            .then((data) => {
                loadingMessage.style.display = "none";
                if (data.success) {
                    displayImage.src = data.new_url;
                    errorMessage.textContent = "";
                } else {
                    errorMessage.textContent = "Name not found. Try another.";
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
            let loadingMessage = document.getElementById("loadingMessage");
            let displayImage = document.getElementById("displayImage");
            let errorMessage = document.getElementById("errorMessage");

            // Show loading message
            loadingMessage.style.display = "block";
            errorMessage.textContent = "";

            fetch("/update-image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "name=" + encodeURIComponent(name),
            })
                .then((response) => response.json())
                .then((data) => {
                    loadingMessage.style.display = "none";
                    if (data.success) {
                        displayImage.src = data.new_url;
                        errorMessage.textContent = "";
                    } else {
                        errorMessage.textContent =
                            "Name not found. Try another.";
                    }
                })
                .catch(() => {
                    loadingMessage.style.display = "none";
                    errorMessage.textContent =
                        "An error occurred. Please try again.";
                });
        }
    });
