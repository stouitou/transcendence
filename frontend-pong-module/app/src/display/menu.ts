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
		const textButton: string[] = ["1V1", "Tournoi", "Multijoueur", "Return"];
		
		this.display(this._textButton[0]);
	}

	

	public displayMenu(textButton: string[])
	{
		this._heightMenu = this._heightButton * textButton.length + (this._heightButton * 0.2 * (textButton.length + 1));
		this._widthMenu = this._widthButton + (this._widthButton * 0.2);
		this._outline = document.createElement("div");

		console.log(this._heightMenu);
		this._outline.style.backgroundColor = "rgb(34, 101, 126)";
		this._outline.style.position = "absolute";
		this._outline.style.width = `${this._widthMenu}px`;
		this._outline.style.height = `${this._heightMenu}px`;
		this._outline.style.border = "5px solid black";
		this._outline.style.top = `calc(${window.innerHeight /  2}px -${this._heightMenu / 2}px)`;

		document.body.appendChild(this._outline);
	}

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
		
	}
}