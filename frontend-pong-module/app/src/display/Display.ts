export class	Display {

	/* ATTRIBUTES */
	protected	_canvas: HTMLCanvasElement;
	protected	_context: CanvasRenderingContext2D;
	protected	_gameContainer: HTMLElement;

	/* CONSTRUCTOR */
	constructor (canvas: HTMLCanvasElement) {
		this._canvas = canvas;
		this._context = this._canvas.getContext("2d")!;
		this._gameContainer = canvas.parentElement as HTMLElement;
	}
}
  