enum Size {
	Width = 0,
	Height = 1,
	WidthOffset = 2,
	HeightOffset = 3,
	PoliceText = 4,
	StringText = 5
}

export class menu {
	private _outline!: HTMLElement;
	private _button!: HTMLButtonElement;

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

	private _textButton: string[][] = [];
	
	//private topButton: number = 50;

    constructor ()//textButton: string[])
	{	
		
		this._textButton[0] = ["1V1", "Tournoi", "Multijoueur", "Return"];
		this._textButton[1] = ["Local", "Distant", "IA", "Return"];
		this._textButton[2] = ["Name", "IA", "Return"];

		this.display(this._textButton[0]);
	}

	
	
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
	public displayButton(textButton: string[]) : Promise<void>
	{
		return new Promise((resolve) => {
			this._spaceButtons = window.innerHeight /  2 - this._heightMenu / 2 + this._heightButton * 0.2;

			for (let x = 0; x < textButton.length; x++)
			{
				this._button = document.createElement("button");

				this._button.style.position = "absolute";
				this._button.style.backgroundColor = "rgb(255, 0, 0)";
				this._button.style.top = `${this._spaceButtons}px`;
				this._spaceButtons += (this._heightButton * 0.2);
				this._button.style.width = `${this._widthButton}px `;
				this._button.style.height = `${this._heightButton}px`;
			
				this._button.textContent = textButton[x];

				this._spaceButtons += this._heightButton;

				document.body.appendChild(this._button);

				this._button.addEventListener("click", (event) => {
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

		//afficher un rectangle selon les valeurs
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



	private async display(textButton: string[])
	{
		this.displayMenu(textButton);
		await this.displayButton(textButton);
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
			case 'Return' :
				await this.display(this._textButton[0]);
				break;
		}
	}

	public n: number = 0;

	public Tournoi() //trouver comment enlever le padding et recalculer pour tout bien psotionner
	{
		let std: string[] = ["3", "4", "5", "6", "7", "8"];
		this.displayMenuCustom(400, 40 + (35 * this.n));
		this.TextDisplayCustom(80, 20, -150, ((-20 * this.n)), "Arial", "Choose your number of players: ");
	
		this.DropdownMenu(std, 0, [80, 30, 115, ((-20 * this.n)), "Arial", "Nb Player"], (val) => {
			if (this.n != 0)
				for (let x = 0; x < this._container.length; x++) {
					this._container[x].remove(); }

			for (let i = 1; i < Number(val); i++) {
				this.DropdownMenu(std, i, [220, 30, -80, (-20 * Number(val)) + (40 * i)  , "Arial", `${i} | Choose your opponent`], (val) => {}); }

			this._outline.remove();
			this._texte.remove();
			this.n = Number(val);

			this.Tournoi();
		});
	}

	public TextDisplayCustom(...tab: (string | number)[])
	{
		this._texte = document.createElement("div");

		this._texte.textContent = `${tab[Size.StringText]}`;
		this._texte.style.position = "absolute";
		this._texte.style.width = `${tab[Size.Width]}`;
		this._texte.style.height = `${tab[Size.Height]}`;
		this._texte.style.top = `calc(${window.innerHeight / 2}px - ${Number(tab[Size.Height]) / 2}px + ${tab[Size.HeightOffset]}px)`;
		this._texte.style.left = `calc(${window.innerWidth / 2}px - ${Number(tab[Size.Width]) / 2}px + ${tab[Size.WidthOffset]}px)`;
		console.log("this._texte.style.left : ", this._texte.style.left );
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
	    this._checkbox.style.width = `${boxWidth}px`;
	    this._checkbox.style.height = `${boxHeight}px`;
		this._checkbox.style.top = `calc(${window.innerHeight / 2}px - ${boxHeight / 2}px + ${height}px)`;
		this._checkbox.style.left = `calc(${window.innerWidth / 2}px - ${boxWidth / 2}px + ${width}px)`;

		this._label.style.position = "absolute";
		this._label.htmlFor = "smallCheckbox";
		this._label.textContent = "IA";
		this._label.style.width = `${boxWidth}px`;
	    this._label.style.height = `${boxHeight}px`;
		this._label.style.top = `calc(${window.innerHeight /  2}px - ${boxHeight / 2}px + ${height}px)`;
		this._label.style.left = `calc(${window.innerWidth /  2}px - ${boxWidth / 2}px + ${width}px - ${boxHeight}px)`;

		document.body.appendChild(this._checkbox);
		document.body.appendChild(this._label);			
	}

	
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
		const button: HTMLButtonElement = document.createElement("button");
		button.textContent = String(tab[Size.StringText]);
		button.style.height = `${tab[Size.Height]}px`;
		button.style.width = `${tab[Size.Width]}px`;
	  
		// Création du menu (liste)
		const menu: HTMLUListElement = document.createElement("ul");
		menu.style.listStyleType = "none";
		menu.style.margin = "0px";
		menu.style.padding = "0px";
		menu.style.position = "absolute";
		menu.style.border = "none"
		menu.style.top = "100%";
		menu.style.left = "0";
		menu.style.display = "none"; // Masqué par défaut
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
		  //li.style.padding = `${boxHeight}px ${boxWidth}px`;
		  this._li.style.cursor = "pointer";
	  
		  // Ajout d'effets au survol
		  this._li.addEventListener("mouseover", () => this._li.style.backgroundColor = "#eee");
		  this._li.addEventListener("mouseout", () => this._li.style.backgroundColor = "#fff");
	  
		  // Lorsqu'un item est cliqué, on log l'option et on masque le menu
		  this._li.addEventListener("click", () => {
			//console.log(`Élément sélectionné : ${itemText}`);
			this._container[i].remove();
			menu.style.display = "none";
			console.log("Option du menu deroulant:",Number(itemText));
			onSelect(itemText);
		  });
		  
		  menu.appendChild(this._li);
		});
	  
		// Ajout d'un écouteur sur le bouton pour basculer l'affichage du menu
		button.addEventListener("click", () => {
		  menu.style.display = (menu.style.display === "none") ? "block" : "none";
		});

		// Regroupement des éléments
		this._container[i].appendChild(button);
		this._container[i].appendChild(menu);
		document.body.appendChild(this._container[i]);
	  
		console.log("Menu déroulant créé");
	}

	public createTextInputCustom(...tab: (string | number)[])
	{
		const input: HTMLInputElement = document.createElement("input");

		input.type = "text";
		input.style.position = "absolute";
		input.placeholder = "Pseudo de l'invite";
	
		const button: HTMLButtonElement = document.createElement("button");
		button.textContent = "Valider";
		// button.style.margin = "0px";
		// button.style.padding = "0px";
		input.style.height = `${tab[Size.Height]}px`;
		input.style.width = `${tab[Size.Width]}px`;
		input.style.top = `calc(${window.innerHeight /  2}px - ${Number(tab[Size.Height]) / 2}px + ${tab[Size.HeightOffset]}px)`;
		input.style.left = `calc(${window.innerWidth /  2}px - ${Number(tab[Size.Width]) / 2}px + ${tab[Size.WidthOffset]}px)`;

		button.addEventListener("click", () => {
			console.log("Text: ", input.value);
		});

		document.body.appendChild(input);
		document.body.appendChild(button);
	}

	
	//afficher les boutons custom
	public displayButtonCustom(...tab: (string | number)[]) : Promise<void>
	{
		return new Promise((resolve) => {
				console.log(tab[0]);
				this._button = document.createElement("button");

				this._button.style.position = "absolute";
				this._button.style.fontFamily = `${tab[Size.PoliceText]}`;
				this._button.style.backgroundColor = "rgb(179, 95, 95)";
				this._button.style.top =  `calc(${window.innerHeight /  2}px - ${Number(tab[Size.Height]) / 2}px + ${tab[Size.HeightOffset]}px)`;
				this._button.style.left = `calc(${window.innerWidth /  2}px - ${Number(tab[Size.Width])  / 2}px + ${tab[Size.WidthOffset]}px)`;
				this._button.style.width = `${tab[Size.Width]}px`;
				this._button.style.height = `${tab[Size.Height]}px`;
				this._button.textContent = String(tab[Size.StringText]);

				document.body.appendChild(this._button);

				this._button.addEventListener("click", (event) => {
					const buttons: HTMLButtonElement[] = Array.from(document.querySelectorAll("button"));
					this._outline.remove();
					buttons.forEach(button => button.remove());
					this._target = event.target as HTMLButtonElement;
					this.center();
					resolve();
				})
		});
	}

	//Width, Height, WidthOffset, HeightOffset, PoliceText, StringText
	public async localGame() : Promise<void>
	{
		const std: string[] = ["Facile", "Moyen", "Hard"];
		return new Promise((resolve) => {
			this.createTextInputCustom(140, 20, -60, 0);
			this.displayButtonCustom(30, 30, 35, 0,  "Courier", "Ok");
			this.SmallCheckboxCustom(110, 0, 20, 20);
			this.displayMenuCustom(270, 50);
			
			this._checkbox.addEventListener("change", () => {
			if (this._checkbox.checked) {
				this._button.remove();
				//this.DropdownMenu(std, -40, 0, 180, 40);
				 }
			else {
				//this._container.remove();
				this.displayButtonCustom(30, 30, 35, 0,  "Courier", "Ok");
				this.createTextInputCustom(140, 20, -60, 0);
				 }
			resolve();
			})
		})
	}
}
