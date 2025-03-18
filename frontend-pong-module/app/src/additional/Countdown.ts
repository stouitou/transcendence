import { Display } from "../display/Display";

export class	Countdown extends Display {

	/* ATTIBUTES */
	private readonly	_element: HTMLDivElement;

	private readonly	_countdown: string[] = ["3", "2", "1", "GO!", ""];
	private readonly	_font: string = "system-ui";		// typeface of the text
	private readonly	_color: string = "rgb(0, 0, 0)";	// color of the text
	private readonly	_size: number = 140;					// size of the text in pixel
	private readonly	_vertical: number = 50;				// vertical position in percentage
	private readonly	_horizontal: number = 50;			// horizontal position in percentage

	/* CONSTRUCTOR */
	constructor (canvas: HTMLCanvasElement) {
		super(canvas);

		this._element = document.createElement("div");

		this._element.textContent = `${this._countdown[0]}`;
		this._element.style.font = `${this._font}`;
		this._element.style.color = `${this._color}`;
		this._element.style.fontSize = `${this._size}px`;
		this._element.style.top = `${this._vertical}%`;
		this._element.style.left = `${this._horizontal}%`;
		this._element.style.position = "absolute";
		this._element.style.transform = "translate(-50%, -50%)";
	}

	/* METHODS */
	public start () : Promise<void> {
		return new Promise((resolve) => {
			document.body.appendChild(this._element);
			for (let x = 1; x < this._countdown.length; x++) {
				setTimeout(() => {
					this._element.textContent = this._countdown[x];
					if (x === this._countdown.length - 1)
						resolve();
				}, x * 1000);
			}
		});
	}
}