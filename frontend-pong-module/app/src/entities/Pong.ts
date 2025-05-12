export type Direction = 'left' | 'right' | 'top' | 'bottom';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export class Paddle {
	position: Position;
	size: Size;
  
	constructor(initialPosition: Position, size: Size) {
	  this.position = { ...initialPosition };
	  this.size = { ...size };
	}
	clamp(canvas:{ width: number, height: number }) {
		if (this.position.x < 0) this.position.x = 0;
		if (this.position.y < 0) this.position.y = 0;
		if (this.position.x + this.size.width > canvas.width)
			this.position.x = canvas.width - this.size.width;
		if (this.position.y + this.size.height > canvas.height)
			this.position.y = canvas.height - this.size.height;
	}
	move(dx: number, dy: number) {
	  this.position.x += dx;
	  this.position.y += dy;
	  this.clamp({ width: 800, height: 600 });
	}
  }
  type localMapping = Record<string, { dx: number;dy: number;direction: string }>;
  const localMappings: localMapping[] =
		 [
		  {
			ArrowUp: { dx: 0, dy: -5, direction:"up"},// up
			ArrowDown: { dx: 0, dy: 5, direction:"down" },// down
		  },
		  {
			z: { dx: 0, dy: -5, direction:"up"},// up
			s: { dx: 0, dy: 5, direction:"down" },// down
		  },
		  {
			ArrowLeft: { dx: -5, dy: 0 , direction:"left" },// left
			ArrowRight: { dx: 5, dy: 0 , direction:"right" },// right
		  },
  ]
  const localBindMappings  =  {
	up: { dx: 0, dy: -5},// up
	down: { dx: 0, dy: 5},// down
	left: { dx: -5, dy: 0 },// left
	right: { dx: 5, dy: 0 },// right
  }

  export class InputManager {
	playerIndex: number;
	keysPressed = new Set<string>();
	directionReceived = new Set<string>();
	controlMapping: Record<string, { dx: number; dy: number,direction:string}> = {};
	controlBindMapping: Record<string, { dx: number; dy: number}> = {};
	eventListeners: {key:string, handler:(event: Event) => void}[] = [
		{
			key: 'keydown',handler: (event:Event) => {this.keysPressed.add((event as KeyboardEvent).key);},
		},
		{
			key: 'keyup', handler: (event:Event) => {this.keysPressed.delete((event as KeyboardEvent).key);},
		}

	]
  
	constructor(playerIndex: number = 0,private isActive:boolean = false) {
		this.playerIndex = playerIndex;
		this.setMapping(localMappings[playerIndex]);
		this.setBindMapping(localBindMappings);
		if(this.isActive){
			window.addEventListener('keydown', (e) => {this.keysPressed.add(e.key),console.log("keydown",event);});
			window.addEventListener('keyup', (e) => this.keysPressed.delete(e.key));
		}
	}
	removeEventListeners() {
		if (!this.isActive) return;
		for (const listener of this.eventListeners) {
			window.removeEventListener(listener.key, listener.handler);
		}
	}
	getEventListeners() {
		return this.eventListeners;
	}

  
	//lier les touches de direction arrowUp, arrowDown, arrowLeft, arrowRight ...
	setMapping(mapping: Record<string, { dx: number; dy: number,direction:string }>) {
	  this.controlMapping = mapping;
	//  console.log('Control mapping set:', this.controlMapping['ArrowUp']);
	}
	//lier les actions de direction up, down, left, right 
	setBindMapping(mapping: Record<string, { dx: number; dy: number }>) {
		this.controlBindMapping = mapping;
	  //  console.log('Control mapping set:', this.controlMapping['ArrowUp']);
	  }
  
	getMovement(): { dx: number; dy: number, direction:string } {
	  let dx = 0;
	  let dy = 0;
	  let direction = '';
	  for (const key of this.keysPressed) {
		if (this.controlMapping[key]) {
		  dx += this.controlMapping[key].dx;
		  dy += this.controlMapping[key].dy;
		  direction = this.controlMapping[key].direction;
		}
	  }
	  return { dx, dy , direction};
	}
	getDirectionMovement():{ dx: number; dy: number, direction:string } {
		let dx = 0;
		let dy = 0;
		let direction = '';
		for (const key of this.keysPressed) {
		  if (this.controlMapping[key]) {
			direction = this.controlMapping[key].direction;
			dx += this.controlBindMapping[direction].dx;
			dy += this.controlBindMapping[direction].dy;
		  }
		}
		return { dx, dy , direction};
	}

	setDirection(direction: string) {
		this.directionReceived.add(direction);
	}
	clearDirection() {
		this.directionReceived.clear();
	}
	getMovementByDirection() {
		let dx = 0;
		let dy = 0;
		for (const direction of this.directionReceived) {
		  if (this.controlBindMapping[direction]) {
			dx += this.controlBindMapping[direction].dx;
			dy += this.controlBindMapping[direction].dy;
		  }
		}
		return { dx, dy };
	  }
  }

 const directions:Direction[] = ['left', 'right', 'top', 'bottom'];
export class Player {
	id: string;
	state: string = 'waiting'; // waiting, playing, finished
	name: string = 'host';
	isRemote: boolean = false;
	isIA: boolean = false;
	isInGame: boolean = false;
	paddle: Paddle;
	direction: Direction;
	score: number = 0;
	position: Position = { x: 0, y: 0 };

	constructor(jsonData: any, paddle:Paddle|null=null /* new Paddle( { x: 0, y: 0 },{width:10,height:50}) */, index: number = 0) {
		this.paddle =paddle ||new Paddle(jsonData.paddle.position, jsonData.paddle.size);
		this.direction = directions[index];
			this.id = jsonData.id;
			this.name = jsonData.name;
			this.isRemote = jsonData.isRemote;
			this.isIA = jsonData.isIA;
			this.isInGame = jsonData.isInGame;
			this.score = jsonData.score?? 0;
	}
	setScore(score: number) {
		this.score = score;
	}
	setPosition(position: Position) {
		this.paddle.position = position;
	}

}

export class Ball {
	position: Position;
	size: Size;
	velocity: Position; // dx, dy
  
	constructor(initialPosition: Position, size: Size, initialVelocity: Position) {
	  this.position = { ...initialPosition };
	  this.size = { ...size };
	  this.velocity = { ...initialVelocity };
	}
  
	update() {
	  this.position.x += this.velocity.x;
	  this.position.y += this.velocity.y;
	}
  
	reset(position: Position, velocity: Position = this.velocity) {
	  this.position = { ...position };
	  this.velocity = { ...velocity };
	}
  }

export class Pong {
  lobyId: string = '';
  gameId: string = '';
  wsMessageHandler: (data:any) => void = (data:any) => {console.log("wsMessageHandler",data)};
  players: Player[] = [];
  ball: Ball;
  inputManagers: Map<string, InputManager> = new Map(); // par joueur id
  updateInterval: number = 16; // 60fps
  gameLoopId: any;
  canvas: HTMLCanvasElement; // Référence au conteneur canvas
  ctx: CanvasRenderingContext2D | null; // Contexte de rendu

  canvasUI: HTMLCanvasElement; // Référence au conteneur canvas
  ctxUI: CanvasRenderingContext2D | null; // Contexte de rendu
  stopped: boolean = true;
 // elements: Map<string, HTMLElement> = new Map(); // Stocke les éléments DOM par id


  constructor(canvas: HTMLCanvasElement,canvasUI: HTMLCanvasElement) {
	//this.wsMessageHandler = wsMessageHandler;
	//this.ball = ball;
	this.ball = new Ball(
		{ x: 400, y: 300 }, // Position initiale
		{ width: 10, height: 10 }, // Taille
		{ x: 2, y: 2 } // Vélocité initiale
	);
	this.canvas = canvas;
 	this.ctx = canvas.getContext('2d');
	this.canvasUI = canvasUI;
	this.ctxUI = canvasUI.getContext('2d');
  }
  setLobyId(lobyId: string) {
	this.lobyId = lobyId;
  }
  setGameId(gameId: string) {
	this.gameId = gameId;
  }

  setBall(ball: Ball) {
	this.ball = ball;
  }

  private addPlayer(player: Player, inputManager: InputManager) {
    this.players.push(player);
    this.inputManagers.set(player.id, inputManager);
	console.log('addPlayer',this.players);
  }
  addPlayers(players: Player[], inputManagers: InputManager[]) {
	players.forEach((player, index) => {
        console.log('player:', index,player.id);
        this.addPlayer(player, inputManagers[index]);
      });

  }
  clearPlayers() {
	if (this.players.length > 0) {
	  console.log(`[Pong] Clearing ${this.players.length} players...`);
  
	  this.players.forEach((player) => {
		// Nettoyer les InputManager associés
		if (this.inputManagers.has(player.id)) {
		  const inputManager = this.inputManagers.get(player.id);
		  try {
			inputManager?.removeEventListeners();
			console.log(`[Pong] Removed event listeners for player ${player.id}`);
		  } catch (error) {
			console.error(`[Pong] Failed to remove event listeners for player ${player.id}:`, error);
		  }
		  this.inputManagers.delete(player.id);
		}
  
		// Nettoyer d'autres ressources associées au joueur (si nécessaire)
		player.isInGame = false;
		player.state = 'waiting';
		console.log(`[Pong] Reset player ${player.id} state.`);
	  });
  
	  // Vider la liste des joueurs
	  this.players = [];
	  console.log(`[Pong] All players cleared.`);
	} else {
	  console.log(`[Pong] No players to clear.`);
	}
  }


  start() {
	this.stopped = false;
	//this.setupVisuals();
	 setInterval(() => {
	if (this.stopped) {
		  clearInterval(this.gameLoopId);
		  return;
		}
		//metre a jour les donnes du movement des joueurs/ et ball
//	this.updateMovement();
		//metre a jour les donnes de la collision et le score
//	this.updateCollision();
	//on dessine le canvas
	  this.draw();
	}, this.updateInterval); 
  }

  
  startLocal(wsMessageHandler: (message:any) => void,forceStop:boolean=false) {
	this.wsMessageHandler = wsMessageHandler;
	this.stopped = false;

	//this.setupVisuals();
	 setInterval(() => {
	if (this.stopped) {
		  clearInterval(this.gameLoopId);
		  return;
		}
		//metre a jour les donnes du movement des joueurs/ et ball
	this.updateMovement();
		//metre a jour les donnes de la collision et le score
	this.updateCollision();
	//on dessine le canvas
	  this.draw();
	  if(forceStop){this.stop(),console.log("FORCE STOP :Game finished");}
	  if (this.players.some(player => player.state === 'finished')) {
		this.stopped = true;
		clearInterval(this.gameLoopId);
		//display the winner
		//send result to the server
		console.log("Game finished");
		//this.sendResult();
	  }
	},  this.updateInterval*2); 
  }
  stop() {
	this.stopped = true;
  }

  updateMovement() {
    // Déplacements paddles
	for (const [index, player] of this.players.entries()) {
   // for (const player of this.players) {
		//recupere le mouvement du joueur
		// 1 - recuperer le inputManager du joueur
      const inputManager = this.inputManagers.get(player.id);
      if (inputManager && !player.isIA) {
		// 2 - recuperer le mouvement du joueur
        const movement =inputManager.getDirectionMovement(); //inputManager.getMovement();
		// 3 - mettre a jour les donnees la position du paddle
        player.paddle.move(movement.dx, movement.dy);
      }
	  if (player.isIA) {
		// 2 - recuperer le mouvement du joueur
		const movement = this.moveBot(player, index);
	//	console.log("movement",movement);
		// 3 - mettre a jour les donnees la position du paddle
		player.paddle.move(movement.dx, movement.dy);
	  }
    }

   // Déplacement balle
    this.ball.update();
 /* 
    // Collision balle / paddles
    for (const player of this.players) {
      if (this.hasCollision(this.ball, player.paddle)) {
        this.handleBallBounce(player.direction);
      }
    }
	const wallIndex = this.wallCollision();
	this.updateScore(wallIndex);

    */
  }
  updateCollision() {
	// Collision balle / paddles
    for (const player of this.players) {
		if (this.hasCollision(this.ball, player.paddle)) {
		  this.handleBallBounce(player.direction);
		}
	  }
	  const wallIndex = this.wallCollision();
	  this.updateScore(wallIndex);
	}

  updateScore(wallIndex:number){
	const maxScore = 5; // Score maximum pour gagner
    // Vérifier si la collision est valide
    if (wallIndex === -1) return; // Pas de collision avec un mur
    if (this.players.length <= wallIndex) return; // Pas de joueur pour ce mur

    let resetBall = false;

    // Parcourir les joueurs pour mettre à jour le score
	let score = 0;
    for (const [index, player] of this.players.entries()) {
        if (index !== wallIndex) {
			if (player.score === undefined) {
				player.score = 0; // Initialiser le score à 0 si non défini
			}
            // Si ce n'est pas le joueur défendant le mur, incrémenter son score
            player.score++;
			if (score <= player.score) {
				score = player.score;
			}
            resetBall = true;
         //   console.log(`id:${player.id} name:${player.name} score: ${player.score}`);
        }
    }

    // Réinitialiser la balle si un point a été marqué
    if (resetBall) {
		// Vérifier si le score maximum est atteint
		if (score >= maxScore) {
			// les player passe en finished
			this.players.forEach((player) => {
					player.state = "finished";
					player.isInGame = false;
			});
			const dataMessage = {
				type: "UPDATESCORE",
				gameId: this.gameId,
				lobyId: this.lobyId,
				data: {
					players: this.players,
				},
			}
			this.wsMessageHandler(dataMessage);
			
		}
        this.ball.reset({ x: 400, y: 300 });
    }
  }

  wallCollision(): number {
	// Collision avec les murs
	//mur left 
	if (this.ball.position.x <= 0) {
		this.ball.velocity.x *= -1; // Inverser la direction horizontale
		return 0; // 
	  }
	//mur right
	if (this.ball.position.x + this.ball.size.width >= this.canvas.width) {
		this.ball.velocity.x *= -1; // Inverser la direction horizontale
		return 1; //
	}
	//mur top
	if (this.ball.position.y <= 0) {
		this.ball.velocity.y *= -1; // Inverser la direction verticale
		return 2; //
	  }
	//mur botom
	if (this.ball.position.y + this.ball.size.height >= this.canvas.height) {
		this.ball.velocity.y *= -1; // Inverser la direction verticale
		return 3; //
	  }
	return -1; // Aucune collision
  }

  hasCollision(ball: Ball, paddle: Paddle): boolean {
    return (
      ball.position.x < paddle.position.x + paddle.size.width &&
      ball.position.x + ball.size.width > paddle.position.x &&
      ball.position.y < paddle.position.y + paddle.size.height &&
      ball.position.y + ball.size.height > paddle.position.y
    );
  }

  handleBallBounce(direction: Direction) {
    // Inverser la vélocité selon le côté du paddle touché
    if (direction === 'left' || direction === 'right') {
      this.ball.velocity.x *= -1;
    } else if (direction === 'top' || direction === 'bottom') {
      this.ball.velocity.y *= -1;
    }
  }


	  
	
	  
		/* setupVisuals() {
		  // Créer la balle
		  const ballElem = document.createElement('div');
		  ballElem.classList.add('ball');
		  this.container.appendChild(ballElem);
		  this.elements.set('ball', ballElem);
	  
		  // Créer les paddles pour chaque joueur
		  for (const player of this.players) {
			const paddleElem = document.createElement('div');
			paddleElem.classList.add('paddle', player.id);
			this.container.appendChild(paddleElem);
			this.elements.set(player.id, paddleElem);
		  } 
		}*/
	  
		x:number = 0;
		y:number = 0;
		maxballposition(ball:Ball) {
			if (ball.position.x > this.x) {
				this.x = ball.position.x;
			}
			if (ball.position.y > this.y) {
				this.y = ball.position.y;
			}
		}
		draw() {
			//console.log("draw",this.canvas.width,this.canvas.height);
			this.maxballposition(this.ball);
			if (!this.ctx) return;
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		  
			this.drawRect(0,0, 10, 10);
			this.drawRect(790,590, 10, 10);
			// Draw paddles			
			this.players.map((player) => {
				const paddle = player.paddle;
				this.drawRect(paddle.position.x, paddle.position.y, paddle.size.width, paddle.size.height);
			});		  
			// Draw ball
			const {position,size} = this.ball;
			
			this.drawRect(position.x, position.y, size.width, size.height);
			// Draw UI
			this.drawUI();
		  }

		  drawUI() {
			if (!this.ctxUI) return;
			this.ctxUI.clearRect(0, 0, this.canvasUI.width, this.canvasUI.height);
			const padding = this.canvasUI.width / (this.players.length+2) ;
			this.players.map((player, index) => {
				//Draw Player-Number
				this.drawText(`Player-${index+1}`, (index+1) * padding + 20, 20);
			// Draw player names
				this.drawText(player.name, (index+1) * padding + 20, 50);
			// Draw scores			
				this.drawNumber(player.score, (index+1) * padding + 20, 80);
			});
		}

		  // Draw Utilitaire
		  drawRect(x: number, y: number, w: number, h: number, color:string = 'white') {
			if (!this.ctx) {
				console.error('Canvas context is not defined');
				return;
			}
			this.ctx.fillStyle = color;
			this.ctx.fillRect(x, y, w, h);
		  }

		  drawNumber(num:number, x:number, y:number, color:string = 'white') {
			if (!this.ctxUI) return;
			this.ctxUI.fillStyle = color;
			this.ctxUI.font = '20px Arial';
			this.ctxUI.fillText(num.toString(), x, y);
		  }
		  drawText(text:string, x:number, y:number, color:string = 'white') {
			if (!this.ctxUI) return;
			this.ctxUI.fillStyle = color;
			this.ctxUI.font = '20px Arial';
			this.ctxUI.fillText(text, x, y);	
		  };


		 updateGameState(game:{ball:{position: {x:number,y:number},size:{width:number,height:number}}, players: Player[]}) {
			this.ball.position = game.ball.position;
		//	this.ball.size = game.ball.size;
			for (const [index, player] of game.players.entries()) {
				//this.players[index].paddle.position = player.position;
				this.players[index].paddle.position = player.paddle.position;
				/* this.players[index].paddle.size = player.paddle.size; */
				this.players[index].score = player.score;
			}
		 }




	moveBot = (player: Player, index: number): {dx:number,dy:number} => {
		const canvas = { width: 800, height: 600 };
		const mouvementReference = localBindMappings
	
		const botPos = player.paddle.position!;
		const botSize = player.paddle.size;
		const ballPos = this.ball.position;
		const ballVel = this.ball.velocity;
	
		// Center of the paddle
		const botCenterX = botPos.x + botSize.width / 2;
		const botCenterY = botPos.y + botSize.height / 2;
	
		// Center of the ball
		const ballCenterX = ballPos.x + this.ball.size.width / 2;
		const ballCenterY = ballPos.y + this.ball.size.height / 2;
	
		//const botSpeed = 5; // Speed at which the bot can move
		const tolerance = 10; // Tolerance 
	
		let targetX = botCenterX;
		let targetY = botCenterY;
	
		switch (index) {
			case 0: // Left wall
				if (ballVel.x < 0) {
					targetY = ballCenterY; // Move to align with ball
				} else {
					targetY = canvas.height / 2; // Go back to center
				}
				if (Math.abs(botCenterY - targetY) > tolerance) {
					return botCenterY > targetY ? mouvementReference["up"] : mouvementReference["down"];
				}
				break;
	
			case 1: // Right wall
				if (ballVel.x > 0) {
					targetY = ballCenterY;
				} else {
					targetY = canvas.height / 2;
				}
				if (Math.abs(botCenterY - targetY) > tolerance) {
					return botCenterY > targetY ? mouvementReference["up"] : mouvementReference["down"];
				}
				break;
	
			case 2: // Top wall
				if (ballVel.y < 0) {
					targetX = ballCenterX;
				} else {
					targetX = canvas.width / 2;
				}
				if (Math.abs(botCenterX - targetX) > tolerance) {
					return botCenterX > targetX ? mouvementReference["left"] : mouvementReference["right"];
				}
				break;
	
			case 3: // Bottom wall
				if (ballVel.y > 0) {
					targetX = ballCenterX;
				} else {
					targetX = canvas.width / 2;
				}
				if (Math.abs(botCenterX - targetX) > tolerance) {
					return botCenterX > targetX ? mouvementReference["left"] : mouvementReference["right"];
				}
				break;
		}
	
		return {dx: 0, dy: 0}; // No movement
	};


	static drawRect(ctx:CanvasRenderingContext2D ,x: number, y: number, w: number, h: number, color:string = 'white') {
	/* 	if (!ctx) {
			console.error('Canvas context is not defined');
			return;
		} */
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	  }

	 static  drawText(ctx:CanvasRenderingContext2D ,text:string, x:number, y:number, color:string = 'white') {
		if (!ctx) return;
		ctx.fillStyle = color;
		ctx.font = '20px Arial';
		ctx.fillText(text, x, y);	
	  };
	static drawWaitingScreen(canvas: HTMLCanvasElement) {
		if (!canvas) return;
		canvas.style.backgroundColor = 'black';
 		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	  
		//Pong.drawRect(ctx,0,0, canvas.width, canvas.height);
		
		// center wainting screen
		const text = "No GAME ...";
		Pong.drawText(ctx,text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height / 2, 'white');
	  }
	  }
	  