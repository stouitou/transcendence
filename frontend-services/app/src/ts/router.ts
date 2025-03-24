// router.ts

import { appendLoginButton, handleLogin, handleRegister, renderLogout } from './auth';
import { fetchProfileData } from './fetchProfile';
import { getState } from './state';

import { createButton } from './button';
import {startGame} from "./pong";
import {
    Engine,
    Scene,
    FreeCamera,
    Camera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4
} from 'babylonjs';

import { initBallsBackground } from './background'; // your path


const user = {
    avatar: "grr", 
    name: "bob", 
    role: "admin", 
    createdAt: "Today" 
}

function clearContainer(container: HTMLElement) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}


export function renderHome(container: HTMLElement) {
    // Clear existing content
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Mark container as relative, so absolutely positioned elements anchor properly
    container.classList.add('relative');

    // 1) Initialize the background
    const { engine, scene, camera, canvas } = initBallsBackground(container, {
        numSpheres: 50,
        sphereRadius: 1,
        backgroundColor: new Color4(1, 1, 1, 1)
        // materials?: [... your custom StandardMaterials ...]
    });

    // 2) Create your overlay
    const overlay = document.createElement('div');
    overlay.className = `
    absolute top-0 left-0
    w-full h-full
    flex flex-col items-center justify-center
    pointer-events-none
    z-10
  `;
    container.appendChild(overlay);

    // Example "Let's Start" button
    const btn = document.createElement('button');
    btn.textContent = 'Let’s Start';
    btn.className = `
    px-10 py-3
    font-archivo
    text-black
    border border-black
    rounded-md
    pointer-events-auto
    transition-colors duration-300
    hover:bg-black hover:text-white
    focus:outline-none
  `;
    btn.addEventListener('click', () => {
        window.location.hash = '#login';
    });
    overlay.appendChild(btn);
}

const pongGameScript = async () => {
	const script = document.createElement('script');
    // const canvas = document.getElementById("pongCanvas");
	script.type = 'module';
	script.src = 'https://localhost:4433/frontend-pong-module/app/src/component/oneVSone.ts';
    window.document.head.appendChild(script);
};

function renderGame(container: HTMLElement) {
    // Clear container if needed
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create game wrapper div
    const gameWrapper = document.createElement("div");
    gameWrapper.className = "flex flex-col items-center justify-center space-y-4";

    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.id = "pongCanvas";
    canvas.width = 600;
    canvas.height = 500;
    canvas.className = "shadow-lg rounded-lg";

    // Create Start Game button
    const startButton = document.createElement("button");
    startButton.textContent = "Start Game";
    startButton.className = "mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition";
    
    const startTournamentButton = document.createElement("button");
    startTournamentButton.textContent = "Start Tournament";
    startTournamentButton.className = "px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-green-600 transition";

    // Add event listener to start game
    startButton.addEventListener("click", () => {
        if (typeof startGame === "function") {
            const gameComponent = document.createElement("game-component");
            gameComponent.setAttribute("canvasId", "pongCanvas");
            container.appendChild(gameComponent);
            pongGameScript();
            startButton.remove();
            startTournamentButton.remove();
        } else {
            console.error("startGame function is not defined!");
        }
    });

    startTournamentButton.addEventListener("click", () => {
        if (typeof renderTournament === "function") {
            renderTournament(container);
        } else {
            console.error("renderTournament function is not defined!");
        }
    })
    // Append elements to wrapper
    gameWrapper.appendChild(canvas);
    gameWrapper.appendChild(startButton);
    gameWrapper.appendChild(startTournamentButton);

    // Append game wrapper to container
    container.appendChild(gameWrapper);
}

function renderTournament(container: HTMLElement) {
    // Clear container if needed
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create tournament wrapper div
    const tournamentWrapper = document.createElement("div");
    tournamentWrapper.className = "flex flex-col items-center justify-center space-y-4";

    // Create heading
    const heading = document.createElement("h2");
    heading.textContent = "Tournament Mode";
    heading.className = "text-3xl font-bold text-center mb-6 text-gray-800";

    // Create tournament info paragraph
    const infoText = document.createElement("p");
    infoText.textContent = "Get ready for the tournament! Players will compete to be the champion.";
    infoText.className = "text-lg text-gray-600 text-center max-w-md";

    // Create Start Tournament button
    const startTournamentButton = document.createElement("button");
    startTournamentButton.textContent = "Start Tournament";
    startTournamentButton.className = "px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition";

    // Event listener for Start Tournament
    startTournamentButton.addEventListener("click", () => {
        // if (typeof startTournament === "function") {
        //     startTournament();
        //     startTournamentButton.remove();
        // } else {
        //     console.error("startTournament function is not defined!");
        // }
    });

    // Append elements to wrapper
    tournamentWrapper.appendChild(heading);
    tournamentWrapper.appendChild(infoText);
    tournamentWrapper.appendChild(startTournamentButton);

    // Append tournament wrapper to container
    container.appendChild(tournamentWrapper);
}


export function renderLogin(container: HTMLElement) {
    // 1) Clear container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // 2) Ensure container is positioned relative for layering
    container.classList.add('relative');

    // 3) Initialize your Babylon "balls" background
    initBallsBackground(container, {
        numSpheres: 30,
        sphereRadius: 1.2,
        backgroundColor: new Color4(1, 1, 1, 1)
    });

    // 4) Create an overlay to center the login form
    const overlay = document.createElement('div');
    overlay.className = `
    absolute
    top-0 left-0
    w-full h-full
    flex items-center justify-center
    pointer-events-none
    z-10
  `;
    container.appendChild(overlay);

    // 5) Build the login form
    const loginForm = document.createElement('form');
    loginForm.className = `
    pointer-events-auto
    w-full max-w-sm
    px-8 py-6
    bg-white/30
    backdrop-blur-md
    border border-white/20
    rounded-lg
    shadow-md
    text-gray-800
    font-archivo
  `;
    overlay.appendChild(loginForm);

    // 6) Heading
    const heading = document.createElement('h2');
    heading.textContent = 'Login';
    heading.className = `
    text-3xl
    font-bold
    mb-6
    text-center
    tracking-wide
  `;
    loginForm.appendChild(heading);

    // 7) Email label & input
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    emailLabel.className = `
    block
    text-sm
    font-semibold
    mb-1
  `;
    loginForm.appendChild(emailLabel);

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Enter your email';
    emailInput.className = `
    w-full
    border-b border-gray-300
    bg-transparent
    px-2 py-2
    mb-6
    focus:outline-none
    focus:border-blue-500
    transition-colors
  `;
    loginForm.appendChild(emailInput);

    // 8) Password label & input
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Password';
    passwordLabel.className = `
    block
    text-sm
    font-semibold
    mb-1
  `;
    loginForm.appendChild(passwordLabel);

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Enter your password';
    passwordInput.className = `
    w-full
    border-b border-gray-300
    bg-transparent
    px-2 py-2
    mb-6
    focus:outline-none
    focus:border-blue-500
    transition-colors
  `;
    loginForm.appendChild(passwordInput);

    // 9) Login button
    const loginButton = document.createElement('button');
    loginButton.type = 'submit';
    loginButton.textContent = 'Login';
    loginButton.className = `
    w-full
    py-3
    border border-black
    text-black
    rounded-md
    transition-colors
    duration-300
    hover:bg-black
    hover:text-white
    focus:outline-none
    font-semibold
    tracking-wide
  `;
    loginForm.appendChild(loginButton);

    // Optionally, add a submit event listener for the form.
    loginForm.addEventListener("submit", async(e) => {
        e.preventDefault();
        // Process the login here, e.g., collect email and password values and send them to your server.
        const email = emailInput.value;
        const password = passwordInput.value;
        console.log("Email:", email, "Password:", password?"Password is not empty (never show password in console please)":"Password is empty");
        await handleLogin({ email, password });
        // Insert your login handling logic...
    });

    // 10) “Don’t have an account?” link
    const linkContainer = document.createElement('p');
    linkContainer.className = 'text-center mt-6 text-sm';

    const registerLink = document.createElement('a');
    registerLink.textContent = 'Create here!';
    registerLink.href = '#';
    registerLink.className = 'text-blue-500 hover:underline ml-1';
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState({}, '', '#register');
        renderRegister(container);
    });
    
    linkContainer.appendChild(document.createTextNode("Don't have an account? "));
    linkContainer.appendChild(link);

    appendLoginButton(loginForm);

    loginForm.appendChild(linkContainer);
}

function renderRegister(container: HTMLElement) {
    // Clear container if needed
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create form element
    const registerForm = document.createElement("form");
    registerForm.className = "max-w-sm mx-auto p-6 bg-white rounded-lg shadow-lg";

    // Create heading
    const heading = document.createElement("h2");
    heading.textContent = "Register";
    heading.className = "text-3xl font-bold text-center mb-6 text-gray-800";
    registerForm.appendChild(heading);

    // Create Name label and input
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Name:";
    nameLabel.setAttribute("for", "name");
    nameLabel.className = "block text-gray-700 mb-2";
    registerForm.appendChild(nameLabel);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "name";
    nameInput.placeholder = "Enter your name";
    nameInput.className =
        "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4";
    registerForm.appendChild(nameInput);

    // Create Email label and input
    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Email:";
    emailLabel.setAttribute("for", "email");
    emailLabel.className = "block text-gray-700 mb-2";
    registerForm.appendChild(emailLabel);

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.placeholder = "Enter your email";
    emailInput.className =
        "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4";
    registerForm.appendChild(emailInput);

    // Create Password label and input
    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "Password:";
    passwordLabel.setAttribute("for", "password");
    passwordLabel.className = "block text-gray-700 mb-2";
    registerForm.appendChild(passwordLabel);

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.placeholder = "Enter your password";
    passwordInput.className =
        "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4";
    registerForm.appendChild(passwordInput);

    // Create Confirm Password label and input
    const confirmPasswordLabel = document.createElement("label");
    confirmPasswordLabel.textContent = "Confirm Password:";
    confirmPasswordLabel.setAttribute("for", "confirm-password");
    confirmPasswordLabel.className = "block text-gray-700 mb-2";
    registerForm.appendChild(confirmPasswordLabel);

    const confirmPasswordInput = document.createElement("input");
    confirmPasswordInput.type = "password";
    confirmPasswordInput.id = "confirm-password";
    confirmPasswordInput.placeholder = "Confirm your password";
    confirmPasswordInput.className =
        "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6";
    registerForm.appendChild(confirmPasswordInput);

    // Create register button
    const registerButton = document.createElement("button");
    registerButton.type = "submit";
    registerButton.textContent = "Register";
    registerButton.className =
        "w-full bg-blue-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors";
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

        console.log("Name:", name, "Email:", email, "Password:", password?"Password is not empty (never show password in console please)":"Password is empty");
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

    linkContainer.appendChild(document.createTextNode("Already have an account? "));
    linkContainer.appendChild(link);
    registerForm.appendChild(linkContainer);
    container.appendChild(registerForm);
}


function renderInfo(container: HTMLElement) {
    const heading = document.createElement('h2');
    heading.textContent = 'Info Page';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Information about the game goes here.';

    container.appendChild(heading);
    container.appendChild(paragraph);
}

function renderProfile(container: HTMLElement, user: { 
    avatar: string, 
    name: string, 
    role: string, 
    createdAt: string 
}){
    if (!getState().user) fetchProfileData();

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create profile card container
    const profileCard = document.createElement("div");
    profileCard.className = "max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center";

    const avatarImg = document.createElement("img");
    avatarImg.src = user.avatar;
    avatarImg.alt = "User Avatar";
    avatarImg.className = "w-24 h-24 mx-auto rounded-full border-4 border-gray-300 mb-4";
    profileCard.appendChild(avatarImg);

    const nameElement = document.createElement("h2");
    nameElement.textContent = user.name;
    nameElement.className = "text-2xl font-semibold text-gray-800";
    profileCard.appendChild(nameElement);

    const roleElement = document.createElement("p");
    roleElement.textContent = `Role: ${user.role}`;
    roleElement.className = `text-lg font-medium mt-2 ${user.role === "admin" ? "text-red-500" : "text-blue-500"}`;
    profileCard.appendChild(roleElement);

    const createdAtElement = document.createElement("p");
    createdAtElement.textContent = `Joined: ${new Date(user.createdAt).toLocaleDateString()}`;
    createdAtElement.className = "text-gray-600 text-sm mt-2";
    profileCard.appendChild(createdAtElement);

    // View Game History Button
    const historyButton = document.createElement("button");
    historyButton.textContent = "View Game History";
    historyButton.className = "mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors";
    historyButton.addEventListener("click", () => renderGameHistory(container, user.name));
    profileCard.appendChild(historyButton);

    // Append profile card to container
    container.appendChild(profileCard);
    
    if (getState().isLoggedIn)  renderLogout(container);
}

function renderGameHistory(container: HTMLElement, username: string) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const title = document.createElement("h2");
    title.textContent = `${username}'s Game History`;
    title.className = "text-2xl font-semibold text-center text-gray-800 mb-4";
    container.appendChild(title);

    // Example game history (replace with real data from API)
    const gameHistory = [
        { date: "2024-02-20", result: "Win" },
        { date: "2024-02-18", result: "Loss" },
        { date: "2024-02-15", result: "Win" }
    ];

    // Create list container
    const listContainer = document.createElement("div");
    listContainer.className = "max-w-md mx-auto bg-white rounded-lg shadow-md p-4";

    // Generate history items
    gameHistory.forEach(game => {
        const gameItem = document.createElement("p");
        gameItem.textContent = `📅 ${game.date} - ${game.result}`;
        gameItem.className = game.result === "Win" ? "text-green-500" : "text-red-500";
        listContainer.appendChild(gameItem);
    });

    container.appendChild(listContainer);
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

    const state = getState();
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
        case '#register':
            renderRegister(mainElement);
            break;
        case '#profile':
            renderProfile(mainElement, state.user??user);
            break;
        default:
            renderNotFound(mainElement);
            break;
    }
}
