import { Player } from './entities/Player.js';
import { Tournament } from './entities/Tournament.js';
let players = [new Player("Olivier"), new Player("Sarah"), new Player("test1"), new Player("test2"), new Player("test3"), new Player("test4"), new Player("test5")];
const tournament = new Tournament(7, players);
//const game = new Game();
