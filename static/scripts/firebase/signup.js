import { auth, provider } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// UI - Elements
const emailInputEl = document.getElementById("email-input");
const passwordInputEl = document.getElementById("password-input");
const createAccountButtonEl = document.getElementById("create-account-btn");
const errorMsgEmail = document.getElementById("email-error-message");
const errorMsgPassword = document.getElementById("password-error-message");

// Event Listeners
if (createAccountButtonEl) {
    createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);
}

passwordInputEl.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        createAccountButtonEl.click();
    }
});

// Function to handle creating an account with email/password
function authCreateAccountWithEmail() {
    const email = emailInputEl.value;
    const password = passwordInputEl.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            loginUser(user, idToken);
            console.log("User created & logged in:", user);
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === "auth/invalid-email") {
                errorMsgEmail.textContent = "Invalid email";
            } else if (errorCode === "auth/weak-password") {
                errorMsgPassword.textContent =
                    "Invalid password - must be at least 6 characters";
            } else if (errorCode === "auth/email-already-in-use") {
                errorMsgEmail.textContent =
                    "An account already exists for this email.";
            }
        });
}

function loginUser(user, idToken) {
    fetch("/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
        },
        credentials: "same-origin",
    })
        .then((response) => {
            if (response.ok) {
                window.location.href = "/signature";
            } else {
                console.error("Failed to login");
            }
        })
        .catch((error) => {
            console.error("Error with Fetch operation:", error);
        });
}
