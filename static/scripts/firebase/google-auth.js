import { auth, provider } from "./firebase-config.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// UI - Elements
const signInWithGoogleButtonEl = document.getElementById(
    "sign-in-with-google-btn"
);
const signUpWithGoogleButtonEl = document.getElementById(
    "sign-up-with-google-btn"
);
const errorMsgGoogleSignIn = document.getElementById(
    "google-signin-error-message"
);

// Event Listeners
if (signInWithGoogleButtonEl) {
    signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);
}

if (signUpWithGoogleButtonEl) {
    signUpWithGoogleButtonEl.addEventListener("click", authSignUpWithGoogle);
}

// Google Sign-In Function
async function authSignInWithGoogle() {
    provider.setCustomParameters({
        prompt: "select_account",
    });

    try {
        const result = await signInWithPopup(auth, provider);
        if (!result || !result.user) {
            throw new Error("Authentication failed: No user data returned.");
        }

        const user = result.user;
        const email = user.email;
        if (!email) {
            throw new Error(
                "Authentication failed: No email address returned."
            );
        }

        const idToken = await user.getIdToken();
        loginUser(user, idToken);
    } catch (error) {
        handleLogging(error, "Error during sign-in with Google");
    }
}

// Google Sign-Up Function (same as sign-in for handling existing users)
async function authSignUpWithGoogle() {
    provider.setCustomParameters({
        prompt: "select_account",
    });

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idToken = await user.getIdToken();
        loginUser(user, idToken);
    } catch (error) {
        console.error("Error during Google signup: ", error.message);
    }
}

// Handle logging user after Google authentication
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

// Handle logging errors
function handleLogging(error, context) {
    console.error(`${context}: ${error.message}`);
    if (errorMsgGoogleSignIn) {
        errorMsgGoogleSignIn.textContent = "Error: " + error.message;
    }
}
