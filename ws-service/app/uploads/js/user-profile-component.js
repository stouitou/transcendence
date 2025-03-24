import GlobalState from './GlobalState.js';

class UserProfile extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" }); // Isolation du style
		this.profileData = null; // Stocker les données du profil utilisateur
		this.currentId = null; // Stocker l'ID actuel pour éviter les appels multiples
    }

    static get observedAttributes() {
        return ['id'];
    }
	attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'id' && newValue !== this.currentId) {
            this.currentId = newValue;
            this.fetchProfileData(); // Récupérer les données du profil utilisateur
        }
    }
	connectedCallback() {
        this.render();
       /*  window.addEventListener("message", (event) => {
            if (event.data.action === "updated") {
                this.refresh();
            }
        }); */

        // Écouter l'événement personnalisé 'login-success'
		document.addEventListener('login-success', (e) => {
			console.log('Received login-success event', e.detail.token);
			this.refresh();
		});
		// Écouter l'événement personnalisé 'logout-success'
		document.addEventListener('logout-success', (e) => {
			console.log('Received logout-success event');
			this.profileData = null;
			this.render();
		});
    }
    async fetchProfileData() {
		// verifier si un token est présent
		/* if (!GlobalState.getAuthData()?.token) {
			return;
		} */
		/* if (!localStorage.getItem('token')) {
			return;
		} */
        try {
            const response = await fetch(`/api/users/me`);
            if (response.ok) {
                this.profileData = await response.json();
				GlobalState.setProfileData( this.profileData);
                this.render();
            } else {
                console.error('Failed to fetch profile data');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    render() {
        if (!this.profileData) {
            this.shadowRoot.innerHTML = `
                <div class="container">
                    <h2>Chargement du profil de l'utilisateur id: ${this.currentId}...</h2>
                </div>
            `;
        } else {
            this.shadowRoot.innerHTML = `
                <div class="container">
                    <h2>Profil de l'utilisateur id: ${this.currentId}</h2>
                    <p>Nom: ${this.profileData.name}</p>
                    <p>Rôle: ${this.profileData.role}</p>
                    <p>Level: ${this.profileData.level}</p>
                    <p>Avatar: ${this.profileData.avatar}</p>
                    <p>Créé le: ${this.profileData.created_at}</p>
                    <p>Modifié le: ${this.profileData.updated_at}</p>
                    <!-- Ajoutez d'autres informations du profil utilisateur ici -->
                </div>
            `;
        }
    }

    refresh() {
        this.fetchProfileData(); // Recharger les données du profil utilisateur
    }
}


// Déclarer le composant dans le DOM
customElements.define("user-profil-section", UserProfile);
