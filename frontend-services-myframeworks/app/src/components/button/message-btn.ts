/* 

<button type="button" class="relative inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
<svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
<path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
<path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
</svg>
<span class="sr-only">Notifications</span>
Messages
  <div class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">8</div>
</button>

 */

import { logoutUser } from '../../services/authService.ts';
import { BaseComponent } from "../../frameworks/base-component.ts";
import { UserContext } from '../../globalstate/GlobalState.ts';
import { RouterConfig } from '../../router/Router.ts';

export class MessageBtn extends BaseComponent<{nbMsg:number}> {
  constructor() {
	super({nbMsg:0});
  }
  connectedCallback() {
	//this.state.nbMsg = 1;
	this.render();
	document.addEventListener('nb-messages-updated', (e: Event) => {
	  const customEvent = e as CustomEvent;
	  console.log('message-data-updated event received',customEvent.detail.nbMsg);
	  this.setNbMessages(customEvent.detail.nbMessages);
	});
  }

  setNbMessages = (nbMsg:number) => {
	this.state.nbMsg = nbMsg;
	this.render();
	  }


  render() {
	const { nbMsg } = this.state;
	  this.innerHTML = `
				<button id="messageBtn" type="button" class="btn relative inline-flex">
					<svg class="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
					<path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
					<path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
					</svg>
					<span class="sr-only">Notifications</span>
					Messages
					${nbMsg > 0 ? `
					<div class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">${nbMsg}</div>
					` : ''}
				</button>
	`;
	this.attachEvent(this, '#messageBtn', 'click', () => RouterConfig.getInstance().navigate('/messages'));
	
  } 
}