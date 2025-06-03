import { BaseComponent } from "../frameworks/base-component";
import {  UserContext } from "../globalstate/GlobalState";
import {IWebSocketsService} from "../globalstate/WebSocketService";
import { Logout } from "./button/logout-btn";

if (!customElements.get('logout-btn'))
customElements.define('logout-btn', Logout);
/**
 * Composant de barre de navigation
 */
export class OnlineComponent extends BaseComponent<{ ws: IWebSocketsService | null ,isOnline: string[] | null}> {
    
  constructor() { super({ ws: null, isOnline: null}); }
 /*  toggleTheme() {
    const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.setState({ theme: newTheme });
  } */

  connectedCallback() {
    super.connectedCallback();
    this.state.ws = UserContext().ws();
    this.render();
    document.addEventListener('ws-isOnline', (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('profile-data-updated event received');
      this.state.isOnline = customEvent.detail.users;
      this.render();
    });
/*       document.addEventListener('login-success', (e: Event) => {
      const customEvent = e as CustomEvent;
      this.state.islogged = customEvent.detail.islogged;
      this.render();
    });

    document.addEventListener('logout-success', (e: Event) => {
      const customEvent = e as CustomEvent;
      this.state.islogged = customEvent.detail.islogged;
      this.render();
    }); */
  }

  render() {
    const { isOnline } = this.state;
      this.innerHTML = `
         <div class=" mx-auto p-6">
			<div class="online-container">
				<div class="isOnline">
					<ul class="flex flex-wrap">
					${isOnline?.map((user) => (
            !user?
						`<li class="bg-red-300'> ${user}</li>`:`<li class="mx-1 px-2 bg-green-800">${user}</li>`
					))}
					</ul>
				</div>
        <div class="isFriendlOnline">
          <ul class="flex flex-wrap">
            ${this.isFriendlOnline(isOnline)}
          </ul>
				</div>
			</div>
		</div>
    `;
  // this.querySelector('#toggleBtn')!.addEventListener('click', this.toggleTheme.bind(this));
 // this.attachEvent(this, '#toggleBtn', 'click', this.toggleTheme.bind(this));
  }

  isFriendlOnline(isOnline: string[] | null): string {
    const user = UserContext().user();
    if (!user ) {
      return '';
    }
    const div = document.createElement('ul');
    user.friends?.forEach(friend => {
        if (isOnline?.includes(`User-${String(friend.id).trim()}`)) {
          div.innerHTML += `<li class="bg-yellow-800"> ${friend.name}</li>`;
        }      
      });
    return div.innerHTML; 
  }
}
