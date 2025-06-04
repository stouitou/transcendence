import { Position } from "../Interfaces/Position.interface";
import { Size } from "../Interfaces/Size.interface";

export class	Paddle {

	private				_position:	Position;
	private readonly	_size:		Size;
	
	constructor (initialPosition: Position, size: Size) {
		this._position = { ...initialPosition };
		this._size = { ...size };
	}

	get position ()	{ return this._position ; }
	get size ()		{ return this._size ; }

	set position (position: Position)	{ this._position = position}

	clamp (canvas: { width: number, height: number }) {
		if (this._position.x < 0)	{ this._position.x = 0; }
		if (this._position.y < 0)	{ this._position.y = 0; }
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
}
