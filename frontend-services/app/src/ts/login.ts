import { appendLoginButton, handleLogin, handleRegister, renderLogout } from './auth';

import { initBallsBackground } from './background'; // or wherever your function is
import { renderRegister } from './register';             // your register screen
import { Color4 } from 'babylonjs';

export function renderLogin(container: HTMLElement) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }


    initBallsBackground(container, {
        numSpheres: 30,
        sphereRadius: 1.2,
        backgroundColor: new Color4(1, 1, 1, 1),
    });

    // Create form element
    const loginForm = document.createElement("form");
    // Updated design: frosted glass effect, Archivo font, subtle border
    loginForm.className = `
    max-w-sm mx-auto
    p-6
    bg-white/30
    backdrop-blur
    border border-white/20
    rounded-lg
    shadow-lg
    font-archivo
    text-gray-800
  `;

    // Create heading
    const heading = document.createElement("h2");
    heading.textContent = "Login";
    heading.className = `
    text-3xl font-bold
    text-center
    mb-6
    text-gray-800
  `;
    loginForm.appendChild(heading);

    // Create Email label and input container
    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Email:";
    emailLabel.setAttribute("for", "email");
    emailLabel.className = `
    block
    text-gray-700
    mb-2
    font-semibold
  `;
    loginForm.appendChild(emailLabel);

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.placeholder = "Enter your email";
    // Subtle single-border style, pastel focus ring
    emailInput.className = `
    w-full
    p-3
    border border-gray-300
    rounded-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-400
    mb-4
    bg-transparent
  `;
    loginForm.appendChild(emailInput);

    // Create Password label and input container
    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "Password:";
    passwordLabel.setAttribute("for", "password");
    passwordLabel.className = `
    block
    text-gray-700
    mb-2
    font-semibold
  `;
    loginForm.appendChild(passwordLabel);

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.placeholder = "Enter your password";
    passwordInput.className = `
    w-full
    p-3
    border border-gray-300
    rounded-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-400
    mb-6
    bg-transparent
  `;
    loginForm.appendChild(passwordInput);

    // Create login button
    const loginButton = document.createElement("button");
    loginButton.type = "submit";
    loginButton.textContent = "Login";
    // Slightly bolder color transitions
    loginButton.className = `
     w-full
    px-4 py-2
    border border-green-500
    text-green-500
    rounded
    hover:bg-green-500 hover:text-white
    transition-colors
    mb-2`;
    loginForm.appendChild(loginButton);

    // Optionally, add a submit event listener for the form.
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // Process the login here, e.g., collect email and password values and send them to your server.
        const email = emailInput.value;
        const password = passwordInput.value;
        console.log(
            "Email:",
            email,
            "Password:",
            password
                ? "Password is not empty (never show password in console please)"
                : "Password is empty"
        );
        await handleLogin({ email, password });
        // Insert your login handling logic...
    });

    const linkContainer = document.createElement("p");
    linkContainer.className = "text-center mt-4";

    const link = document.createElement("a");
    link.textContent = "Create here!";
    link.href = "#";
    link.className = "text-blue-500 hover:underline";
    link.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState({}, "", "#register");
        renderRegister(container); // Call renderRegister when the link is clicked
    });

    linkContainer.appendChild(
        document.createTextNode("Don't have an account? ")
    );
    linkContainer.appendChild(link);

    appendLoginButton(loginForm); // As in your original code, no change here

    loginForm.appendChild(linkContainer);

    container.appendChild(loginForm);
}