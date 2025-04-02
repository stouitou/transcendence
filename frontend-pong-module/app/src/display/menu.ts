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
		this._outline.style.width = `${width}px`;
		this._outline.style.height = `${height}px`;
		this._outline.style.border = "5px solid black";
		this._outline.style.top = `calc(${window.innerHeight /  2}px -${height / 2}px)`;
		this._outline.style.left = `calc(${window.innerWidth /  2}px -${width / 2}px)`;

		document.body.appendChild(this._outline);
	}

	//afficher les boutons custom
	public displayButtonCustom(button: string, width: number, height: number, buttonWidth: number, buttonHeight: number) : Promise<void>
	{
		return new Promise((resolve) => {
				this._button = document.createElement("button");

				this._button.style.position = "absolute";
				this._button.style.backgroundColor = "rgb(179, 95, 95)";
				this._button.style.top =  `calc(${window.innerHeight /  2}px - ${buttonHeight / 2}px + ${height}px)`;
				this._button.style.left = `calc(${window.innerWidth /  2}px - ${buttonWidth / 2}px + ${width}px)`;
				this._button.style.width = `${buttonWidth}px`;
				this._button.style.height = `${buttonHeight}px`;
			
				this._button.textContent = button;

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
			case 'Return' :
				await this.display(this._textButton[0]);
				break;
		}
	}

	private SmallCheckboxCustom(width: number, height: number, boxWidth: number, boxHeight: number) : Promise<void>
	{
		return new Promise((resolve) => {
			this._checkbox = document.createElement("input");
			this._label = document.createElement("label");
			
			this._checkbox.style.position = "absolute";
			this._checkbox.style.margin = "0";
			this._checkbox.type = "checkbox";
	        this._checkbox.id = "smallCheckbox";
	        this._checkbox.style.width = `${boxWidth}px`;
	        this._checkbox.style.height = `${boxHeight}px`;
			this._checkbox.style.top = `calc(${window.innerHeight /  2}px - ${boxHeight / 2}px + ${height}px)`;
			this._checkbox.style.left = `calc(${window.innerWidth /  2}px - ${boxWidth / 2}px + ${width}px)`;

			this._label.style.position = "absolute";
			this._label.htmlFor = "smallCheckbox";
			this._label.textContent = "IA";
			//this._label.style.fontSize = "20px";
			this._label.style.width = `${boxWidth}px`;
	        this._label.style.height = `${boxHeight}px`;
			this._label.style.top = `calc(${window.innerHeight /  2}px - ${boxHeight / 2}px + ${height}px)`;
			this._label.style.left = `calc(${window.innerWidth /  2}px - ${boxWidth / 2}px + ${width}px - ${boxHeight}px)`;

			document.body.appendChild(this._checkbox);
			document.body.appendChild(this._label);

			this._checkbox.addEventListener("change", (event) => { //l ancien n est pas enlever juste un nouveau est mis dessus donc a revoir
				//const buttons: Ht[] = Array.from(document.querySelectorAll("button"));
				//this._outline.remove();
				//buttons.forEach(button => button.remove());
				if (this._checkbox.checked) {
					//this._outline.remove();
					this.displayButtonCustom("IA", -40, 0, 180, 40); }
				else {
					this.DropdownMenu(); }
				//this._target = event.target as HTMLButtonElement;
				resolve();
		})
		})
	}

	public DropdownMenu()
	{
		const container: HTMLDivElement = document.createElement("div");
		container.style.position = "relative";
		container.style.display = "inline-block";
	  
		// Création du bouton
		const button: HTMLButtonElement = document.createElement("button");
		button.textContent = "Menu";
		button.style.padding = "8px 16px";
		button.style.cursor = "pointer";
	  
		// Création du menu (liste)
		const menu: HTMLUListElement = document.createElement("ul");
		menu.style.listStyleType = "none";
		menu.style.margin = "0";
		menu.style.padding = "0";
		menu.style.position = "absolute";
		menu.style.top = "100%";
		menu.style.left = "0";
		menu.style.display = "none"; // Masqué par défaut
		menu.style.background = "#fff";
		menu.style.border = "1px solid #ccc";
		menu.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
	  
		// Création des items du menu
		const items: string[] = ["Option1", "Option2", "Option3"];
		items.forEach(itemText => {
		  const li: HTMLLIElement = document.createElement("li");
		  li.textContent = itemText;
		  li.style.padding = "8px 12px";
		  li.style.cursor = "pointer";
	  
		  // Ajout d'effets au survol
		  li.addEventListener("mouseover", () => li.style.backgroundColor = "#eee");
		  li.addEventListener("mouseout", () => li.style.backgroundColor = "#fff");
	  
		  // Lorsqu'un item est cliqué, on log l'option et on masque le menu
		  li.addEventListener("click", () => {
			console.log(`Élément sélectionné : ${itemText}`);
			menu.style.display = "none";
		  });
		  
		  menu.appendChild(li);
		});
	  
		// Ajout d'un écouteur sur le bouton pour basculer l'affichage du menu
		button.addEventListener("click", () => {
		  menu.style.display = (menu.style.display === "none") ? "block" : "none";
		});
	  
		// Regroupement des éléments
		container.appendChild(button);
		container.appendChild(menu);
		document.body.appendChild(container);
	  
		console.log("Menu déroulant créé");
	}

	public async localGame()
	{
		this.displayMenuCustom(270, 50);
		this.displayButtonCustom("Player", -40, 0, 180, 40);
		await this.SmallCheckboxCustom(110, 0, 20, 20);		
	}
}
