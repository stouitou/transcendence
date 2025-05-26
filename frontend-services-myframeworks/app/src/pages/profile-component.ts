import { BaseComponent } from "../frameworks/base-component";
import { UserContext } from "../globalstate/GlobalState";
import { get2FADetail, TwoFA } from "../services/api.2fa";
import { getProfileById } from "../services/api.profile";
import { getGamesByUserId, getTournamentsByUserId, MetaPagination } from "../services/api.users.game";
import { Game, Tournaments, User } from '../types/types';

export class ProfilePage extends BaseComponent<{user: User | null,userProfile: User | null,twoFa: TwoFA | null}> {
  static get observedAttributes() { return ['id']; }
  private data: { id?: string } = { id: undefined };
  constructor() {
    super({user: null,userProfile:null,twoFa: null});
  }
  set params (params: { id: string })	{ 
    console.error("params",params);
    this.data = params; }
  handleListenerProfileUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    this.state.user = customEvent.detail.profileData;
    this.render();
    this.fetch2FADetails().then(() => {
    });
    this.fetchUserProfile().then((data) => {
    });
  };

  connectedCallback() {
    console.error("ProfilePage connectedCallback");
    this.state.user = UserContext().user();
    this.render();
    this.fetch2FADetails().then(() => {
    //  console.log("2FA details fetched");
    });
    this.listenCustomEvent("profile-data-updated", this.handleListenerProfileUpdate.bind(this));
    this.fetchUserProfile().then((data) => {
      console.log("User profile fetched", data);
    });
  
  }

  async fetchUserProfile() {
     const { user } = this.state;
    if (!user) return;
    if (!this.data.id) return;
      try {
      const data = await getProfileById(this.data.id);
      this.setState({ ...this.state, userProfile: data ?? null });
     this.renderUserProfile();
    } catch (error) {
      this.router.navigate("/404");
    }
  }
  
  async fetch2FADetails() {
    if (this.data.id)return;
    const { user } = this.state;
    if (!user) return;

    try {
      const data = await get2FADetail();
      this.setState({ ...this.state, twoFa: data ?? null });
    //  console.log("2FA data:", data);
     this.update2FaRender();
    } catch (error) {
      console.error("Error fetching 2FA details:", error);
    }
  }

  renderSpinner() {
      this.innerHTML = ` 
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading... waiting ProfileData</span>
        </div>
        `;
    }
  render() {
    const { user } = this.state;
    if (!user ) {
      this.renderSpinner();
      return;
    }
    this.innerHTML = `
      <section class=" px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Mon Profil</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div class="flex items-center space-x-4">
              <img referrerPolicy="no-referrer"
                    src=${user.avatar ==""?undefined:user.avatar}
                    alt="Avatar"
                    class="w-16 h-16 rounded-full object-cover">
              <div>
                <h2 class="text-lg font-semibold">${user.name}</h2>
                <p class="text-lg font-semibold">level : ${user.level}</p>
                <br>
                <div id="twofa-display-status"></div>
              </div>
            </div>

            <a href="/profile/edit" class="flex justify-end">
              <button class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Mettre à jour</button>
            </a>
          </div>
        </div>
      </section>
			  <profil-stats-component id=${user.id}></profil-stats-component>
    `;
    this.update2FaRender();
  }

  renderUserProfile() {
    const { userProfile:user  } = this.state;
     if (!user ) {
      this.renderSpinner();
      return;
    }
    this.innerHTML = `
      <section class=" px-4 py-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">Profile ${user.name}</h1>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            <div class="flex items-center space-x-4">
              <img referrerPolicy="no-referrer"
                    src=${user.avatar ==""?undefined:user.avatar}
                    alt="Avatar"
                    class="w-16 h-16 rounded-full object-cover">
              <div>
                <h2 class="text-lg font-semibold">${user.name}</h2>
                <p class="text-lg font-semibold">level : ${user.level}</p>
                <br>
              </div>
            </div>
          </div>
        </div>
      </section>
			  <profil-stats-component id=${user.id}></profil-stats-component>
			  <profil-game-stats-component id=${user.id}></profil-game-stats-component>
			  <profil-tournament-stats-component id=${user.id}></profil-tournament-stats-component>
    `;
  }


  update2FaRender() {
    if (this.data.id) return;
    const { twoFa } = this.state;
    const twoFaDisplayStatus = this.querySelector("#twofa-display-status");
    if (twoFaDisplayStatus) {
      if (twoFa && twoFa.provider !== "local") {
        twoFaDisplayStatus.innerHTML = `<p class="text-sm text-gray-500">Provider: ${twoFa.provider}</p>`;
      } else {
        twoFaDisplayStatus.innerHTML = `
        <p class="text-lg font-bold">Two-Factor Authentication 
          ${twoFa?.two_factor_auth ? `<span class="text-green-500">enable</span>` : `<span class="text-red-500">disable</span>`}
          </p>
          <span class="text-sm text-gray-500">(${twoFa?.two_factor_auth ? "You can disable it in your profile settings." : "You can enable it in your profile settings."})</span>
         `;
      }
    }
  }
}



export class ProfileGameHistory extends BaseComponent<{ 
  id: number,
  user: User | null,
  localGame: Game[] | null,
  remoteGame: Game[] | null,
  metaPagination:{localGame: MetaPagination| null, remoteGame: MetaPagination| null} }> {

   static get observedAttributes() { return ['id']; }
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'id' && newValue !== oldValue) {
      this.state.id = Number(newValue);
      this.connectedCallback(); // ou une méthode pour recharger les stats
    }
  }
  constructor() {
  super({id:-1, user: null,localGame: null, remoteGame: null,metaPagination:{localGame: null, remoteGame: null} });
  }

  connectedCallback() {
  this.state.user = UserContext().user();
  getGamesByUserId(this.state.id,{limit:10},{type:"remote"}).then((result) => { 
    if (!result || !result.success) return;
    const {data:games,meta} = result;
    console.log('getGames(remote).then((data) games', games);
    if (games) {
    this.state.metaPagination.remoteGame= meta;
    this.state.remoteGame = games
    this.render();
    }
  }).catch((e) =>console.error(e));
  getGamesByUserId(this.state.id,{limit:10},{type:"local"}).then((result) => {
    if (!result || !result.success) return;
    const {data:games,meta} = result;
    console.log('getGames(local).then((data) games', games);
    if (games) {
    this.state.metaPagination.localGame = meta;
    this.state.localGame = games
    this.render();
    }
  }).catch((e) =>console.error(e));
  this.render();
  }



  setUser(user: User) {
  this.setState({ ...this.state, user });
  }

  determinePageCount(offset:number,pagination: MetaPagination):{ currentPage: number, pageCount: number } {
  const { limit, total } = pagination;
  const pageCount = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  return { currentPage, pageCount };
  
  }
  generatePagination(currentPage: number, pageCount: number,type:string): string {
  let paginationHTML = '';
  
  // Bouton "Précédent"
  paginationHTML += `
    <li  data-page="${currentPage - 1}" data-type="${type}" class="paginator">
    <div class="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
       data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
      <span class="sr-only">Previous</span>
      <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
      </svg>
    </div>
    </li>
  `;
  
  // Boutons pour chaque page
  for (let i = 1; i <= pageCount; i++) {
    paginationHTML += `
    <li  data-page="${i}"  data-type="${type}" class="paginator">
      <div class="flex items-center justify-center px-4 h-10 leading-tight ${
      i === currentPage
        ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
      }" data-page="${i}">
      ${i}
      </div>
    </li>
    `;
  }
  
  // Bouton "Suivant"
  paginationHTML += `
    <li  data-page="${currentPage + 1}"  data-type="${type}" class="paginator">
    <div class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
       data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}>
      <span class="sr-only">Next</span>
      <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
      </svg>
    </div>
    </li>
  `;
  
  return paginationHTML;
  }
  render() {
  const { user , localGame, remoteGame,metaPagination} = this.state;

  if (user) {
    //console.log('game', user.games);
    const localPagination = metaPagination.localGame
    ? this.generatePagination(
      this.determinePageCount(metaPagination.localGame.offset, metaPagination.localGame).currentPage,
      this.determinePageCount(0, metaPagination.localGame).pageCount,
      "local"
      )
    : '';
  
    const remotePagination = metaPagination.remoteGame
    ? this.generatePagination(
      this.determinePageCount(metaPagination.remoteGame.offset, metaPagination.remoteGame).currentPage,
      this.determinePageCount(0, metaPagination.remoteGame).pageCount,
      "remote"
      )
    : '';
    this.innerHTML = `
    
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6 ">Game History Local ${this.state.metaPagination.localGame?.total||0}</h2>
        <nav aria-label="Page navigation ">
          <ul class="flex items-center -space-x-px h-10 text-base">
            ${ localPagination}
          </ul>
        </nav>
      
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="p-4">
                    <div class="flex items-center">
                        <input id="checkbox-all-search" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                        <label htmlFor="checkbox-all-search" class="sr-only">checkbox</label>
                    </div>
                </th>
                <th scope="col" class="px-6 py-3">
                    Id
                </th>
                <th scope="col" class="px-6 py-3">
                    Difficulty
                </th>
                <th scope="col" class="px-6 py-3">
                    state
                </th>
                <th scope="col" class="px-6 py-3">
                    Date
                </th>
                <th scope="col" class="px-6 py-3">
                    Victory
                </th>
            </tr>
        </thead>
        <tbody id="table-game-history-local"></tbody>
    </table>
        </div>


            <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6 ">Game History Remote ${this.state.metaPagination.remoteGame?.total||0}</h2>
                <nav aria-label="Page navigation ">
          <ul class="flex items-center -space-x-px h-10 text-base">
            ${ remotePagination}
          </ul>
        </nav>
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="p-4">
                    <div class="flex items-center">
                        <input id="checkbox-all-search" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                        <label htmlFor="checkbox-all-search" class="sr-only">checkbox</label>
                    </div>
                </th>
                <th scope="col" class="px-6 py-3">
                    Id
                </th>
                <th scope="col" class="px-6 py-3">
                    Difficulty
                </th>
                <th scope="col" class="px-6 py-3">
                    state
                </th>
                <th scope="col" class="px-6 py-3">
                    Date
                </th>
                <th scope="col" class="px-6 py-3">
                    Victory
                </th>
            </tr>
        </thead>
        <tbody id="table-game-history-remote"></tbody>
    </table>
        </div>
    `;
    const tbodyLocal = document.querySelector('#table-game-history-local')
    if (tbodyLocal) {
      localGame?.forEach((game) =>
      tbodyLocal.innerHTML +=this.gameDetailsView(game)
      
      );
    }
    
    const tbodyRemote = document.querySelector('#table-game-history-remote')
    if (tbodyRemote) {
      remoteGame?.forEach((game) =>
      tbodyRemote.innerHTML +=this.gameDetailsView(game)
      
      );
    }

      // Ajouter l'événement de click pour rediriger vers le détail du tournoi
      this.querySelectorAll('.gameRow').forEach(card => {
      //this.shadowRoot.querySelectorAll('.tournamentRow').forEach(card => {
      card.addEventListener('click', (e: Event) => {
        const target = e.currentTarget as HTMLElement;
         const id = target.getAttribute('data-id');
        if (!id) return;		 
       const game = this.state.localGame?.find(t => t.id === Number(id))|| this.state.remoteGame?.find(t => t.id === Number(id));
       if (!game) return;
       // Créer un nouvel élément <tr>
       const newRow = document.createElement('tr');
       const newRowTd = document.createElement('td');
       newRowTd.setAttribute('data-type', 'detail');
       newRowTd.setAttribute('colspan', '5');

       const newRowTdContent = document.createElement('game-card-component') as any;;
       newRowTdContent.data = game
       newRowTd.appendChild(newRowTdContent);
       newRow.appendChild(newRowTd);
       
       if (target.parentNode) {
       // Vérifier si le nouvel élément existe déjà
      const existingRow = target.nextSibling;
      if (existingRow && (existingRow.nodeType === Node.ELEMENT_NODE)) {
         // Si oui, le supprimer
         target.parentNode.removeChild(existingRow);
       }else {
         // Sinon, ajouter le nouvel élément
         target.parentNode.insertBefore(newRow, target.nextSibling);
       }	 
      }});
      });

      this.querySelectorAll('.paginator').forEach((button) => {
      button.addEventListener('click', (e: Event) => {
        e.preventDefault();
        console.log('paginator click');
        const target = e.currentTarget as HTMLElement;
        const page = Number(target.getAttribute('data-page'));
        const type = target.getAttribute('data-type');
        console.log('page', page);
        if (!page || page < 1) return;
        if (!type) return;		  
        // Charger les données pour la page sélectionnée
        getGamesByUserId(this.state.id,{ limit: 10, offset: (page - 1) * 10 }, { type: type }).then((result) => {
        if (!result) return;
        const { data:games, meta } = result;
        if (type === 'remote') {
          this.state.metaPagination.remoteGame = meta;
          this.state.remoteGame = games;
        }
        if (type === 'local') {
          this.state.metaPagination.localGame = meta;
          this.state.localGame = games;
        }
        this.render();
        });
      });
      });
    return;
  }
  this.innerHTML = `not user //@TODO: add loading spinner or redirect`;
  }

  gameDetailsView = (game:Game) => {
  console.log('gameDetailsView', game);
  return (`
  <tr data-id="${game.id}" class="gameRow border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
  
    <td class="w-4 p-4">
      <div class="flex items-center">
        <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label htmlFor="checkbox-table-search-1" class="sr-only">checkbox</label>
      </div>
    </td>
    <td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
      <div class="ps-3">
        <div class="text-base font-semibold">${game.id}</div>
      </div>  
    </td>
    <td class="px-6 py-4">
      ${game.difficulty}
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center">
        <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> ${game.state}
      </div>
    </td>
    <td class="px-6 py-4">
       ${new Date(game.created_at).toLocaleDateString()}
      
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center">
          <div class="h-2.5 w-2.5 rounded-full  bg-green-500"></div>
          <span>${game.gameHistory?.winner??""}</span>
        
      </div>
    </td>
  </tr>
  `);
  }
}





 function determinePageCount(offset:number,pagination: MetaPagination):{ currentPage: number, pageCount: number } {
  const { limit, total } = pagination;
  const pageCount = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  return { currentPage, pageCount };
  
  }
 function  generatePagination(currentPage: number, pageCount: number,type:string): string {
  let paginationHTML = '';
  
  // Bouton "Précédent"
  paginationHTML += `
    <li  data-page="${currentPage - 1}" data-type="${type}" class="paginator">
    <div class="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
       data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
      <span class="sr-only">Previous</span>
      <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
      </svg>
    </div>
    </li>
  `;
  
  // Boutons pour chaque page
  for (let i = 1; i <= pageCount; i++) {
    paginationHTML += `
    <li  data-page="${i}"  data-type="${type}" class="paginator">
      <div class="flex items-center justify-center px-4 h-10 leading-tight ${
      i === currentPage
        ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
      }" data-page="${i}">
      ${i}
      </div>
    </li>
    `;
  }
  
  // Bouton "Suivant"
  paginationHTML += `
    <li  data-page="${currentPage + 1}"  data-type="${type}" class="paginator">
    <div class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
       data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}>
      <span class="sr-only">Next</span>
      <svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
      </svg>
    </div>
    </li>
  `;
  
  return paginationHTML;
  }

  
  export interface GameHistory {
  id: number;
  score1: number;
  player1: number;
  score2: number;
  player2: number;
  created_at: string;
  updated_at: string;
  }
  
 /*  export interface Game {
  id: number;
  difficulty: string;
  state: string;
  gameHistory: GameHistory | null;
  created_at: string;
  currentRound: number;
  } */
  
  // --- Composant DashboardTournois ---
export class ProfileTournamentHistory extends BaseComponent<{ 
  id: number,
  user: User | null,
  localTournaments: Tournaments[] | null,
  remoteTournaments: Tournaments[] | null,
  metaPagination:{localGame: MetaPagination| null, remoteGame: MetaPagination| null} }> {

  static get observedAttributes() { return ['id']; }
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'id' && newValue !== oldValue) {
      this.state.id = Number(newValue);
      this.connectedCallback(); // ou une méthode pour recharger les stats
    }
  }
  constructor() {
  super({id:-1, user: null,/* games:null, */ localTournaments: null, remoteTournaments: null,metaPagination:{localGame: null, remoteGame: null} });
  }
  
  connectedCallback() {
    this.state.user = UserContext().user();
    getTournamentsByUserId(this.state.id,{limit:10},{type:"remote"}).then((result) => {
      if (!result || !result.success) return;
      const {data:tournaments,meta} = result;
      if (tournaments) {
      this.state.metaPagination.remoteGame= meta;
      this.state.remoteTournaments = tournaments
      this.render();
      }
    }).catch((e) =>console.error(e));
    getTournamentsByUserId(this.state.id,{limit:10},{type:"local"}).then((result) => {
      if (!result || !result.success) return;
      const {data:tournaments,meta} = result;
      if (tournaments) {
      
      this.state.metaPagination.localGame= meta;
      this.state.localTournaments = tournaments;
      this.render();
      }
    }).catch((e) =>console.error(e));
    this.render();
  }


  
  render() {	 
    const { user , localTournaments, remoteTournaments,metaPagination} = this.state; 
    if (user) {
      const localPagination = metaPagination.localGame
      ? generatePagination(
        determinePageCount(metaPagination.localGame.offset, metaPagination.localGame).currentPage,
        determinePageCount(0, metaPagination.localGame).pageCount,
        "local"
      )
      : '';
  
    const remotePagination = metaPagination.remoteGame
      ? generatePagination(
        determinePageCount(metaPagination.remoteGame.offset, metaPagination.remoteGame).currentPage,
        determinePageCount(0, metaPagination.remoteGame).pageCount,
        "remote"
      )
      : '';
    this.innerHTML = `
    
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6">Tournament History Local ${this.state.metaPagination.localGame?.total||0}</h2>
          <nav aria-label="Page navigation ">
          <ul class="flex items-center -space-x-px h-10 text-base">
            ${ localPagination}
          </ul>
        </nav>
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="p-4">
                    <div class="flex items-center">
                        <input id="checkbox-all-search" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                        <label htmlFor="checkbox-all-search" class="sr-only">checkbox</label>
                    </div>
                </th>
                <th scope="col" class="px-6 py-3">
                    Id
                </th>
                <th scope="col" class="px-6 py-3">
                    state
                </th>
                <th scope="col" class="px-6 py-3">
                    Date
                </th>
                <th scope="col" class="px-6 py-3">
                    Victory
                </th>
            </tr>
        </thead>
        <tbody id="table-tournament-history-local">
    
      ${localTournaments?.map(tournament => `
      <tr data-id="${tournament.id}" class="tournamentRow border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
  
    <td class="w-4 p-4">
      <div class="flex items-center">
        <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label htmlFor="checkbox-table-search-1" class="sr-only">checkbox</label>
      </div>
    </td>
    <td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
      <div class="ps-3">
        <div class="text-base font-semibold">${tournament.id}</div>
      </div>  
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center">
        <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> ${tournament.state}
      </div>
    </td>
    <td class="px-6 py-4">
       ${new Date(tournament.created_at).toLocaleDateString()}
      
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center">
      ${tournament.winner ? `<span>Gagnant : ${(typeof tournament.winner === 'number') ? 'ID ' + tournament.winner : tournament.winner.display_name }</span>` : ''}
        
      </div>
    </td>
  </tr>
      `).join('')}
        </tbody>
    </table>
        </div>



        
        <div class="mx-auto p-6 text-center">
              <h2 class="text-3xl font-bold text-center mb-6">Tournament History Remote ${this.state.metaPagination.remoteGame?.total||0}</h2>
          <nav aria-label="Page navigation ">
          <ul class="flex items-center -space-x-px h-10 text-base">
            ${ remotePagination}
          </ul>
        </nav>
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="p-4">
                    <div class="flex items-center">
                        <input id="checkbox-all-search" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                        <label htmlFor="checkbox-all-search" class="sr-only">checkbox</label>
                    </div>
                </th>
                <th scope="col" class="px-6 py-3">
                    Id
                </th>
                <th scope="col" class="px-6 py-3">
                    state
                </th>
                <th scope="col" class="px-6 py-3">
                    Date
                </th>
                <th scope="col" class="px-6 py-3">
                    Victory
                </th>
            </tr>
        </thead>
        <tbody id="table-tournament-history-remote">
    
      ${remoteTournaments?.map(tournament => `
      <tr data-id="${tournament.id}" class="tournamentRow border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
  
    <td class="w-4 p-4">
      <div class="flex items-center">
        <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label htmlFor="checkbox-table-search-1" class="sr-only">checkbox</label>
      </div>
    </td>
    <td scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
      <div class="ps-3">
        <div class="text-base font-semibold">${tournament.id}</div>
      </div>  
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center">
        <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> ${tournament.state}
      </div>
    </td>
    <td class="px-6 py-4">
       ${new Date(tournament.created_at).toLocaleDateString()}
      
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center">
      ${tournament.winner ? `<span>Gagnant : ${(typeof tournament.winner === 'number') ? 'ID ' + tournament.winner : tournament.winner.display_name }</span>` : ''}
        
      </div>
    </td>
  </tr>
      `).join('')}
        </tbody>
    </table>
        </div>

    `;

    // Ajouter l'événement de click pour rediriger vers le détail du tournoi
    
    this.querySelectorAll('.tournamentRow').forEach(card => {
    //this.shadowRoot.querySelectorAll('.tournamentRow').forEach(card => {
    card.addEventListener('click', (e: Event) => {
      const target = e.currentTarget as HTMLElement;
       const id = target.getAttribute('data-id');
      if (!id) return;		 
     const tournoi = this.state.localTournaments?.find(t => t.id === Number(id))|| this.state.remoteTournaments?.find(t => t.id === Number(id));//localTournaments?.find(t => t.id === Number(id));
     if (!tournoi) return;
     // Créer un nouvel élément <tr>
     const newRow = document.createElement('tr');
     const newRowTd = document.createElement('td');
     newRowTd.setAttribute('data-type', 'detail');
     newRowTd.setAttribute('colspan', '5');
     newRowTd.appendChild(this.showTournamentDetail(tournoi));
     newRow.appendChild(newRowTd);
     
     if (target.parentNode) {
     // Vérifier si le nouvel élément existe déjà
    const existingRow = target.nextSibling;
    if (existingRow && (existingRow.nodeType === Node.ELEMENT_NODE)) {
       // Si oui, le supprimer
       target.parentNode.removeChild(existingRow);
     }else {
       // Sinon, ajouter le nouvel élément
       target.parentNode.insertBefore(newRow, target.nextSibling);
     }	 
    }});
    });


    this.querySelectorAll('.paginator').forEach((button) => {
      button.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        const page = Number(target.getAttribute('data-page'));
        const type = target.getAttribute('data-type');
        if (!page || page < 1) return;
        if (!type) return;		  
        // Charger les données pour la page sélectionnée
        getTournamentsByUserId(this.state.id, {limit:10, offset: (page - 1) * 10 },{type:type}).then((result) => {
          if (!result || !result.success) return;
          const {data:tournaments,meta} = result;
          if (tournaments) {
          if (type === 'remote') {
            this.state.metaPagination.remoteGame = meta;
            this.state.remoteTournaments = tournaments;
            }
            if (type === 'local') {
            this.state.metaPagination.localGame = meta;
            this.state.localTournaments = tournaments;
            }
          this.render();
          }
        });
      });
      });
    }
  }
  private showTournamentDetail(tournoi: Tournaments) {
    const newRowDetail = document.createElement('tournoi-detail') as any;
    newRowDetail.data = tournoi;
    return newRowDetail;
    }
  }
  