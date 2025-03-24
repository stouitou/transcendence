import { createButton } from "./button";
import { fetchProfileData } from "./fetchProfile";
import { getState, setState } from "./state";



const logoutProps = {
	label: "Logout",
	//onClick: handleLogout
  };

export async function renderLogout(parent: HTMLElement) {
	// Get the logoutButton element if it exists
	const button = document.getElementById("logoutButton");
	if (button) return;
	//create a new button element with the logoutProps
	const logoutButton = createButton(logoutProps);
	logoutButton.onclick = handleLogout;
	logoutButton.id = "logoutButton";
	logoutButton.className = "w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors";
	parent.appendChild(logoutButton);
}

export async function handleLogin({ email, password }: { email: string, password: string }) {
    const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    if (response.ok) {
        window.location.href = "#profile";
		await fetchProfileData();
    } else {
        console.error('Login failed');
    }
}

export async function handleRegister({ name, email, password }: { name: string, email: string, password: string }) {
    const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    });
    if (response.ok) {
        window.location.href = "#login";
    } else {
        console.error('Registration failed');
    }
}

export async function handleLogout(e: Event) {
	e.preventDefault();
    await fetch(`/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
		body: JSON.stringify({  })
    });
	setState({ user: null, isLoggedIn: false });
	//window.location.reload(); //refresh the page
    window.location.href = "#home"; //redirect to home
}

/**
 * create button props for login with provider
 * @param provider  provider name (e.g. google, github, etc.)
 * @returns  ButtonProps
 */
function loginWithProviderProps(provider: string) {
    return {
        label: `Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        onClick: () => {
            console.log(`Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`);
            handleProviderLogin(provider);
        }
    };
}

/**
 * redirect to the provider login page
 * @param provider 
 */
function handleProviderLogin(provider: string) {
    window.location.href = `/api/auth/${provider}`;
}

/**
 *  append logins button to the parent element
 * @param parent 
 */
export function appendLoginButton(parent: HTMLElement) {
	// add new button Action for login method
		const loginButtonGoogle = createButton(loginWithProviderProps('google'));
		loginButtonGoogle.className = "w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors";
	
		const loginButtonGithub = createButton(loginWithProviderProps('github'));
		loginButtonGithub.className = "w-full bg-gray-800 text-white py-3 rounded-md hover:bg-gray-900 transition-colors";
	
		const loginButton42Api = createButton(loginWithProviderProps('42api'));
		loginButton42Api.className = "w-full bg-gray-700 text-white py-3 rounded-md hover:bg-gray-900 transition-colors";
	
		parent.appendChild(loginButtonGoogle);
		parent.appendChild(loginButtonGithub);
		parent.appendChild(loginButton42Api)
}