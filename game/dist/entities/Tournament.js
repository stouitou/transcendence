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
    constructor(players) {
        this._round = [];
        this._match = new Map();
        this._players = players;
        this.randomize();
        console.log("random :");
        for (let i = 0; i < this._round.length; i++)
            console.log(this._round[i]);
        this.createMatch();
        this.launchGame(Math.round(this._round.length / 2));
    }
    randomize() {
        let array = this._players;
        let len = array.length;
        while (array.length) {
            let index = Math.floor(Math.random() * len);
            this._round.push(array.splice(index, 1)[0]);
            len--;
        }
    }
    createMatch() {
        var _a, _b;
        let index = 0;
        for (let i = 0; i < this._round.length; i++) {
            if (!this._match.has(index))
                this._match.set(index, [this._round[i]]);
            else if (((_a = this._match.get(index)) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                (_b = this._match.get(index)) === null || _b === void 0 ? void 0 : _b.push(this._round[i]);
                index++;
            }
        }
        console.log("match:");
        for (let i = 0; i < Math.round(this._round.length / 2); i++)
            console.log(this._match.get(i));
    }
    launchGame(nofMatch) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("number of match: ", nofMatch);
            this._round.length = 0;
            let i = 0;
            let nextRound = [];
            let j = 0;
            while (i <= nofMatch) {
                console.log("starting game");
                const game = this._match.get(i);
                if (game && game.length === 2) {
                    this._game = new Game(game[0], game[1]);
                    yield this._game.launch();
                    document.body.innerHTML = ''; //a revoir, remet la page a 0
                    this._round[j] = game[0].lastWin ? game[0] : game[1];
                    j++;
                }
                else if (game) {
                    this._round[j] = game[0];
                    j++;
                }
                i++;
            }
            console.log("next round :");
            for (let i = 0; i < this._round.length; i++)
                console.log(this._round[i]);
            this._match.clear();
            console.log("round length = ", this._round.length);
            if (this._round.length === 3) {
                this.threePlayers();
                return;
            }
            else if (this._round.length === 1)
                return;
            this.createMatch();
            this.launchGame(Math.round(this._round.length / 2));
        });
    }
    threePlayers() {
        let array = [[0, 0], [0, 0], [0, 0]];
        let FLAG = false;
        let FLAG1 = false;
        console.log("3 players");
        const loop = (x, y) => __awaiter(this, void 0, void 0, function* () {
            this._game = new Game(this._round[y], this._round[x]);
            yield this._game.launch();
            array[x][0] += this._round[x].lastWin ? 1 : 0;
            array[x][1] += this._round[x].lastScore;
            array[y][0] += this._round[y].lastWin ? 1 : 0;
            array[y][1] += this._round[y].lastScore;
            document.body.innerHTML = ''; //a revoir, remet la page a 0
            console.log(array);
            if (FLAG == false) {
                FLAG = true;
                yield loop(1, 2);
            }
            if (FLAG1 == false) {
                FLAG1 = true;
                yield loop(0, 2);
            }
        });
        loop(0, 1);
    }
}
