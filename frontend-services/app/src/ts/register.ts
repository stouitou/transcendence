
import { appendLoginButton, handleLogin, handleRegister, renderLogout } from './auth';

import { initBallsBackground } from './background';
import { renderLogin } from './login';
import { Color4 } from 'babylonjs';

export function renderRegister(container: HTMLElement) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  initBallsBackground(container, {
    numSpheres: 30,
    sphereRadius: 1.2,
    backgroundColor: new Color4(1, 1, 1, 1),
  });
  const registerForm = document.createElement("form");
  registerForm.className = `
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

  const heading = document.createElement("h2");
  heading.textContent = "Register";
  heading.className = `
    text-3xl font-bold
    text-center
    mb-6
    text-gray-800
  `;
  registerForm.appendChild(heading);

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name:";
  nameLabel.setAttribute("for", "name");
  nameLabel.className = `
    block
    text-gray-700
    mb-2
    font-semibold
  `;
  registerForm.appendChild(nameLabel);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.id = "name";
  nameInput.placeholder = "Enter your name";
  nameInput.className = `
    w-full p-3
    border border-gray-300
    rounded-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-400
    mb-4
    bg-transparent
  `;
  registerForm.appendChild(nameInput);

  // Create Email label and input
  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email:";
  emailLabel.setAttribute("for", "email");
  emailLabel.className = `
    block
    text-gray-700
    mb-2
    font-semibold
  `;
  registerForm.appendChild(emailLabel);

  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "email";
  emailInput.placeholder = "Enter your email";
  emailInput.className = `
    w-full p-3
    border border-gray-300
    rounded-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-400
    mb-4
    bg-transparent
  `;
  registerForm.appendChild(emailInput);

  // Create Password label and input
  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "Password:";
  passwordLabel.setAttribute("for", "password");
  passwordLabel.className = `
    block
    text-gray-700
    mb-2
    font-semibold
  `;
  registerForm.appendChild(passwordLabel);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "password";
  passwordInput.placeholder = "Enter your password";
  passwordInput.className = `
    w-full p-3
    border border-gray-300
    rounded-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-400
    mb-4
    bg-transparent
  `;
  registerForm.appendChild(passwordInput);

  // Create Confirm Password label and input
  const confirmPasswordLabel = document.createElement("label");
  confirmPasswordLabel.textContent = "Confirm Password:";
  confirmPasswordLabel.setAttribute("for", "confirm-password");
  confirmPasswordLabel.className = `
    block
    text-gray-700
    mb-2
    font-semibold
  `;
  registerForm.appendChild(confirmPasswordLabel);

  const confirmPasswordInput = document.createElement("input");
  confirmPasswordInput.type = "password";
  confirmPasswordInput.id = "confirm-password";
  confirmPasswordInput.placeholder = "Confirm your password";
  confirmPasswordInput.className = `
    w-full p-3
    border border-gray-300
    rounded-md
    focus:outline-none
    focus:ring-2 focus:ring-blue-400
    mb-6
    bg-transparent
  `;
  registerForm.appendChild(confirmPasswordInput);

  // Create register button
  const registerButton = document.createElement("button");
  registerButton.type = "submit";
  registerButton.textContent = "Start your pong journey";
  registerButton.className = `
    w-full
    py-3
    border border-gray-300
    rounded-md
    hover:bg-pink-600
    transition-colors
  `;
  registerForm.appendChild(registerButton);

  // Handle form submission
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Process registration here
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log(
        "Name:",
        name,
        "Email:",
        email,
        "Password:",
        password
            ? "Password is not empty (never show password in console please)"
            : "Password is empty"
    );
    handleRegister({ name, email, password });
    // Insert your registration handling logic...
  });

  const linkContainer = document.createElement("p");
  linkContainer.className = "text-center mt-4";

  const link = document.createElement("a");
  link.textContent = "Login here!";
  link.href = "#";
  link.className = "text-blue-500 hover:underline";
  link.addEventListener("click", (e) => {
    e.preventDefault();
    history.pushState({}, "", "#login");

    renderLogin(container);
  });

  linkContainer.appendChild(
      document.createTextNode("Already have an account? ")
  );
  linkContainer.appendChild(link);
  registerForm.appendChild(linkContainer);
  container.appendChild(registerForm);
}