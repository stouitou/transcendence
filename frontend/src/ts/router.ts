// router.ts

import { createButton } from './button';
import {startGame} from "./pong";

function clearContainer(container: HTMLElement) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

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

export function renderHome(container: HTMLElement) {
    // 1) Clear existing DOM content
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // 2) Create a full-size canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-screen block';
    container.appendChild(canvas);

    // 3) Babylon engine & scene
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    // White background for high contrast
    scene.clearColor = new Color4(1, 1, 1, 1);

    // 4) Orthographic camera
    const camera = new FreeCamera('camera', new Vector3(0, 0, 50), scene);
    camera.setTarget(Vector3.Zero());
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

    let baseOrthoSize = 30;
    function updateCameraOrtho() {
        const rect = engine.getRenderingCanvasClientRect();
        const aspect = rect.width / rect.height;

        camera.orthoTop = baseOrthoSize;
        camera.orthoBottom = -baseOrthoSize;
        camera.orthoLeft = -baseOrthoSize * aspect;
        camera.orthoRight = baseOrthoSize * aspect;
    }
    updateCameraOrtho();

    // 5) Light for some shading
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // 6) Define your “pastel” color materials (as you specified)
    const matPastelPink = new StandardMaterial('matPastelPink', scene);
    matPastelPink.diffuseColor = Color3.FromHexString('#ff0063');
    matPastelPink.specularColor = new Color3(0.3, 0.3, 0.3);

    const matPastelYellow = new StandardMaterial('matPastelYellow', scene);
    matPastelYellow.diffuseColor = Color3.FromHexString('#ff0000');
    matPastelYellow.specularColor = new Color3(0.3, 0.3, 0.3);

    const matPastelGreen = new StandardMaterial('matPastelGreen', scene);
    matPastelGreen.diffuseColor = Color3.FromHexString('#00ffa1');
    matPastelGreen.specularColor = new Color3(0.3, 0.3, 0.3);

    const matPastelBlue = new StandardMaterial('matPastelBlue', scene);
    matPastelBlue.diffuseColor = Color3.FromHexString('#0032ff');
    matPastelBlue.specularColor = new Color3(0.3, 0.3, 0.3);

    const matPastelPurple = new StandardMaterial('matPastelPurple', scene);
    matPastelPurple.diffuseColor = Color3.FromHexString('#d7b5ff');
    matPastelPurple.specularColor = new Color3(0.3, 0.3, 0.3);

    const matPastelPeach = new StandardMaterial('matPastelPeach', scene);
    matPastelPeach.diffuseColor = Color3.FromHexString('#FFD1BA');
    matPastelPeach.specularColor = new Color3(0.3, 0.3, 0.3);

    // Put them into an array
    const ballMaterials = [
        matPastelPink,
        matPastelYellow,
        matPastelGreen,
        matPastelBlue,
        matPastelPurple,
        matPastelPeach
    ];

    // 7) We'll store ball data here
    interface Ball {
        mesh: BABYLON.Mesh;
        vx: number;
        vy: number;
        radius: number;
    }
    const balls: Ball[] = [];

    // 8) Create & spawn the balls
    const NUM_SPHERES = 50;
    const SPHERE_RADIUS = 1;

    function spawnBalls(count: number) {
        for (let i = 0; i < count; i++) {
            // Build the sphere
            const sphere = MeshBuilder.CreateSphere(
                `sphere_${i}`,
                { diameter: SPHERE_RADIUS * 2, segments: 24 },
                scene
            );

            // Pick a random neon/pastel material
            const randomMat = ballMaterials[Math.floor(Math.random() * ballMaterials.length)];
            sphere.material = randomMat;

            // Random position within the current camera bounds
            const bounds = getCameraBounds();
            sphere.position.x = randomRange(bounds.left + SPHERE_RADIUS, bounds.right - SPHERE_RADIUS);
            sphere.position.y = randomRange(bounds.bottom + SPHERE_RADIUS, bounds.top - SPHERE_RADIUS);
            sphere.position.z = 0;

            // Random velocity
            const vx = randomRange(-0.2, 0.2);
            const vy = randomRange(-0.2, 0.2);

            balls.push({ mesh: sphere, vx, vy, radius: SPHERE_RADIUS });
        }
    }
    spawnBalls(NUM_SPHERES);

    // 9) Animate & collisions
    scene.onBeforeRenderObservable.add(() => {
        const dt = engine.getDeltaTime() * 0.001;
        const { left, right, top, bottom } = getCameraBounds();

        // Move & bounce on edges
        for (const b of balls) {
            b.mesh.position.x += b.vx * dt * 60;
            b.mesh.position.y += b.vy * dt * 60;

            if (b.mesh.position.x > right - b.radius) {
                b.mesh.position.x = right - b.radius;
                b.vx *= -1;
            } else if (b.mesh.position.x < left + b.radius) {
                b.mesh.position.x = left + b.radius;
                b.vx *= -1;
            }
            if (b.mesh.position.y > top - b.radius) {
                b.mesh.position.y = top - b.radius;
                b.vy *= -1;
            } else if (b.mesh.position.y < bottom + b.radius) {
                b.mesh.position.y = bottom + b.radius;
                b.vy *= -1;
            }
        }

        // 2D sphere-sphere collisions
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                resolveCollision2D(balls[i], balls[j]);
            }
        }
    });

    // 10) Render loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    // 11) Handle resizing
    window.addEventListener('resize', () => {
        engine.resize();
        updateCameraOrtho();
    });

    // 12) Add a centered overlay (header + button)
    addCenteredOverlay(container);

    // --- Helper Functions ---

    function getCameraBounds() {
        return {
            left: camera.orthoLeft,
            right: camera.orthoRight,
            top: camera.orthoTop,
            bottom: camera.orthoBottom
        };
    }

    function randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    function resolveCollision2D(a: Ball, b: Ball) {
        const dx = b.mesh.position.x - a.mesh.position.x;
        const dy = b.mesh.position.y - a.mesh.position.y;
        const distSq = dx * dx + dy * dy;
        const radiusSum = a.radius + b.radius;

        if (distSq <= radiusSum * radiusSum) {
            const dist = Math.sqrt(distSq) || 0.00001;
            const nx = dx / dist;
            const ny = dy / dist;

            const vaDot = a.vx * nx + a.vy * ny;
            const vbDot = b.vx * nx + b.vy * ny;
            // Swap the normal components for perfect elastic collision
            const aFactor = vbDot - vaDot;
            const bFactor = vaDot - vbDot;

            a.vx += aFactor * nx;
            a.vy += aFactor * ny;
            b.vx += bFactor * nx;
            b.vy += bFactor * ny;

            // Slight separation so they don't stick
            const overlap = radiusSum - dist;
            a.mesh.position.x -= (overlap * 0.5) * nx;
            a.mesh.position.y -= (overlap * 0.5) * ny;
            b.mesh.position.x += (overlap * 0.5) * nx;
            b.mesh.position.y += (overlap * 0.5) * ny;
        }
    }

    /**
     * Creates a centered overlay with a heading + "Let's start" button
     * The button navigates to #login when clicked.
     */
    function addCenteredOverlay(parent: HTMLElement) {
        // Container overlay
        const overlay = document.createElement('div');
        overlay.className = `
          absolute top-0 left-0
          w-full h-full
          flex flex-col items-center justify-center
          pointer-events-none
          z-10`;
        // "Let's Start" button
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

        // Make parent container "relative" so absolute overlay is anchored here
        parent.classList.add('relative');
        parent.appendChild(overlay);
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
