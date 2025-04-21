import { Player } from "./Player";

export class	Real extends Player {

	constructor (json: any) {
		super(json);
		this.eventListener();
	}

	private eventListener () {
		if (this._location === 0) {
			document.addEventListener('keydown', (event) => {
				if (this._paddle && event.key === 'ArrowUp') {
					this._paddle.moveUp = true;
				}
				if (this._paddle && event.key === 'ArrowDown') {
					this._paddle.moveDown = true;
				}
			})
			document.addEventListener('keyup', (event) => {
				if (this._paddle && event.key === 'ArrowUp') {
					this._paddle.moveUp = false;
				}
				if (this._paddle && event.key === 'ArrowDown')
					this._paddle.moveDown = false;
			})
		}
		else if (this._location === 1) {
			document.addEventListener('keydown', (event) => {
				if (this._paddle && event.key === 's')
					this._paddle.moveUp = true;
				if (this._paddle && event.key === 'x')
					this._paddle.moveDown = true;
			})
			document.addEventListener('keyup', (event) => {
				if (this._paddle && event.key === 's')
					this._paddle.moveUp = false;
				if (this._paddle && event.key === 'x')
					this._paddle.moveDown = false;
			})
		}
	}
}