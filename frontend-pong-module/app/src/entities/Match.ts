export class	Match {

	private readonly	_color: string = 'rgb(0, 0, 0)';
	private readonly	_width: number;
	private readonly	_height: number;

	constructor (field: CanvasRenderingContext2D, width: number, height: number) {
		this._width = width;
		this._height = height;

		field.fillStyle = this._color;
		field.fillRect(0, 0, this._width, this._height);
	}
}