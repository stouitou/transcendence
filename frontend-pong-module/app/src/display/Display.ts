export class	Display {

	/* ATTRIBUTES */
	protected readonly	_canvas: HTMLCanvasElement;
	protected readonly	_context: CanvasRenderingContext2D;
	protected readonly	_gameContainer: HTMLElement;

	protected readonly	_field: DOMRect;

	/* CONSTRUCTOR */
	constructor (canvas: HTMLCanvasElement) {
		this._canvas = canvas;
		this._context = this._canvas.getContext("2d")!;
		this._gameContainer = canvas.parentElement as HTMLElement;

		this._gameContainer.style.position = "relative";
		// this._gameContainer.style.width = "600px";
		// this._gameContainer.style.paddingLeft = "0px";
		this._field = this._canvas.getBoundingClientRect();
	}

	public get gameContainer () {
		return this._gameContainer ;
	}
}
  