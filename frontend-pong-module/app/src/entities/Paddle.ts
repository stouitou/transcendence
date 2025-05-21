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
	// type localMapping = Record<string, { dx: number;dy: number;direction: string }>;
	// const localMappings: localMapping[] =
	// 	 [
	// 		{
	// 		ArrowUp: { dx: 0, dy: -5, direction:"up"},// up
	// 		ArrowDown: { dx: 0, dy: 5, direction:"down" },// down
	// 		},
	// 		{
	// 		z: { dx: 0, dy: -5, direction:"up"},// up
	// 		s: { dx: 0, dy: 5, direction:"down" },// down
	// 		},
	// 		{
	// 		ArrowLeft: { dx: -5, dy: 0 , direction:"left" },// left
	// 		ArrowRight: { dx: 5, dy: 0 , direction:"right" },// right
	// 		},
	// ]
	// const localBindMappings	=	{
	// up: { dx: 0, dy: -5},// up
	// down: { dx: 0, dy: 5},// down
	// left: { dx: -5, dy: 0 },// left
	// right: { dx: 5, dy: 0 },// right
	// }
