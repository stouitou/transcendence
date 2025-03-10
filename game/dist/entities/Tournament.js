import { Game } from "./Game.js";
export class Tournament {
    /* CONSTRUCTOR */
    constructor(nofPlayers, players) {
        var _a;
        this._match = new Map();
        this._game = null;
        this._players = players;
        this._nofPlayers = nofPlayers;
        for (let i = 0; i < nofPlayers; i++) {
            let id;
            do {
                id = Math.floor(Math.random() * nofPlayers / 2) + 1;
            } while (this.takenId(id, nofPlayers, players));
            players[i].id = id;
        }
        for (let i = 0; i < nofPlayers; i++) {
            if (this._match.has(players[i].id))
                (_a = this._match.get(players[i].id)) === null || _a === void 0 ? void 0 : _a.push(players[i]);
            else
                this._match.set(players[i].id, [players[i]]);
        }
        // for (let i: number = 0; i <= (nofPlayers + 1) / 2; i++)
        // 	console.log(this._match.get(i));
        this.launchGame((nofPlayers + 1) / 2);
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
    launchGame(nofMatch) {
        let i = 1;
        while (i <= nofMatch) {
            const game = this._match.get(i);
            //console.log(game);
            if (game && game.length === 2) {
                console.log("launch game");
                console.log("game[0].name", game[0].name);
                console.log("game[1].name", game[1].name);
                this._game = new Game(game[0], game[1]);
                this._game.launch();
            }
            else
                i++;
        }
        // loop (des matches sont encore possible sur la ligne)
        // {
        // 	check si 2 1,2,3 sont dans les ids();
        // 	lance les matchs();
        // 	met a jour les id();
        // }
        // passe a la ligne suivante si cest possible if fin de la Game();
        // 	loop;
    }
}
