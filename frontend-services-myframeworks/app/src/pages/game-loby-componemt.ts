import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { User } from '../types/types';
import { IWebSocketsService, Match } from "../globalstate/WebSocketService";
import { GameReceivedMessage, LobyComponentClient } from "./loby-component";

if (!customElements.get("lobby-client-component"))
    customElements.define("lobby-client-component", LobyComponentClient);

export class GameLobyComponent extends BaseComponent<{
    ws: IWebSocketsService | null;
    games: Match[] | null;
    user: User | null;
    isCreateGame: boolean;
}> {
    constructor() {
        super({ ws: null, games: null, user: null, isCreateGame: false });
    }

    /* ───────────────── listeners ───────────────── */

    handleListenerSuccessCreateGame(e: Event) {
        const { lobyId } = (e as CustomEvent).detail;
        console.log('redirectToLobby', lobyId);

        if (!lobyId) return;                 // safety guard

        /* 1 - hide the join-list card if it’s visible */
        const listCard = this.querySelector('#joinListCard') as HTMLElement;
        if (listCard) listCard.style.display = 'none';

        /* 2 - ensure we’re in “view list” mode, not “create game” */
        this.state.isCreateGame = false;
        this.render();                       // re-draw header / button text

        /* 3 - inject (or replace) the lobby-detail component */
        const lobbyView = this.querySelector('#lobbyView') as HTMLElement;
        if (!lobbyView) return;

        lobbyView.innerHTML = '';            // clear previous card if any
        const lobbyComponent = document.createElement(
            'lobby-client-component'
        ) as LobyComponentClient;
        lobbyComponent.LobyId = lobyId;
        lobbyView.appendChild(lobbyComponent);
    }


    handleListenerProfileUpdate = (e: Event) => {
        console.log("profile-data-updated event received");
        const customEvent = e as CustomEvent;
        this.state.user = customEvent.detail.profileData;
        this.updateList();
    };

    handleListenerWsGameUpdate = (e: Event) => {
        console.log("ws-games event", (e as CustomEvent).detail);
        const wsGames = (e as CustomEvent).detail.wsGame;
        this.state.games = wsGames;
        this.updateList();
    };

    /* ───────────────── lifecycle ───────────────── */

    connectedCallback() {
        this.state.ws = UserContext().ws();
        this.state.user = UserContext().user();
        this.handleWsGame();
        this.render();

        this.listenCustomEvent(
            "SUCCESCREATEGAME",
            this.handleListenerSuccessCreateGame.bind(this)
        );
        this.listenCustomEvent(
            "profile-data-updated",
            this.handleListenerProfileUpdate.bind(this)
        );
        this.listenCustomEvent(
            "ws-games",
            this.handleListenerWsGameUpdate.bind(this)
        );
    }

    /* ───────────────── helpers ───────────────── */

    handleWsGame = () => {
        if (!this.state.ws) return;
        this.state.games = this.state.ws.wsGames;
    };

    setCreateGame = () => {
        this.state.isCreateGame = !this.state.isCreateGame;
        this.render();
    };

    updateList = () => {
        const tbody = this.querySelector("#setGame");
        if (!tbody) return;

        const games = this.state.games ?? [];

        tbody.innerHTML = games
            .map((game, index) => {
                const inLobby = this.state.ws?.isUserInLobybyId(
                    game.lobyId,
                    this.state.user?.id!
                );
                const btnLabel = inLobby ? "view" : "join";

                return /*html*/ `
          <tr>
            <td><span class="idx-chip">${index + 1}</span></td>
            <td><span class="content-chip">${game.lobyId}</span></td>
            <td><span class="content-chip">${game.config.state}</span></td>
            <td><span class="content-chip">${game.config.type}</span></td>
            <td><span class="content-chip">${game.config.format}</span></td>
            <td><span class="content-chip">${game.config.players.length}/${game.config.maxPlayers}</span></td>
            <td>
              ${
                    game.config.state === "open"
                        ? `<button id="join-game-${game.lobyId}"
                             data-loby-id="${game.lobyId}"
                             data-id="${game.config.gameId}"
                             class="btn">
                       ${btnLabel}
                     </button>`
                        : ""
                }
            </td>
          </tr>
        `;
            })
            .join("");
    };

    /* ───────────────── render ───────────────── */

    /* …imports, class, logic keep exactly what you already have … */

    /* ───────────────── render ───────────────── */
    render() {
        const { isCreateGame } = this.state;

        /*  ↓↓↓ FULL, ORIGINAL MARKUP (unchanged) ↓↓↓  */
        this.innerHTML = /*html*/`
 <section class="flex items-center justify-center p-4">
    <div class="w-full max-w-6xl space-y-12">

      <!-- header -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
        <h1 class="text-6xl font-display tracking-wide text-center sm:text-left select-none">
          🎮 ${this.t("GAME.LOBBY")}
        </h1>

        <button id="createGame"
          class="inline-flex items-center gap-2 rounded-full bg-gradient-to-br
                 from-indigo-500 via-violet-500 to-fuchsia-500 px-10 py-4 text-lg
                 font-semibold text-white shadow-lg transition-all duration-200
                 hover:shadow-xl active:shadow-md focus:outline-none
                 focus:ring-4 focus:ring-violet-400/60">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>${isCreateGame ? `${this.t("GAME.LIST_VIEW")}` : `${this.t("GAME.CREATE")}`}</span>
        </button>
      </header>

      <!-- detail card gets injected here -->
      <div id="lobbyView"></div>

      ${!isCreateGame ? `
      <!-- join-game list wrapper (only this gets hidden) -->
      <div id="joinListCard">
        <div>

          <h2 class="text-4xl font-semibold px-10 pt-10 pb-8">${this.t("GAME.JOIN")}</h2>

          <div class="overflow-x-auto">
            <table
              class="player-table w-full">

              <thead>
                <tr>
                  <th class="w-12">#</th>
                  <th class="w-[18rem] truncate">Id</th>
                  <th class="w-28">${this.t("TOURNAMENT.STATE")}</th>
                  <th class="w-24">${this.t("GAME.TYPE")}</th>
                  <th class="w-28">${this.t("TOURNAMENT.FORMAT")}</th>
                  <th class="w-24">${this.t("GENERIC.PLAYERS")}</th>
                  <th class="w-32">${this.t("GAME.ACTION")}</th>
                </tr>
              </thead>

              <tbody id="setGame" class="divide-y divide-transparent"></tbody>
            </table>
          </div>
        </div>
      </div>` : `
      <game-setting-component></game-setting-component>`}
    </div>
  </section>
 
`;


        /* re-inject table data after template loads */
        this.updateList();

		/* join / view buttons */
        this.attachEvent(this, '#setGame', 'click', async (event: Event) => {
            event.preventDefault();

            /* find the button even if the click came from a span/SVG inside it */
            const btn = (event.target as HTMLElement).closest('button');
            if (!btn) return;                          // click wasn’t on a button

            const lobyID = btn.getAttribute('data-loby-id');
            if (!lobyID) return;

            /* clear + inject the detail component */
            const lobbyView = this.querySelector('#lobbyView') as HTMLElement;
            lobbyView.innerHTML = '';

            const lobbyComponent = document.createElement(
                'lobby-client-component'
            ) as LobyComponentClient;
            lobbyComponent.LobyId = lobyID;
            lobbyView.appendChild(lobbyComponent);

            /* hide the big “Join a game” list */
           /*  const listCard = this.querySelector('#joinListCard') as HTMLElement;
            if (listCard) listCard.style.display = 'none';
 */
            /* send WS join if the user isn’t already in that lobby */
            const alreadyInLobby = this.state.ws?.isUserInLobybyId(
                lobyID,
                this.state.user?.id!
            );

            if (!alreadyInLobby) {
              try {
                const response = await fetch(`/api/auth/ws-csrf`)
                if (!response.ok) {
                console.error('Failed to fetch CSRF token for WebSocket');
                return;
                }
                const wsCSRFToken = await response.json();
                        const payload = JSON.stringify({
                            type: 'lobyJoined',
                            gameId: -1,
                            lobyId: lobyID,
                            name: this.state.user?.name,
                            avatar: this.state.user?.avatar,
                            state: 'joined',
                            wsCSRFToken:wsCSRFToken.token
                        });
                this.state.ws?.sendMessage(payload);
              } catch (error) {
                console.error('Error fetching CSRF token for WebSocket:', error);
              }
            }
        });

		/* create-game toggle */
		this.attachEvent(this, "#createGame", "click", (e: Event) => {
			e.preventDefault();
			this.setCreateGame();
		});
	}
}
