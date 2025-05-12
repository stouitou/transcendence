import { Ball } from "./Ball";
import { Player } from "./Player";
import { Position } from "../Interfaces/Position.interface";

export class	Bot/*  extends Player  */{

	private readonly	_level: number;
	//private				_targetSide: string | null = null;
	private readonly tolerance: number = 20; // Tolérance pour éviter les vibrations

	constructor (level: number, private _player: Player) {
	//	super({name: null, role: 'bot'});
		this._level = level;
	//	console.log(`Bot created with level ${this._level}`);
	}

	/* override */ move (ball: Ball) {
		switch (this._player._location) {
			case 0:
			case 1:
				this.followBallVertical(ball);
				break ;
			case 2:
			case 3:
				this.followBallHorizontal(ball);
				break ;
		}
	}
	private followBallHorizontal(ball: Ball) {
		if (!this._player.paddle) return;
	
		const { paddle } = this._player;
		const target = paddle.position.x + paddle.size.width / 2; // Centre de la raquette
		const noise = (Math.random() - 0.5) * Math.pow(this._level, 4); // Bruit proportionnel au niveau
		const ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };
	
	//	console.log('Ball ball.velocity:', ball.velocity);
		// Vérifier si la balle s'éloigne
		if (ball.velocity.y > 0 && this._player._location === 2) {
		  this.repositionToCenterHorizontal();
		  return;
		} else if (ball.velocity.y < 0 && this._player._location === 3) {
		  this.repositionToCenterHorizontal();
		  return;
		}
	
		// Vérifier si le bot doit bouger
		if (Math.abs(target - ballPosition.x) > this.tolerance) {
		  if (target > ballPosition.x) {
			this._player.inputManager?.setDirection("left");
		  } else if (target < ballPosition.x) {
			this._player.inputManager?.setDirection("right");
		  }
		} else {
		  // Si la différence est inférieure à la tolérance, arrêter le mouvement
		  this._player.inputManager?.clearDirection();
		}
	  }
	
	  private followBallVertical(ball: Ball) {
		if (!this._player.paddle) return;
	
		const { paddle } = this._player;
		const target = paddle.position.y + paddle.size.height / 2; // Centre de la raquette
		const noise = (Math.random() - 0.5) * Math.pow(this._level, 4); // Bruit proportionnel au niveau
		const ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };
	
		// Vérifier si la balle s'éloigne
		if (ball.velocity.x > 0 && this._player._location === 0) {
		  this.repositionToCenterVertical();
		  return;
		} else if (ball.velocity.x < 0 && this._player._location === 1) {
		  this.repositionToCenterVertical();
		  return;
		}
	
		// Vérifier si le bot doit bouger
		if (Math.abs(target - ballPosition.y) > this.tolerance) {
		  if (target > ballPosition.y) {
			this._player.inputManager?.setDirection("up");
		  } else if (target < ballPosition.y) {
			this._player.inputManager?.setDirection("down");
		  }
		} else {
		  // Si la différence est inférieure à la tolérance, arrêter le mouvement
		  this._player.inputManager?.clearDirection();
		}
	  }
	
	  private repositionToCenterHorizontal() {
		if (!this._player.paddle) return;
		const { paddle } = this._player;
		const center = 350; // Centre horizontal du mur
		const target = paddle.position.x + paddle.size.width / 2;
	
		if (Math.abs(target - center) > this.tolerance) {
		  if (target > center) {
			this._player.inputManager?.setDirection("left");
		  } else if (target < center) {
			this._player.inputManager?.setDirection("right");
		  }
		} else {
		  this._player.inputManager?.clearDirection();
		}
	  }
	
	  private repositionToCenterVertical() {
		if (!this._player.paddle) return;
		const { paddle } = this._player;
		const center = 250; // Centre vertical du mur
		const target = paddle.position.y + paddle.size.height / 2;
	
		if (Math.abs(target - center) > this.tolerance) {
		  if (target > center) {
			this._player.inputManager?.setDirection("up");
		  } else if (target < center) {
			this._player.inputManager?.setDirection("down");
		  }
		} else {
		  this._player.inputManager?.clearDirection();
		}
	  }

/* 	private followBallHorizontal (ball: Ball) {
		if (!this._player.paddle)
			return ;
		const { paddle } = this._player;
		//let 	target = paddle.coordinates.center.x;//centre de la raquette
		let 	target = paddle.position.x + paddle.size.width / 2//centre de la raquette
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);//bruit : le noise est proportionnel au niveau,//
		//  c 'est à dire que plus le niveau est élevé, plus le bruit est faible, en consequence la raquette suit le ballon de plus près
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };

		const	isVertical = Math.abs(ball.velocity.x) < 0.2;
		const	isAligned = Math.abs(target - ball.position.x) < 8;
 
		if (isVertical && isAligned) {
			if (this._targetSide === null)	{ this._targetSide = Math.random() < 0.5 ? 'right' : 'left'; }
			target = this._targetSide === 'right'
				? target + (9 * (paddle.size.height / 10))
				: target + (paddle.size.height / 10);
		}

		if (target > ballPosition.x) {
			this._player.inputManager.setDirection('left');
			console.log('left');
			//this._direction = 'left';
		}
		else if (target < ballPosition.x) {
			console.log('right');
			//this._direction = 'right';
			this._player.inputManager.setDirection('right');
		}
	}

	private followBallVertical (ball: Ball) {
		if (!this._player.paddle)
			return ;
		const { paddle } = this._player;
		let 	target = paddle.position.y + paddle.size.height / 2//centre de la raquette
		
		const	noise = (Math.random() - 0.5) * Math.pow(this._level, 4);
		const	ballPosition: Position = { x: ball.position.x + noise, y: ball.position.y + noise };

		const	isHorizontal = Math.abs(ball.velocity.y) < 0.2;
		const	isAligned = Math.abs(target - ball.position.y) < 8;

		if (isHorizontal && isAligned) {
			if (this._targetSide === null)	{ this._targetSide = Math.random() < 0.5 ? 'down' : 'up'; }
			target = this._targetSide === 'down'
				? target + (9 * (paddle.size.height / 10))
				: target + (paddle.size.height / 10);
		}
		
		if (target > ballPosition.y) { 
			this._player.inputManager.setDirection('up');
			console.log('up');
			//this._direction = 'up';
		}
		else if (target < ballPosition.y) {
			this._player.inputManager.setDirection('down');
			console.log('down');
			//this._direction = 'down';
		}
	} */
}