import { BaseComponent } from "../frameworks/base-component";
import { Game, Players, User } from "../types/types";
/* import { ProfileEdit } from '../components/ProfileEdit.ts';
import { ProfileView } from '../components/ProfileView.ts'; */

// Register the custom elements to be used in the Profile component
/* if (!customElements.get('profile-edit-sub-component'))
customElements.define('profile-edit-sub-component', ProfileEdit);
if (!customElements.get('profile-view-sub-component'))
customElements.define('profile-view-sub-component', ProfileView); */

/**
 * Profile component that displays the user's profile information
 * and allows the user to edit their profile information.
 */
export class GameCardTest extends BaseComponent<{ user: User | null; isEditing: boolean }> {
/*   private testDataGame:Game = {
    id: 12345,
    created_at: '25/03/2025',
    type: 'local',
    mode: 'normal',
    state: 'terminée',
    difficulty: 4,
    gameHistory: {
      id: 12345,
      created_at: '25/03/2025',
      updated_at: '25/03/2025',
      score1: 10,
      player1: 1,
      score2: 3,
      player2: 2,
      winner: 'Nizar',
      players:[
        {
          id: 1,
          type: 'local',
          display_name: 'Nizar',
          avatar: 'https://localhost:4433/uploads/1-avatartest.jpg',
          score: 10,
        },
        {
         id: 2,
         type: 'local',
         display_name: 'John',
         avatar: 'https://localhost:4433/uploads/1-avatartest.jpg',
         score: 3,
     },
     {
      id: 3,
      type: 'remote',
      display_name: 'John',
      avatar: 'https://localhost:4433/uploads/1-avatartest.jpg',
      score: 3,
      user: {
        id: 3,
        name: 'Johny',
        role:"user",
        games: [],
        tournaments: [],
        created_at: '25/03/2025',
        updated_at: '25/03/2025',
        avatar: 'https://localhost:4433/uploads/fake.png',
      }
  }] 

    },
    local_players: ['Nizar', 'John'],
  

  //  winner: 'Nizar',
  }; */
  private game:Game | null = null;
  private maxDifficulty = 5;
  constructor() {
    super({ user: null, isEditing: false });
  }
  set data(game: Game) {
    console.log('game is set', game);
      this.game = game;
      this.render();
    }

  connectedCallback() {
    this.render();

  }

getAvatar(player: Players) {
  if (player.type === 'local') {
    return player.avatar || undefined;
  } else if (player.type === 'remote' && player.user) {
    return (player.user as User).avatar || undefined;
  }
  return undefined;
}
getDisplayName(player: Players) {
  if (player.type === 'local') {
    return player.display_name || undefined;
  } else if (player.type === 'remote' && player.user) {
    return (player.user as User).name || undefined;
  }
  return undefined;
}
  render() {

    if (!this.game) {
      this.innerHTML = `
        <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <div class="relative items-center block max-w-sm p-6 bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white opacity-20">Profile ...</h5>
                <p class="font-normal text-gray-700 dark:text-gray-400 opacity-20">...</p>
                <div role="status" class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
                    <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
        `;
      return;
    }

    this.innerHTML = `
    <div class="mx-auto text-center">
          <div class="game-card-container-background">

            <div class="game-card-container-row">
             <p class="text-3xl font-bold text-center mb-6">Game ID: #${this.game.id}</p>
            </div>
            <div class="game-card-container-row">
             <p>date: ${this.game.created_at} </p>
            </div>

            <div class="flex justify-start">
             <p >type : ${this.game.type}</p>
            </div>

            <div class="flex justify-start">
             <p >format : ${this.game.format}</p>
            </div>

            <div class="flex justify-start">
             <p >state : ${this.game.state}</p>
            </div>

            <div class="game-card-container-row">
                <div>
                <p>${this.t("GAME.ACT_DIFF")}: </p>
                </div>
                <div class="flex items-center">
                  ${Array.from({ length: this.maxDifficulty }, (_, i) => {
                      return `
                      <svg class="w-8 h-8 ms-3 ${i < ( this.game?.difficulty ?? 0) ? 'text-yellow-300' : 'text-gray-300 dark:text-gray-500'}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                      </svg>
                      `;
                  }).join('')}                   
                </div>
            </div>
            <div class="game-card-container-row">
              <div class="flex flex-col items-center justify-center min-w-[220px]">
              ${this.game.gameHistory?.players?.map((player,i) =>
                i%2 === 0 ? `
                <div class="flex flex-col items-center justify-center min-w-[220px] py-4">
                    <img referrerPolicy="no-referrer"
                          src=${this.getAvatar(player)}
                          alt="User Avatar"
                          class="w-24 h-24 mx-auto rounded-full border-4 border-gray-300 mb-4"
                      />
                          <h2 class="text-2xl font-semibold">${this.getDisplayName(player)}</h2>

                          <br>
                            <h3 class="text-lg font-semibold">${this.t("GENERIC.SCORE")}</h3>
                            <p class="text-green-600 text-9xl">${player.score}</p>

                </div>`:``
            ).join('')}

                </div>
              <div class="flex flex-col items-center justify-center">
                <p class="text-blue-600 text-8xl px-3">VS</p>
              </div>


              <div class="flex flex-col items-center justify-center min-w-[220px]">
                  ${this.game.gameHistory?.players?.map((player,i) => 
                    i%2 === 1 ? `
                    <div class="flex flex-col items-center justify-center min-w-[220px] py-4">
                        <img referrerPolicy="no-referrer"
                              src=${this.getAvatar(player)}
                              alt="User Avatar"
                              class="w-24 h-24 mx-auto rounded-full border-4 border-gray-300 mb-4"
                          />
                              <h2 class="text-2xl font-semibold">${this.getDisplayName(player)}</h2>

                              <br>
                                <h3 class="text-lg font-semibold">${this.t("GENERIC.SCORE")}</h3>
                                <p class="text-green-600 text-9xl">${player.score}</p>

                    </div>`:``
                ).join('')}

              </div>
            </div>

              <p>Winner: </p>
              <p class="text-3xl font-bold text-center mb-6 text-green-600">${this.game.gameHistory?.winner}</p>

          </div>
           
       </div>
   `;
    
  }
}
