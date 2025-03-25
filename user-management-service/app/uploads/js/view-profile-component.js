import GlobalState from './GlobalState.js';

class ViewProfileComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" }); // Isolation du style
    }

    connectedCallback() {
        this.render();
		const profileData = GlobalState.getProfileData();
        if (profileData) {
            this.updateProfileData(profileData);
        }

        // Écouter l'événement personnalisé 'profile-data-updated'
        document.addEventListener('profile-data-updated', (event) => {
            console.log('view component Profile data received:', event.detail.profileData);
            // Utiliser les données du profil utilisateur
            this.updateProfileData(event.detail.profileData);
        });
		 // Écouter l'événement personnalisé 'profile-data-updated'
		 document.addEventListener('logout-success', (event) => {
            console.log('view component Profile data received: reset');
            // Utiliser les données du profil utilisateur
            this.render();
        });
    }

    updateProfileData(profileData) {
        // Mettre à jour le contenu du composant avec les données du profil utilisateur
     const div = this.shadowRoot.querySelector('.profile-info');
	 //profileData.avatar file (/uploads) or link (https://?
	 // verifier si c'est un fichier ou un lien
	 //
	 //
/* 	 if (profileData.avatar) {
		// verifier si c'est un lien
		if (profileData.avatar.startsWith('http')) {
			div.innerHTML = `
				<p>Nom: ${profileData.name??undefined}</p>
				<p>avatar: ${profileData.avatar??undefined}</p>
				<img src="${profileData.avatar??undefined}" alt="avatar" width="100" height="100">
				<!-- Ajoutez d'autres informations du profil utilisateur ici -->
			`;
		} else {
			div.innerHTML = `
				<p>Nom: ${profileData.name??undefined}</p>
				<p>avatar: ${profileData.avatar??undefined}</p>
				<img src="https://localhost:4433/${profileData.avatar??undefined}" alt="avatar" width="100" height="100">
				<!-- Ajoutez d'autres informations du profil utilisateur ici -->
			`;
		} */

	 div.innerHTML = `
            <p>Nom: ${profileData.name??undefined}</p>
            <p>avatar: ${profileData.avatar??undefined}</p>
			<img src="${profileData.avatar?.startsWith('http')?profileData.avatar: "https://localhost:4433/" + profileData.avatar??undefined}" alt="avatar" width="100" height="100">
            <!-- Ajoutez d'autres informations du profil utilisateur ici -->
        `;
	    }

    render() {
        this.shadowRoot.innerHTML = `
            <div class="container">
                <h2>Another Component</h2>
                <div class="profile-info">
                    <!-- Les informations du profil utilisateur seront mises à jour ici -->
                </div>
            </div>
        `;
    }
}

// Déclarer le composant dans le DOM
customElements.define("view-profil-component", ViewProfileComponent);