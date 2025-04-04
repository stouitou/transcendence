export abstract class	Object {

	protected readonly	_field: CanvasRenderingContext2D;
	protected readonly	_fieldWidth: number;
	protected readonly	_fieldHeight: number;

	constructor (canvas: HTMLCanvasElement) {
		this._field = canvas.getContext('2d')!;
		this._fieldWidth = canvas.width;
		this._fieldHeight = canvas.height;
	}

	abstract move (): void ;
}