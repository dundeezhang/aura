import { auth, provider } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// UI - Elements
const emailInputEl = document.getElementById("email-input");
const passwordInputEl = document.getElementById("password-input");
const signInButtonEl = document.getElementById("sign-in-btn");
const errorMsgEmail = document.getElementById("email-error-message");
const errorMsgPassword = document.getElementById("password-error-message");

// Event Listeners
if (signInButtonEl) {
    signInButtonEl.addEventListener("click", authSignInWithEmail);
}

passwordInputEl.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        signInButtonEl.click();
    }
});

// Function to handle sign-in with email/password
function authSignInWithEmail() {
    const email = emailInputEl.value;
    const password = passwordInputEl.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            user.getIdToken().then(function (idToken) {
                loginUser(user, idToken);
            });
            console.log("User signed in:", user);
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === "auth/invalid-email") {
                errorMsgEmail.textContent = "Invalid email";
            } else if (errorCode === "auth/invalid-credential") {
                errorMsgPassword.textContent =
                    "Login failed - invalid email or password";
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
