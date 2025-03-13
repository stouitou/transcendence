// router.ts

import { createButton } from './button';
import {startGame} from "./pong";

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

    // Create a hero section container
    const heroSection = document.createElement('section');
    heroSection.className = "relative w-full h-screen overflow-hidden bg-black";
    container.appendChild(heroSection);

    // Create the canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.width = heroSection.clientWidth;
    canvas.height = heroSection.clientHeight;
    heroSection.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context for canvas.');
        return;
    }

    // Handle resizing
    window.addEventListener('resize', () => {
        canvas.width = heroSection.clientWidth;
        canvas.height = heroSection.clientHeight;
    });

    // Track mouse for the fog effect
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    // Particle interface
    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
    }

    // Create an array of particles
    const particles: Particle[] = createParticles(60, canvas.width, canvas.height);

    // Animation loop
    function animate() {
        // Clear the canvas fully
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw all particles
        updateParticles(particles, canvas.width, canvas.height);
        drawParticles(ctx, particles);

        // Draw the fog effect around the mouse
        drawFog(ctx, mouseX, mouseY, 80);

        requestAnimationFrame(animate);
    }
    animate();

    // Create a content container for heading, text, and a button
    const content = document.createElement('div');
    content.className = "relative z-10 flex flex-col items-center justify-center w-full h-full text-center text-white pointer-events-none";

    const heading = document.createElement('h2');
    heading.textContent = 'PONG GAME';
    heading.className = "text-3xl md:text-5xl font-bold mb-4 pointer-events-auto";
    content.appendChild(heading);

    // Example button
    const enterButton = document.createElement('button');
    enterButton.textContent = "CLICK TO START PLAYING";
    enterButton.className = "px-6 py-3 bg-white text-black rounded-md hover:bg-gray-300 transition-colors pointer-events-auto";
    enterButton.addEventListener('click', () => {
        window.location.hash = '#login';
    });
    content.appendChild(enterButton);

    heroSection.appendChild(content);

    // --- Helper Functions Below ---

    // Creates an array of particles
    function createParticles(count: number, width: number, height: number): Particle[] {
        const arr: Particle[] = [];
        for (let i = 0; i < count; i++) {
            arr.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 5, // small random velocity
                vy: (Math.random() - 0.5) * 5,
                size: 2 + Math.random() * 4,     // random size
            });
        }
        return arr;
    }

    /**
     * Moves particles and bounces them off the edges, like a Pong ball.
     */
    function updateParticles(particles: Particle[], width: number, height: number) {
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce horizontally
            if (p.x < 0) {
                p.x = 0;
                p.vx *= -1; // reverse horizontal velocity
            } else if (p.x > width) {
                p.x = width;
                p.vx *= -1;
            }

            // Bounce vertically
            if (p.y < 0) {
                p.y = 0;
                p.vy *= -1; // reverse vertical velocity
            } else if (p.y > height) {
                p.y = height;
                p.vy *= -1;
            }
        }
    }

    // Draws the particles as small, soft circles
    function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
        ctx.save();
        ctx.fillStyle = 'white';
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * Creates a foggy “window” effect around the mouse
     * This version uses 'screen' blend for a hazy highlight
     */
    function drawFog(ctx: CanvasRenderingContext2D, mx: number, my: number, radius: number) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
        gradient.addColorStop(0, 'rgba(255,255,255,0.15)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.02)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.save();
        ctx.globalCompositeOperation = 'screen'; // or 'lighter'
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mx, my, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    }
}



function renderGame(container: HTMLElement) {
    const heading = document.createElement('h2');
    heading.textContent = 'Game Page';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Loading game...';
    startGame();
    container.appendChild(heading);
    container.appendChild(paragraph);
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
    
    linkContainer.appendChild(document.createTextNode("Don't have an account? "));
    linkContainer.appendChild(link);
    loginForm.appendChild(linkContainer);

    container.appendChild(loginForm);
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

        console.log("Name:", name, "Email:", email, "Password:", password);
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
        case '#register':
            renderRegister(mainElement);
            break;
        default:
            renderNotFound(mainElement);
            break;
    }
}
