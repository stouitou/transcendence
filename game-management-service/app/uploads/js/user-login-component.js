import GlobalState from './GlobalState.js';
import GlobalWs from './GlobalWs.js';

class UserLogin extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" }); // Isolation du style
    }

    connectedCallback() {
        this.render();
        // Écouter l'événement personnalisé 'profile-data-updated'
        document.addEventListener('profile-data-updated', (event) => {
            console.log('view component Profile data received:', event.detail.profileData);
            // Utiliser les données du profil utilisateur
            this.updateLoginButton(event.detail.profileData);
        });
        // Écouter l'événement personnalisé 'logout-success'
        document.addEventListener('logout-success', () => {
            this.render();
            GlobalWs.sendLogoutMessage();
        });
    }

    updateLoginButton(profileData) {
        if (profileData) {
            this.shadowRoot.innerHTML = `
            <div class="container">
               <form id="logoutForm">
                <h2 class="title">Logout</h2>
                <div class="content">
                    <div class="form-group">
                       <button type="submit">Logout</button>
                    </div>
                </div>
                </form>
            </div>
            `;
            this.shadowRoot.querySelector('#logoutForm').addEventListener('submit', this.handleLogout.bind(this));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const email = this.shadowRoot.querySelector('#email').value;
        const password = this.shadowRoot.querySelector('#password').value;

        try {
            const response = await fetch(`/api/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Émettre un événement personnalisé pour informer le composant profil
                GlobalState.setAuthData(data);
                const event = new CustomEvent('login-success', {
                    bubbles: true, // Permettre la propagation de l'événement
                    composed: true, // Permettre la traversée des shadow DOM
                    detail: { token: data.token }
                });
                document.dispatchEvent(event);
            } else {
                console.error('Failed to login');
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    }

    async handleLogout(event) {
        event.preventDefault();
        try {
            const response = await fetch(`/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: "GlobalState.getAuthData().token" })
            });
            if (response.ok) {
                GlobalState.setLogoutSuccess();
                this.render();
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
    handleProviderLogin(provider) {
        window.location.href = `/api/auth/${provider}`;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <div class="container">
                <form id="loginForm">
                    <h2 class="title">Login</h2>
                    <div class="content">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" name="email" id="email" required value="jack@mail.com">
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" name="password" id="password" required value="stringst">
                        </div>
                        <button type="submit">Login</button>
                    </div>
                </form>
                <div class="provider-login">
                    <button id="googleLogin">Login with Google</button>
                    <button id="githubLogin">Login with GitHub</button>
                    <button id="ftapi">Login with 42 api</button>
                </div>
            </div>
            `;
        this.shadowRoot.querySelector('form').addEventListener('submit', this.handleSubmit.bind(this));
        this.shadowRoot.querySelector('#googleLogin').addEventListener('click', () => this.handleProviderLogin('google'));
        this.shadowRoot.querySelector('#githubLogin').addEventListener('click', () => this.handleProviderLogin('github'));
        this.shadowRoot.querySelector('#ftapi').addEventListener('click', () => this.handleProviderLogin('42api'));
    
        
    }
}

// Déclarer le composant dans le DOM
customElements.define("user-login-section", UserLogin);