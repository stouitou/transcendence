import { Game } from '../types/types';

    
  // --- Composant RoundAccordion ---
  export class RoundAccordion extends HTMLElement {
	private round: Game[] | null = null;
	private index: number | null = null;
	constructor() {
	  super();
	  this.attachShadow({ mode: 'open' });
	}
  
	// Attente d'une propriété « data » 
	set data(data: string) {
		console.warn('data', data);
		console.log('data', this.round);
	  try {
		this.round = JSON.parse(data);
	  } catch (error) {
		console.error('Erreur de parsing des données du round', error);
		this.round = null;
	  }
	  this.render();
	}
  
	connectedCallback() {
	  this.render();
	}
  
	private render() {
		if (!this.round)
		{
			const data = this.getAttribute('data');
			const index = this.getAttribute('index');
			if (data) {
				try {
					this.round = JSON.parse(data);
				} catch (error) {
					console.error('Erreur de parsing des données du round', error);
					this.round = null;
				}
			}
			if (index) {
				this.index = parseInt(index, 10);
			}
		}
			
		if (!this.shadowRoot) return;
		if (!this.round) {
			this.shadowRoot.innerHTML = '<p>Aucun round disponible.</p>';
			console.log('data', this.getAttribute('data'));
			return;
		}

		this.shadowRoot.innerHTML = `
		<div class="border border-gray-300 mb-2 rounded overflow-hidden">
			<div class="p-2 cursor-pointer">
				Round #${this.index} - État : {this.round.state}
			</div>
			<div class="p-2 hidden">
				${this.round.map(game => `<game-card data='${JSON.stringify(game)}'></game-card>`).join('')}
			</div>
		</div>
		`;
  
	  // Gestion du clic pour l'expandion/collapse
	  // de l'élément d'accordéon
	  const header = this.shadowRoot.querySelector('.accordion-header');
	  const content = this.shadowRoot.querySelector('.accordion-content');
	  if (header && content) {
		header.addEventListener('click', () => {
		  content.classList.toggle('active');
		});
	  }
	}
  }
  
  