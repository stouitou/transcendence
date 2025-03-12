true&&(function polyfill() {
    const relList = document.createElement('link').relList;
    if (relList && relList.supports && relList.supports('modulepreload')) {
        return;
    }
    for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
        processPreload(link);
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'LINK' && node.rel === 'modulepreload')
                    processPreload(node);
            }
        }
    }).observe(document, { childList: true, subtree: true });
    function getFetchOpts(link) {
        const fetchOpts = {};
        if (link.integrity)
            fetchOpts.integrity = link.integrity;
        if (link.referrerPolicy)
            fetchOpts.referrerPolicy = link.referrerPolicy;
        if (link.crossOrigin === 'use-credentials')
            fetchOpts.credentials = 'include';
        else if (link.crossOrigin === 'anonymous')
            fetchOpts.credentials = 'omit';
        else
            fetchOpts.credentials = 'same-origin';
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep)
            // ep marker = processed
            return;
        link.ep = true;
        // prepopulate the load record
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
}());

const input = '';

function createHeader(props) {
  const header = document.createElement("header");
  header.className = "bg-white-50 py-5";
  const container = document.createElement("div");
  container.className = "container mx-auto flex justify-between items-center px-7";
  const titleDiv = document.createElement("div");
  titleDiv.className = `
      text-4xl
      font-archivo
      bg-gradient-to-r  /* Gradient direction: left-to-right */
      from-black
      to-gray-500
      text-transparent  /* Make the text itself transparent */
      bg-clip-text      /* Clip the background to the text shape */
    `;
  titleDiv.textContent = props.title;
  const nav = document.createElement("nav");
  nav.className = "flex space-x-6";
  props.links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.text;
    a.className = "text-gray-600 hover:text-gray-900 transition";
    nav.appendChild(a);
  });
  container.appendChild(titleDiv);
  container.appendChild(nav);
  header.appendChild(container);
  return header;
}

function createButton(props) {
  const button = document.createElement("button");
  button.textContent = props.label;
  button.className = `
      bg-gradient-to-r 
      from-blue-400 
      to-red-500 
      hover:from-green-500 
      hover:to-blue-600 
      text-white 
      font-archivo
      py-2 
      px-4 
      rounded-full 
      shadow-lg 
      transition 
      duration-200
`;
  if (props.onClick) {
    button.addEventListener("click", props.onClick);
  }
  return button;
}

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}
function renderHome(container) {
  const heading = document.createElement("h2");
  heading.textContent = "Welcome to Plastic Pong Game";
  const paragraph = document.createElement("p");
  paragraph.textContent = "This is the home page.";
  const button = createButton({
    label: "Login",
    onClick: () => {
      window.location.hash = "#login";
    }
  });
  container.appendChild(heading);
  container.appendChild(paragraph);
  container.appendChild(button);
}
const pongGameScript = async () => {
  const script = document.createElement("script");
  script.type = "module";
  script.src = "https://localhost:4433/frontend-pong-module/src/component/pong-game.js";
  window.document.head.appendChild(script);
};
async function renderGame(container) {
  const heading = document.createElement("h2");
  heading.textContent = "Game Page";
  const paragraph = document.createElement("p");
  paragraph.textContent = "Loading game...";
  container.appendChild(heading);
  container.appendChild(paragraph);
  await pongGameScript();
  const pongHtmlElement = document.createElement("game-component");
  document.addEventListener("DOMContentLoaded", async () => {
    const canvas = window.document.getElementById("pongCanvas");
    canvas?.appendChild(pongHtmlElement);
  });
}
function renderLogin(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  const loginForm = document.createElement("form");
  loginForm.className = "max-w-sm mx-auto p-6 bg-white rounded-lg shadow-lg";
  const heading = document.createElement("h2");
  heading.textContent = "Login";
  heading.className = "text-3xl font-bold text-center mb-6 text-gray-800";
  loginForm.appendChild(heading);
  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email:";
  emailLabel.setAttribute("for", "email");
  emailLabel.className = "block text-gray-700 mb-2";
  loginForm.appendChild(emailLabel);
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailInput.id = "email";
  emailInput.placeholder = "Enter your email";
  emailInput.className = "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4";
  loginForm.appendChild(emailInput);
  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "Password:";
  passwordLabel.setAttribute("for", "password");
  passwordLabel.className = "block text-gray-700 mb-2";
  loginForm.appendChild(passwordLabel);
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "password";
  passwordInput.placeholder = "Enter your password";
  passwordInput.className = "w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6";
  loginForm.appendChild(passwordInput);
  const loginButton = document.createElement("button");
  loginButton.type = "submit";
  loginButton.textContent = "Login";
  loginButton.className = "w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors";
  loginForm.appendChild(loginButton);
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    console.log("Email:", email, "Password:", password);
  });
  container.appendChild(loginForm);
}
function renderInfo(container) {
  const heading = document.createElement("h2");
  heading.textContent = "Info Page";
  const paragraph = document.createElement("p");
  paragraph.textContent = "Information about the game goes here.";
  container.appendChild(heading);
  container.appendChild(paragraph);
}
function renderNotFound(container) {
  const heading = document.createElement("h2");
  heading.textContent = "404";
  const paragraph = document.createElement("p");
  paragraph.textContent = "Page not found.";
  container.appendChild(heading);
  container.appendChild(paragraph);
}
function router() {
  const mainElement = document.querySelector("main");
  if (!mainElement)
    return;
  clearContainer(mainElement);
  const route = window.location.hash || "#home";
  switch (route) {
    case "#home":
      renderHome(mainElement);
      break;
    case "#game":
      renderGame(mainElement);
      break;
    case "#login":
      renderLogin(mainElement);
      break;
    case "#info":
      renderInfo(mainElement);
      break;
    default:
      renderNotFound(mainElement);
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const headerElement = createHeader({
    title: "Plastic Pong Game",
    links: [
      { href: "#game", text: "Game" },
      { href: "#login", text: "Log-In" },
      { href: "#info", text: "Info" }
    ]
  });
  document.body.insertBefore(headerElement, document.body.firstChild);
  router();
  window.addEventListener("hashchange", router);
});
