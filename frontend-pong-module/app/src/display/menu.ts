export class menu {
	private _outline!: HTMLElement;
	private _button!: HTMLButtonElement;

	private readonly _widthButton: number = 200;
	private readonly _heightButton: number = 40;

	private _widthMenu!: number;
	private _heightMenu!: number;

	private _spaceButtons!: number;

	private _target!: HTMLButtonElement;

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
			//this._spaceButtons = window.innerHeight /  2 - this._heightMenu / 2 + this._heightButton * 0.2;

			// for (let x = 0; x < textButton.length; x++)
			// {
				this._button = document.createElement("button");

				this._button.style.position = "absolute";
				this._button.style.backgroundColor = "rgb(179, 95, 95)";
				this._button.style.top =  `${buttonHeight}px`;
				this._button.style.left = `${buttonWidth}px`;
				//this._spaceButtons += (this._heightButton * 0.2);
				this._button.style.width = `${width}px`;
				this._button.style.height = `${height}px`;
			
				this._button.textContent = button;

				//this._spaceButtons += this._heightButton;

				document.body.appendChild(this._button);

				this._button.addEventListener("click", (event) => {
					const buttons: HTMLButtonElement[] = Array.from(document.querySelectorAll("button"));
					this._outline.remove();
					buttons.forEach(button => button.remove());
					this._target = event.target as HTMLButtonElement;
					this.center();
					resolve();
				})
			//}
		});
	}

	public playerOrIA() : Promise<void>
	{
		this._outline = document.createElement("div");

		this._outline.style.backgroundColor = "rgb(51, 155, 193)";
		this._outline.style.position = "absolute";
		this._outline.style.width = `300px`;
		this._outline.style.height = `50px`;
		this._outline.style.border = "5px solid black";
		this._outline.style.top = `calc(${window.innerHeight /  2}px -${300 / 2}px)`;
		this._outline.style.left = `calc(${window.innerWidth /  2}px -${50 / 2}px)`;

		document.body.appendChild(this._outline);

		return new Promise((resolve) => {
			//this._spaceButtons = window.innerHeight /  2 - this._heightMenu / 2 + this._heightButton * 0.2;

			// for (let x = 0; x < textButton.length; x++)
			// {
				this._button = document.createElement("button");

				this._button.style.position = "absolute";
				this._button.style.backgroundColor = "rgb(179, 95, 95)";
				this._button.style.top =  `calc(${window.innerHeight /  2}px -${this._heightMenu / 2}px)`;
				this._button.style.left = `calc(${window.innerWidth /  2}px - ${300 / 2.2}px)`;
				this._spaceButtons += (this._heightButton * 0.2);
				this._button.style.width = `${this._widthButton}px`;
				this._button.style.height = `${this._heightButton}px`;
			
				this._button.textContent = "Player";

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
			//}
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
				this.localGame();
				break;
			case 'Return' :
				await this.display(this._textButton[0]);
				break;
		}
	}

	public localGame()
	{
		this.displayMenuCustom(300, 50);
		this.displayButtonCustom("Test", 300, 50, 200, 3);
		// this.displayButtonCustom("Player", 300, 50);
		// this.displayButtonCustom("IA", 50, 50);

	}
}