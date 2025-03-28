// router.ts

import { appendLoginButton, handleLogin, handleRegister, renderLogout } from './auth';
import { fetchProfileData } from './fetchProfile';
import { getState } from './state';
import { renderRegister } from './register';             // your register screen
import { renderLogin } from './login';

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
    clearContainer(container);
    // while (container.firstChild) {
    //     container.removeChild(container.firstChild);
    // }

    // Mark container as relative, so absolutely positioned elements anchor properly
    container.classList.add('relative');

    const { engine, scene, camera, canvas } = initBallsBackground(container, {
        numSpheres: 50,
        sphereRadius: 1,
        backgroundColor: new Color4(1, 1, 1, 1)
    });

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
    btn.textContent = 'Let’s play';
    btn.className = `
    px-10 py-3
    font-archivo
    text-black
    border border-none
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
	script.type = 'module';
	script.src = 'https://localhost:4433/frontend-pong-module/app/src/component/oneVSone.ts';
    window.document.head.appendChild(script);
};

const pongTournamentScript = async () => {
	const script = document.createElement('script');
	script.type = 'module';
	script.src = 'https://localhost:4433/frontend-pong-module/app/src/component/tournamentGame.ts';
    window.document.head.appendChild(script);
};

function renderGame(container: HTMLElement) {
    // Clear container if needed
    clearContainer(container);
    // while (container.firstChild) {
    //     container.removeChild(container.firstChild);
    // }

    // Create game wrapper div
    const gameWrapper = document.createElement("div");
    gameWrapper.id = "gameWrapper";
    gameWrapper.className = "flex flex-col items-center justify-center space-y-4 min-w-[700px] min-h-[500px] bg-black";

    // Append game wrapper to container
    container.appendChild(gameWrapper);

    // Create canvas element
    // const canvas = document.createElement("canvas");
    // canvas.id = "pongCanvas";
    // canvas.width = 600;
    // canvas.height = 500;
    // canvas.className = "shadow-lg rounded-lg";

    // Create Start Game button
    const startButton = document.createElement("button");
    startButton.textContent = "Start Game";
    startButton.className = "mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition";
    
    const startMultiplayerButton = document.createElement("button");
    startMultiplayerButton.textContent = "Start Multiplayer";
    startMultiplayerButton.className = "px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-green-600 transition";

    const startTournamentButton = document.createElement("button");
    startTournamentButton.textContent = "Start Tournament";
    startTournamentButton.className = "px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-green-600 transition";

    // Add event listener to start game
    startButton.addEventListener("click", () => {
        if (typeof startGame === "function") {
            pongGameScript();
            const gameComponent = document.createElement("game-component");
            // gameComponent.setAttribute("canvasId", "pongCanvas");
            container.appendChild(gameComponent);
            startButton.remove();
            startMultiplayerButton.remove();
            startTournamentButton.remove();
        } else {
            console.error("startGame function is not defined!");
        }
    });

    startTournamentButton.addEventListener("click", () => {
        if (typeof renderTournament === "function") {
            // renderTournament(container);
            pongTournamentScript();
            const gameComponent = document.createElement("tournament-component");
            container.appendChild(gameComponent);
            startButton.remove();
            startMultiplayerButton.remove();
            startTournamentButton.remove();
        } else {
            console.error("renderTournament function is not defined!");
        }
    })
    // Append elements to wrapper
    // gameWrapper.appendChild(canvas);
    gameWrapper.appendChild(startButton);
    gameWrapper.appendChild(startMultiplayerButton);
    gameWrapper.appendChild(startTournamentButton);

    // // Append game wrapper to container
    // container.appendChild(gameWrapper);
}

function renderTournament(container: HTMLElement) {
    // Clear container if needed
    clearContainer(container);
    // while (container.firstChild) {
    //     container.removeChild(container.firstChild);
    // }

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
    if (!mainElement)
        return ;

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
