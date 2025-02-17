import { auth } from "./firebase-config.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// UI - Elements
const emailForgotPasswordEl = document.getElementById("email-forgot-password");
const forgotPasswordButtonEl = document.getElementById("forgot-password-btn");
const errorMsgEmail = document.getElementById("email-error-message");

// Event Listener
if (forgotPasswordButtonEl) {
    forgotPasswordButtonEl.addEventListener("click", resetPassword);
}

emailForgotPasswordEl.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        forgotPasswordButtonEl.click();
    }
});

// Function to reset password
function resetPassword() {
    const emailToReset = emailForgotPasswordEl.value.trim();

    if (!emailToReset) {
        errorMsgEmail.textContent = "Please enter your email.";
        return;
    }

    sendPasswordResetEmail(auth, emailToReset)
        .then(() => {
            console.log("Password reset email sent to:", emailToReset);
            document.getElementById("reset-password-view").style.display =
                "none";
            document.getElementById(
                "reset-password-confirmation-page"
            ).style.display = "block";
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);
            errorMsgEmail.textContent = "Error: " + error.message;
        });
}
