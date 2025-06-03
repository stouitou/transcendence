import { Position, Size } from "../../types/gameUtils.type";

export class	Paddle {

	private	_position: Position;
	private	_size: Size;

	constructor (initialPosition: Position, size: Size) {
		this._position = { ...initialPosition };
		this._size = { ...size };
	}

	get position ()	{ return this._position ; }
	get size ()	{ return this._size ; }

	clamp (canvas:{ width: number, height: number }) {
		if (this._position.x < 0) this._position.x = 0;
		if (this._position.y < 0) this._position.y = 0;
		if (this._position.x + this._size.width > canvas.width)
			this._position.x = canvas.width - this._size.width;
		if (this._position.y + this._size.height > canvas.height)
			this._position.y = canvas.height - this._size.height;
	}
	move (dx: number, dy: number) {
		this._position.x += dx;
		this._position.y += dy;
		this.clamp({ width: 800, height: 600 });
	}
	setPosition (position: Position) {
		const canvas = { width: 800, height: 600 };
		this._position = { ...position };
		this.clamp(canvas);
	}

	toJSON () {
		return {
			position: this._position,
			size: this._size,
		};
	}
}