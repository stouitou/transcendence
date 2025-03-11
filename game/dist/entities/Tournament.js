var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Game } from "./Game.js";
export class Tournament {
    /* CONSTRUCTOR */
    constructor(nofPlayers, players) {
        this._match = new Map();
        this._game = null;
        this._players = players;
        this._nofPlayers = nofPlayers;
        this.randomize(nofPlayers, players);
        this.createMatchs(nofPlayers, players);
    }
    randomize(nofPlayers, players) {
        for (let i = 0; i < nofPlayers; i++) {
            let id;
            do {
                id = Math.floor(Math.random() * nofPlayers / 2) + 1;
            } while (this.takenId(id, nofPlayers, players));
            players[i].id = id;
        }
    }
    createMatchs(nofPlayers, players) {
        var _a;
        let _match = new Map();
        for (let i = 0; i < nofPlayers; i++) {
            if (_match.has(players[i].id))
                (_a = _match.get(players[i].id)) === null || _a === void 0 ? void 0 : _a.push(players[i]);
            else
                _match.set(players[i].id, [players[i]]);
        }
        for (let i = 0; i <= (nofPlayers + 1) / 2; i++)
            console.log(_match.get(i));
        this.launchGame((nofPlayers + 1) / 2, _match);
    }
    takenId(id, nofPlayers, players) {
        let once = 0;
        for (let x = 0; x < nofPlayers; x++) {
            if (players[x].id === id) {
                if (!once)
                    once++;
                else
                    return true;
            }
        }
        return false;
    }
    launchGame(nofMatch, _match) {
        return __awaiter(this, void 0, void 0, function* () {
            let i = 1;
            let nextRound = [];
            let j = 0;
            if (nofMatch === 1)
                return;
            while (i <= nofMatch) {
                const game = this._match.get(i);
                if (game && game.length === 2) {
                    // console.log("Je suis I dans le if ", i);
                    // console.log("launch game");
                    console.log("game[0].name", game[0].name);
                    console.log("game[1].name", game[1].name);
                    // console.log("this._match.get(i)", this._match.get(i));
                    this._game = new Game(game[0], game[1]);
                    yield this._game.launch();
                    document.body.innerHTML = ''; //a revoir, remet la page a 0
                    if (this._game)
                        nextRound[j] = game[0].lastWin ? game[0] : game[1];
                    j++;
                }
                else if (game) {
                    nextRound[j] = game[0];
                    j++;
                }
                i++;
            }
            for (let k = 0; k < nextRound.length; k++)
                console.log("winner :", nextRound[k]);
            this.createMatchs((nofMatch + 1) / 2, nextRound);
            // passe a la ligne suivante si cest possible if fin de la Game();
            // 	loop;
        });
    }
}
