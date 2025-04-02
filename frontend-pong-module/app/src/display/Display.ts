export class	Display {

	/* ATTRIBUTES */
	protected readonly	_canvas: HTMLDivElement;
	protected readonly	_gameContainer: HTMLElement;
	protected readonly	_field: DOMRect;

	/* CONSTRUCTOR */
	constructor (canvas: HTMLDivElement) {
		this._canvas = canvas;
		this._gameContainer = canvas.parentElement as HTMLElement;

		this._gameContainer.style.position = "relative";
		this._field = this._canvas.getBoundingClientRect();
	}

	public get gameContainer () {
		return this._gameContainer ;
	}
}
  