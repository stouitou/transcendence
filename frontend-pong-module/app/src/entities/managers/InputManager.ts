type localMapping = Record< string, { dx: number; dy: number; direction: string } >;
const	localMappings: localMapping[] = [
	{
		ArrowUp:	{ dx: 0, dy: -5, direction: "up"},
		ArrowDown:	{ dx: 0, dy: 5, direction: "down" },
	},
	{
		s:	{ dx: 0, dy: -5, direction: "up"},
		x:	{ dx: 0, dy: 5, direction: "down" },
	},
	{
		ArrowLeft:	{ dx: -5, dy: 0 , direction: "left" },
		ArrowRight:	{ dx: 5, dy: 0 , direction: "right" },
	},
	{
		a:	{ dx: -5, dy: 0 , direction: "left" },
		d:	{ dx: 5, dy: 0 , direction: "right" }
	},
]
const	localBindMappings = {
	up:		{ dx: 0, dy: -3},	// up
	down:	{ dx: 0, dy: 3},	// down
	left:	{ dx: -3, dy: 0 },	// left
	right:	{ dx: 3, dy: 0 }	// right
}

export class	InputManager {

	private readonly	_isActive: boolean;
	private				_directionReceived:  string | null = null;
	private				_keysPressed: Set< string > = new Set< string >();
	private				_controlMapping: localMapping = {};
	private				_controlBindMapping: Record< string, { dx: number; dy: number } > = {};
	private				_eventListeners: { key:string, handler:(event: Event) => void }[] = [
		{
			key: 'keydown',handler: (event:Event) => {this._keysPressed.add((event as KeyboardEvent).key);},
		},
		{
			key: 'keyup', handler: (event:Event) => {this._keysPressed.delete((event as KeyboardEvent).key);},
		}
	]

	constructor (playerIndex: number = 0, isActive: boolean) {
		this._isActive = isActive;
		this._controlMapping = localMappings[playerIndex];
		this._controlBindMapping = localBindMappings;
		if (this._isActive) {
			window.addEventListener('keydown', (event) => { this._keysPressed.add(event.key); });
			window.addEventListener('keyup', (event) => { this._keysPressed.delete(event.key); });
		}
	}

	get eventListeners () { return this._eventListeners ; }

	set directionReceived (direction: string)	{ this._directionReceived = direction; }

	removeEventListeners() {
		if (!this._isActive) return;
		for (const listener of this.eventListeners) {
			window.removeEventListener(listener.key, listener.handler);
		}
	}

	getDirectionMovement () : { dx: number; dy: number, direction:string } {
		let	dx = 0;
		let	dy = 0;
		let	direction = '';

		for (const key of this._keysPressed) {
			if (this._controlMapping[key]) {
				direction = this._controlMapping[key].direction;
				dx += this._controlBindMapping[direction].dx;
				dy += this._controlBindMapping[direction].dy;
			}
		}
		return { dx, dy , direction};
	}

	clearDirection () {
		this._directionReceived = null;
	}

	getMovementByDirection () {
		let	dx = 0;
		let	dy = 0;

		if (this._directionReceived && this._controlBindMapping[this._directionReceived]) {
			dx += this._controlBindMapping[this._directionReceived].dx;
			dy += this._controlBindMapping[this._directionReceived].dy;
		}
		return { dx, dy } ;
	}
}
