// router.ts

import { createButton } from './button';
import {startGame} from "./pong";

function clearContainer(container: HTMLElement) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function renderHome(container: HTMLElement) {
    const heading = document.createElement('h2');
    heading.textContent = 'Welcome to Plastic Pong Game';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'This is the home page.';

    const button = createButton({
        label: 'Login',
        onClick: () => {
            window.location.hash = '#login';
        }
    });

    container.appendChild(heading);
    container.appendChild(paragraph);
    container.appendChild(button);
}

/**
 * This function is used to load the pong game component.
 * It creates a script element and appends it to the head of the document.
 */
const pongGameScript = async () => {
	const script = document.createElement('script');
    // const canvas = document.getElementById("pongCanvas");
	script.type = 'module';
	script.src = 'https://localhost:4433/frontend-pong-module/src/component/oneVSone.js';
    window.document.head.appendChild(script);
};

// async function renderGame (container: HTMLElement) {
//     const   heading = document.createElement('h2');
//     heading.textContent = 'Game Page';
//     container.appendChild(heading);

//     const   canvas = document.createElement("canvas");
//     if (!canvas)
//         throw new Error("No canvas found in the document") ;
//     canvas.id = "canvas";
//     const   gameContainer = document.createElement("div");
//     gameContainer.id = "gameContainer";
//     gameContainer.style.height = `${canvas.height}`;
//     gameContainer.style.width = `${canvas.width}`;
//     gameContainer.appendChild(canvas);
    
    
//     document.addEventListener('DOMContentLoaded',async () => {
//         const   pongHtmlElement = document.createElement("game-component");
//         gameContainer.appendChild(pongHtmlElement);
//     });

//     await pongGameScript(canvas);
// }

async function renderGame(container: HTMLElement) {
    const heading = document.createElement('h2');
    heading.textContent = 'Game Page';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Loading game...';
   // startGame();
    container.appendChild(heading);
    container.appendChild(paragraph);

    await pongGameScript();
    const pongHtmlElement = document.createElement("game-component")

    // Wait for the DOM to load before running the game. 
    // to prevent the error "Uncaught TypeError: Cannot read properties of null (reading 'getContext')"
    document.addEventListener('DOMContentLoaded',async () => {
      const canvas = window.document.getElementById("pongCanvas") as HTMLCanvasElement | null;
      canvas?.appendChild(pongHtmlElement);
    });
}

function renderLogin(container: HTMLElement) {
    // Clear container if needed.
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create form element
    const loginForm = document.createElement("form");
    loginForm.className = "max-w-sm mx-auto p-6 bg-white rounded-lg shadow-lg";

    // Create heading
    const heading = document.createElement("h2");
    heading.textContent = "Login";
    heading.className = "text-3xl font-bold text-center mb-6 text-gray-800";
    loginForm.appendChild(heading);

    // Create Email label and input container
    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Email:";
    emailLabel.setAttribute("for", "email");
    emailLabel.className = "block text-gray-700 mb-2";
    loginForm.appendChild(emailLabel);

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.placeholder = "Enter your email";
    emailInput.className =
        "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4";
    loginForm.appendChild(emailInput);

    // Create Password label and input container
    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "Password:";
    passwordLabel.setAttribute("for", "password");
    passwordLabel.className = "block text-gray-700 mb-2";
    loginForm.appendChild(passwordLabel);

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.placeholder = "Enter your password";
    passwordInput.className =
        "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6";
    loginForm.appendChild(passwordInput);

    // Create login button
    const loginButton = document.createElement("button");
    loginButton.type = "submit";
    loginButton.textContent = "Login";
    loginButton.className =
        "w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors";
    loginForm.appendChild(loginButton);

    // Optionally, add a submit event listener for the form.
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Process the login here, e.g., collect email and password values and send them to your server.
        const email = emailInput.value;
        const password = passwordInput.value;
        console.log("Email:", email, "Password:", password);
        // Insert your login handling logic...
    });

    container.appendChild(loginForm);
}

function renderInfo(container: HTMLElement) {
    const heading = document.createElement('h2');
    heading.textContent = 'Info Page';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Information about the game goes here.';

    container.appendChild(heading);
    container.appendChild(paragraph);
}

function renderNotFound(container: HTMLElement) {
    const heading = document.createElement('h2');
    heading.textContent = '404';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Page not found.';

    container.appendChild(heading);
    container.appendChild(paragraph);
}

// Main router function.
export function router() {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    clearContainer(mainElement);

    // Use the hash to determine the route; default to home.
    const route = window.location.hash || '#home';

    switch (route) {
        case '#home':
            renderHome(mainElement);
            break;
        case '#game':
            renderGame(mainElement);
            break;
        case '#login':
            renderLogin(mainElement);
            break;
        case '#info':
            renderInfo(mainElement);
            break;
        default:
            renderNotFound(mainElement);
            break;
    }
}
