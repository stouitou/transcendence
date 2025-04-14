enum Size {
	Width = 0,
	Height = 1,
	WidthOffset = 2,
	HeightOffset = 3,
	PoliceText = 4,
	StringText = 5,
	ColorBackground = 6,
	ColorText = 7
}

export class menu {
	private n: number = 0;
	//private _guestName!: string;

	private _outline!: HTMLElement;
	private _button: HTMLButtonElement[] = [];
	private _buttonMenu!: HTMLButtonElement;

	private readonly _widthButton: number = 200;
	private readonly _heightButton: number = 40;

	private _widthMenu!: number;
	private _heightMenu!: number;

	private _spaceButtons!: number;

	private _target!: HTMLButtonElement;
	private _checkbox!: HTMLInputElement;
	private _label!: HTMLLabelElement;

	private _container: HTMLDivElement[] = [];
	private _texte!: HTMLDivElement;
	private _li!: HTMLLIElement;

	private _input: HTMLInputElement[] = [];

	private _textButton: string[][] = [];

    constructor ()
	{	
		this._textButton[0] = ["1V1", "Tournoi", "Multijoueur", "Return"];
		this._textButton[1] = ["Local", "Distant", "Return"];
		this._textButton[2] = ["Name", "IA", "Return"];

		this.display(this._textButton[0]);
	}

	
	
	/*** AFFICHE UN MENU + LES BOUTONS SELON LE TABLEAU DE STRING ENVOYER ***/

	//afficher un rectangle selon le nombres de boutons prevue
	public displayMenu(textButton: string[])
	{
		this._heightMenu = this._heightButton * textButton.length + (this._heightButton * 0.2 * (textButton.length + 1));
		this._widthMenu = this._widthButton + (this._widthButton * 0.2);
		this._outline = document.createElement("div");

		this._outline.style.backgroundColor = "rgb(34, 101, 126)";
		this._outline.style.position = "absolute";
		this._outline.style.width = `${this._widthMenu}px`;
		this._outline.style.height = `${this._heightMenu}px`;
		this._outline.style.border = "5px solid black";
		this._outline.style.top = `calc(${window.innerHeight /  2}px -${this._heightMenu / 2}px)`;

		document.body.appendChild(this._outline);
	}

	//afficher les boutons, marche avec displayMenu(textButton: string[])
	public displayButton(x: number, textButton: string[]) : Promise<void>
	{
		return new Promise((resolve) => {
			this._spaceButtons = window.innerHeight /  2 - this._heightMenu / 2 + this._heightButton * 0.2;

			for (let x = 0; x < textButton.length; x++)
			{
				this._button[x] = document.createElement("button");

				this._button[x].style.position = "absolute";
				this._button[x].style.backgroundColor = "rgb(255, 0, 0)";
				this._button[x].style.top = `${this._spaceButtons}px`;
				this._spaceButtons += (this._heightButton * 0.2);
				this._button[x].style.padding = "0px";
				this._button[x].style.width = `${this._widthButton}px `;
				this._button[x].style.height = `${this._heightButton}px`;
			
				this._button[x].textContent = textButton[x];

				this._spaceButtons += this._heightButton;

				document.body.appendChild(this._button[x]);

				this._button[x].addEventListener("click", (event) => {
					const buttons: HTMLButtonElement[] = Array.from(document.querySelectorAll("button"));
					this._outline.remove();
					buttons.forEach(button => button.remove());
					this._target = event.target as HTMLButtonElement;
					this.center();
					resolve();
				})
			}
		});
	}

	/*** FONCTION CUSTOM QUI REVOI UN TAB STRING/NUMBER ***/
	//Width, Height, WidthOffset, HeightOffset, PoliceText, StringText

	//afficher un menu selon les valeurs
	public displayMenuCustom(width: number, height: number)
	{
		this._outline = document.createElement("div");

		this._outline.style.backgroundColor = "rgb(51, 155, 193)";
		this._outline.style.position = "absolute";
		this._outline.style.zIndex = "-10";
		this._outline.style.width = `${width}px`;
		this._outline.style.height = `${height}px`;
		this._outline.style.border = "5px solid black";
		this._outline.style.top = `calc(${window.innerHeight /  2}px -${height / 2}px)`;
		this._outline.style.left = `calc(${window.innerWidth /  2}px -${width / 2}px)`;

		document.body.appendChild(this._outline);
	}

	public TextDisplayCustom(...tab: (string | number)[])
	{
		this._texte = document.createElement("div");

		this._texte.textContent = `${tab[Size.StringText]}`;
		this._texte.style.position = "absolute";
		this._texte.style.width = `${tab[Size.Width]}`;
		this._texte.style.height = `${tab[Size.Height]}`;
		this._texte.style.padding = "0px";
		this._texte.style.top = `calc(${window.innerHeight / 2}px - ${Number(tab[Size.Height]) / 2}px + ${tab[Size.HeightOffset]}px)`;
		this._texte.style.left = `calc(${window.innerWidth / 2}px - ${Number(tab[Size.Width]) / 2}px + ${tab[Size.WidthOffset]}px)`;
		this._texte.style.fontSize = "20px";
		this._texte.style.color = "black";

		document.body.appendChild(this._texte);
	}

	private SmallCheckboxCustom(width: number, height: number, boxWidth: number, boxHeight: number)
	{
		this._checkbox = document.createElement("input");
		this._label = document.createElement("label");
		
		this._checkbox.style.position = "absolute";
		this._checkbox.style.margin = "0%";
		this._checkbox.type = "checkbox";
	    this._checkbox.id = "smallCheckbox";
		this._checkbox.style.padding = "0px";
	    this._checkbox.style.width = `${boxWidth}px`;
	    this._checkbox.style.height = `${boxHeight}px`;
		this._checkbox.style.top = `calc(${window.innerHeight / 2}px - ${boxHeight / 2}px + ${height}px)`;
		this._checkbox.style.left = `calc(${window.innerWidth / 2}px - ${boxWidth / 2}px + ${width}px)`;

		this._label.style.position = "absolute";
		this._label.htmlFor = "smallCheckbox";
		this._label.textContent = "IA";
		this._label.style.padding = "0px";
		this._label.style.width = `${boxWidth}px`;
	    this._label.style.height = `${boxHeight}px`;
		this._label.style.top = `calc(${window.innerHeight /  2}px - ${boxHeight / 2}px + ${height}px)`;
		this._label.style.left = `calc(${window.innerWidth /  2}px - ${boxWidth / 2}px + ${width}px - ${boxHeight}px)`;

		document.body.appendChild(this._checkbox);
		document.body.appendChild(this._label);			
	}

	// creer un menu deroulant	
	public  DropdownMenu(std: string[], i: number, tab: (string | number)[], onSelect: (value: string) => void)
	{
		this._container[i] = document.createElement("div");
		this._container[i].style.position = "relative";
		this._container[i].style.display = "inline-block";
		this._container[i].style.position = "absolute";
		this._container[i].style.padding = "0px";
		this._container[i].style.margin = "0px";
		this._container[i].style.border = "none"

		this._container[i].style.top = `calc(${window.innerHeight /  2}px - ${Number(tab[Size.Height]) / 2}px + ${Number(tab[Size.HeightOffset])}px)`;
		this._container[i].style.left = `calc(${window.innerWidth /  2}px - ${Number(tab[Size.Width]) / 2}px + ${Number(tab[Size.WidthOffset])}px)`;
	  
		// Création du bouton
		let buttonMenu = document.createElement("button");
		buttonMenu.textContent = String(tab[Size.StringText]);
		buttonMenu.style.height = `${tab[Size.Height]}px`;
		buttonMenu.style.width = `${tab[Size.Width]}px`;
		buttonMenu.style.padding = "0px";
	  
		// Création du menu (liste)
		const menu: HTMLUListElement = document.createElement("ul");
		menu.style.listStyleType = "none";
		menu.style.margin = "0px";
		menu.style.padding = "0px";
		menu.style.position = "absolute";
		menu.style.border = "none"
		menu.style.top = "100%";
		menu.style.left = "0";
		menu.style.zIndex = "10";
		menu.style.display = "none";
		menu.style.background = "#fff";
		menu.style.border = "1px solid #ccc";
		menu.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
	  
		// Création des items du menu
		const items: string[] = std;
		items.forEach(itemText => {
		this._li = document.createElement("li");

		this._li.textContent = itemText;
		this._li.style.width = `${tab[Size.Width]}px`;
		this._li.style.height = `${tab[Size.Height]}px`;
		this._li.style.padding = "0px";
		this._li.style.margin = "0px";
		this._li.style.border = "none"
		this._li.style.cursor = "pointer";
	  
		// Ajout d'effets au survol
		this._li.addEventListener("mouseover", () => this._li.style.backgroundColor = "#eee");
		this._li.addEventListener("mouseout", () => this._li.style.backgroundColor = "#fff");

		// Lorsqu'un item est cliqué, on log l'option et on masque le menu
		this._li.addEventListener("click", () => {
			buttonMenu.textContent = itemText;
			menu.style.display = "none";
			//console.log("Option du menu deroulant:",Number(itemText));
			onSelect(itemText);
			
			//this._container[i].appendChild(buttonMenu);
		  });
		  
		  menu.appendChild(this._li);
		});
	  
		// Ajout d'un écouteur sur le bouton pour basculer l'affichage du menu
		buttonMenu.addEventListener("click", () => {
		menu.style.display = (menu.style.display === "none") ? "block" : "none";
		});
		//console.log("Appuie sur le menu deroulant");
		// Regroupement des éléments
		this._container[i].appendChild(buttonMenu);
		this._container[i].appendChild(menu);
		document.body.appendChild(this._container[i]);
	}

	
	//creer un champ input avec son bouton de validation
	public createTextInputCustom(x: number, ...tab: (string | number)[])
	{
		this._input[x] = document.createElement("input");

		this._input[x].type = "text";
		this._input[x].style.position = "absolute";
		this._input[x].placeholder = String(tab[Size.StringText]);
	
		this._button[x] = document.createElement("button");
		this._button[x].style.position = "absolute";
		this._button[x].textContent = "Ok";
		this._button[x].style.padding = "0px";
		this._button[x].style.top = `calc(${window.innerHeight /  2}px - ${Number(tab[Size.Height]) / 2}px + ${tab[Size.HeightOffset]}px)`;
		this._button[x].style.left = `calc(${window.innerWidth /  2}px - ${Number(tab[Size.Width]) / 2}px + ${tab[Size.WidthOffset]}px + ${Number(tab[Size.Width]) + 10}px)`;
		
		this._input[x].style.padding = "0px";
		this._input[x].style.height = `${tab[Size.Height]}px`;
		this._input[x].style.width = `${tab[Size.Width]}px`;
		this._input[x].style.top = `calc(${window.innerHeight /  2}px - ${Number(tab[Size.Height]) / 2}px + ${tab[Size.HeightOffset]}px)`;
		this._input[x].style.left = `calc(${window.innerWidth /  2}px - ${Number(tab[Size.Width]) / 2}px + ${tab[Size.WidthOffset]}px)`;		

		document.body.appendChild(this._input[x]);
		document.body.appendChild(this._button[x]);
	}

	//afficher les boutons custom
	public displayButtonCustom(x: number, ...tab: (string | number)[]) : Promise<void>
	{
		return new Promise((resolve) => {
				this._button[x] = document.createElement("button");

				this._button[x].style.position = "absolute";
				this._button[x].style.fontFamily = `${tab[Size.PoliceText]}`;
				this._button[x].style.padding = "0px";
				this._button[x].style.backgroundColor = "rgb(179, 95, 95)";
				this._button[x].style.top =  `calc(${window.innerHeight /  2}px - ${Number(tab[Size.Height]) / 2}px + ${tab[Size.HeightOffset]}px)`;
				this._button[x].style.left = `calc(${window.innerWidth /  2}px - ${Number(tab[Size.Width])  / 2}px + ${tab[Size.WidthOffset]}px)`;
				this._button[x].style.width = `${tab[Size.Width]}px`;
				this._button[x].style.height = `${tab[Size.Height]}px`;
				this._button[x].textContent = String(tab[Size.StringText]);

				document.body.appendChild(this._button[x]);

				this._button[x].addEventListener("click", (event) => {
					const buttons: HTMLButtonElement[] = Array.from(document.querySelectorAll("button"));
					this._outline.remove();
					buttons.forEach(button => button.remove());
					this._target = event.target as HTMLButtonElement;
					this.center();
					resolve();
				})
		});
	}	

	/*** FONCTION CENTRAL ***/

	private async display(textButton: string[])
	{
		this.displayMenu(textButton);
		await this.displayButton(0, textButton);
	}

	public async center()
	{
		switch (this._target.textContent)
		{
			case '1V1' :
				await this.display(this._textButton[1]);
				break;
			case 'Local' :
				await this.localGame();
				break;
			case 'Tournoi' :
				this.Tournoi();
				break;
			case 'Distant' :
				this.distant();
				break;
			case 'Return' :
				await this.display(this._textButton[0]);
				break;
		}
	}

	private checkNameGuest(guestName: string)
	{
		//console.log("name :", guestName);
		if (this._texte && document.body.contains(this._texte)) {
			this._texte.remove();
		}
		if (guestName === "")
		{
			this.TextDisplayCustom(200, 120, 0, 0, "Arial", "Your name is empty");
			setTimeout(() => { this._texte.remove(); }, 2000);
			return(false);
		}
		else if (guestName.length >= 10)
		{
			this.TextDisplayCustom(200, 120, 0, 0, "Arial", "10 caractere max");
			setTimeout(() => { this._texte.remove(); }, 2000);
			return(false);
		}

		return(true);
	}

	public async distant() : Promise<void>
	{
		this.displayMenuCustom(200, 50);
		this.createTextInputCustom(0, 140, 20, -20, 0, "Courier", "Pseudo du joueur");
		this._button[0].addEventListener("click", () => {
				console.log("Name du guest valide : ", this._input[0].value); //chercher si le pseudo existe dans la data, lancer la fonction game ici, clean menu
		});	
	}

	public async localGame() : Promise<void>
	{
		const std: string[] = ["Facile", "Moyen", "Hard"];
		return new Promise((resolve) => {
			this.createTextInputCustom(0, 140, 20, -60, 0, "Courier", "Pseudo de l'invite");
			this.SmallCheckboxCustom(110, 0, 20, 20);
			this.displayMenuCustom(270, 50);

			this._button[0].addEventListener("click", () => {
				//console.log(this._input.value);
				if (this.checkNameGuest(this._input[0].value))
				{
					//this._button.remove();
					console.log("Name du guest valide : ", this._input[0].value); //lancer la fonction game ici, clean menu
				}
			});		

			this._checkbox.addEventListener("change", () => {
			if (this._checkbox.checked) {
				this._input[0].remove();
				this._button[0].remove();
				this.DropdownMenu(std, 0, [150, 40, -50, 0 , "Arrial", "Choose your LVL"], (val) => {
					this.displayButtonCustom(0, 20, 20, 40, 0, "Courier", "OK");
				});
			}
			else {
				//console.log("tet");
				this._container[0].remove();
				if (this._button[0])
					this._button[0].remove();
				// this._input.remove();
				// this._button.remove();
				//this.displayButtonCustom(30, 30, 35, 0,  "Courier", "Ok");
		
				/* METRE UN VALIDE CUSTOM ET LE RETIRER DE createTextInputCustom*/
				this.createTextInputCustom(0, 140, 20, -60, 0, "Courier", "Pseudo de l'invite");
			}
			resolve();
			})
			//this.checkNameGuest();
			
			
			
		})
	}

	public Tournoi() //trouver comment enlever le padding et recalculer pour tout bien psotionner
	{
		//let std: string[] = ["3", "4", "5", "6", "7", "8"];
	
		//console.log("Menu = ", 50 + (50 * this.n));
		this.displayMenuCustom(400, 50 + (40 * this.n));

		this.TextDisplayCustom(80, 25, -150, (-20 * this.n), "Arial", "Choose your number of players: ");
		//console.log("(-25 * this.n) = ",(-25 * this.n));

		//console.log("");
		this.DropdownMenu(["3", "4", "5", "6", "7", "8"], 0, [80, 30, 115, ((-20 * this.n)), "Arial", `${this.n + 1}`], (val) => {
			//if (this.n != 0)
			this._container[0].remove();
			for (let x = 0; x < this._input.length; x++) {
				this._input[x].remove(); 
				this._button[x].remove();
			}

		this.n = Number(val) - 1;
			
			for (let i = 0; i < this.n; i++)
			{
				let sup: number = 0
				if (this.n != 2)
					sup = 5 * (Number(val) - 2);
				if (i === this.n - 1 && (this.n + 1) % 2 === 1)
				{
					console.log("i = ", i);
					this.SmallCheckboxCustom(60, (-10 * (Number(val)) - sup) + (40 * i), 20, 20)
				}
				this.createTextInputCustom(i, 140, 20,  -100, (-10 * (Number(val)) - sup) + (40 * i), "Courier", "Pseudo de l'invite");

				this._button[i].addEventListener("click", () => {
				console.log("i = ", i);
				console.log("Name du guest valide : ", this._input[i].value); //chercher si le pseudo existe dans la data, lancer la fonction game ici, clean menu
				});	
				
			}
			if ((this.n + 1) % 2 === 1)
			{
			this._checkbox.addEventListener("change", () => {
				this._button[this._button.length - 1].remove();
				this._input[this._input.length - 1].remove();
				let top:number ;
				this.DropdownMenu(["Facile", "Moyen", "Hard"], 0, [150, 40, -70, (40 * this._button.length) , "Arrial", "Choose your LVL"], (val) => {
					this.displayButtonCustom(0, 20, 20, 40, 0, "Courier", "OK");
				});
			});
		}
			this._outline.remove();
			this._texte.remove();
			
			this.Tournoi();
		});
	}


	// public Tournoi() //trouver comment enlever le padding et recalculer pour tout bien psotionner
	// {
	// 	let std: string[] = ["3", "4", "5", "6", "7", "8"];
	
	// 	//console.log("Menu = ", 50 + (50 * this.n));
	// 	this.displayMenuCustom(400, 50 + (50 * this.n));

	// 	this.TextDisplayCustom(80, 25, -150, (-25 * this.n), "Arial", "Choose your number of players: ");
	// 	//console.log("(-25 * this.n) = ",(-25 * this.n));

	// 	//console.log("");
	// 	this.DropdownMenu(["3", "4", "5", "6", "7", "8"], 0, [80, 30, 115, ((-25 * this.n)), "Arial", `${this.n + 1}`], (val) => {
	// 		//if (this.n != 0)
	// 			for (let x = 0; x < this._container.length; x++) {
	// 				this._container[x].remove(); }

	// 	this.n = Number(val) - 1;
			
	// 		for (let i = 1; i < Number(val); i++) {
	// 			let sup: number = 0
	// 			if (this.n != 2)
	// 				sup = 5 * (Number(val) - 2);
	// 			//console.log("sup = ", sup);
	// 			//console.log("(-20 * (Number(val))) = ", (-20 * (Number(val))), " + (50 * i) = ", 50 * i, "ALL = ", (-20 * (Number(val))) + (50 * i));
	// 			this.DropdownMenu(["Player", "IA"], i, [220, 40, -80, (-20 * (Number(val)) - sup) + (50 * i)  , "Arial", `${i} | Choose your opponent`], (val) => {
	// 				//this._buttonMenu.textContent = String(val);
	// 				console.log("Number(val) = ", String(val));
	// 				this._button.style.padding = "0px";

	// 				let top: number = window.innerHeight /  2 - this._container[i].offsetTop;
	// 				console.log("Top = ", top);
	// 				console.log("I = ", i);
	// 				//this._container[i].offsetTop;

	// 				this.createTextInputCustom(140, 20, -90, top, "Courier", "Pseudo de l'invite");
	// 				this._container[i].remove();
					
	// 			}); }

	// 		this._outline.remove();
	// 		this._texte.remove();
			
	// 		this.Tournoi();
	// 	});
	// }

}
