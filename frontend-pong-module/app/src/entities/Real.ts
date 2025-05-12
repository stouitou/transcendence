import { Player } from "./Player";

export class	Real extends Player {

	constructor (json: any) {
		super(json);
	}

	override move () {
		this._keyPressed.forEach((key) => {
			switch (this._location) {
				case 0:
					if (key === 'ArrowUp')			this._direction = 'up';
					else if (key === 'ArrowDown')	this._direction = 'down';
					break ;
				case 1:
					if (key === 'w' || 'W')				this._direction = 'up';
					else if (key === 's' || 'S')			this._direction = 'down';
					break ;
				case 2:
					if (key === 'ArrowLeft')		this._direction = 'left';
					else if (key === 'ArrowRight')	this._direction = 'right';
					break ;
				case 3:
					if (key === 'a' || 'A')				this._direction = 'left';
					else if (key === 'd' || 'D')			this._direction = 'right';
					break ;	
			}
		});
	}
}