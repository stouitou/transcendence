import { BaseComponent } from "../frameworks/base-component";
import {  UserContext } from "../globalstate/GlobalState";
import {IWebSocketsService} from "../globalstate/WebSocketService";
import { Logout } from "../components/button/logout-btn";

if (!customElements.get('logout-btn'))
customElements.define('logout-btn', Logout);

interface PrivateMessage {
  from: string;
  message: string;
}
export class ChatComponent extends BaseComponent<{ ws: IWebSocketsService | null ,isOnline: string[] | null,
  privateMessage:{to:string,inputMessage:string},
  messagesBySender:{[key: string]: PrivateMessage[]},
  activeTab:string|null}> {
    
  constructor() {
    super(
      { 
        ws:null,
        isOnline:null,
        privateMessage:{to:'',inputMessage:''},
        messagesBySender:{},
        activeTab:null
      }); }
    connectedCallback() {
      super.connectedCallback();
      this.state.ws = UserContext().ws();
      this.handleMessageBySender();
      this.state.isOnline = UserContext().ws()?.isOnline ?? null;
      this.render();
      document.addEventListener('ws-isOnline', (e: Event) => {
        const customEvent = e as CustomEvent;
        // console.log('profile-data-updated event received');
        this.state.isOnline = customEvent.detail.users;
       //update only the inputSelectUser element
        const inputSelectUser = this.querySelector('#inputSelectUser') as HTMLSelectElement;
        if (inputSelectUser) {
          inputSelectUser.innerHTML = `
            <option value="">Select a user</option>
            ${this.state.isOnline?.map((user) => (
              `<option value=${user}>
                  ${user}
              </option>`
            )).join('')}
          `;
        }
      });

      // Listen for private messages
      document.addEventListener('ws-privateMessage', (e: Event) => {
        this.handleMessageBySender();
        this.render();
      });
    }


    handleMessageBySender = () => {
      const groupedMessages = this.state.ws?.privateMessages.reduce((acc, msg) => {
        if (!acc[msg.from]) {
            acc[msg.from] = [];
        }
        acc[msg.from].push(msg);
        return acc;
    }, {} as { [key: string]: PrivateMessage[] });
    if (!groupedMessages) {
        return;
    }
    this.setMessagesBySender(groupedMessages);
  }


    setMessagesBySender= (messages: { [key: string]: PrivateMessage[] }) => {
      this.setState({ messagesBySender: { ...this.state.messagesBySender, ...messages } });
    }

  setActiveTab = (sender: string) => {
    this.setState({ activeTab: sender });
    this.render();
  }

    setInput = (input: string) =>{
     this.setState({ privateMessage: { ...this.state.privateMessage, inputMessage: input } });
  }

    handleSendMessage = () => {
      if (this.state.privateMessage.inputMessage.trim() !== '' && this.state.privateMessage.to.trim() !== '') {
          const data = JSON.stringify({ type: "private", to:this.state.privateMessage.to, message: this.state.privateMessage.inputMessage });
          this.state.ws?.sendMessage(data);
          this.setInput('');
          this.render();
      }
  };

    render() {
      const { isOnline,messagesBySender,activeTab,privateMessage } = this.state;

        this.innerHTML = `
           <div  class="form-container">
                <div class="tabs p-2">
                    ${Object.keys(messagesBySender).map((sender) =>
                        `<button
                          data-sender="${sender}"                            
                          class="relative sendMessageTabs rounded-t-lg text-white ${activeTab === sender ? 'h-10 p-1 m-1' : 'h-6 w-10'} ${!isOnline?.includes(sender) ? 'bg-red-300' : 'bg-blue-500 hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-gray-400'}"
							          >
                            ${activeTab === sender ? sender:  sender.slice(0,3)}
                            
                            <div class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:bg-red-800 dark:border-gray-900">${messagesBySender[sender].length}</div>
                        </button>`
                    ).join('')}
                </div>
                <div class="messages">
                    ${activeTab && messagesBySender[activeTab] ? messagesBySender[activeTab].map((msg, index) => (
                        `<div class="message">
                            ${msg.message} (from: ${msg.from})
                        </div>`
                    )).join(''):`<div class="message">
                   <span class="text-xs">[DEBUG] not selected or no messages available.</span>
                        </div>`}
                </div>

                <div class="input-container">
                 <label for="inputMessage" class="block  mb-2">${this.t("CHAT.TYPE")}</label>
           
                    <input
                        id="inputMessage"
                        type="text"
                        value="${privateMessage.inputMessage}"
                        placeholder="${this.t("CHAT.TYPE")}..."
                        class="form-text-input"
                    />
                    <br />
                    <select id="inputSelectUser" value="${privateMessage.to}" class="select-form-message">
                        <option value="">${this.t("PROFILE.SELECTUSER")}</option>
                        ${isOnline?.map((user) => (
                            `<option value=${user}>
                                ${user}
                            </option>`
                        ))}
                    </select>
                    <button id="send-button" class="btn">
                        ${this.t("CHAT.SEND")}
                    </button>
                </div>
        </div>
      `;
      const sendMessageTabs = this.querySelectorAll('.sendMessageTabs');
      sendMessageTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const sender = tab.getAttribute('data-sender');
          if (sender) {
            this.setActiveTab(sender);
          }
        });
      }
      );
      const inputSelectUser = this.querySelector('#inputSelectUser') as HTMLSelectElement;
      if (inputSelectUser) {
        inputSelectUser.value = this.state.activeTab || '';
      }

      this.attachEvent(this, '#inputMessage', 'input', (event: Event) => {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        this.setInput(value);
      }
      );
      this.attachEvent(this, '#inputSelectUser', 'input', (event: Event) => {
          const input = event.target as HTMLSelectElement;
          const value = input.value;
          this.setState({ privateMessage: { ...this.state.privateMessage, to: value } });
        }
      );

      this.attachEvent(this, '#send-button', 'click', (event: Event) => {
        // console.log('send-button clicked');
        event.preventDefault();
        this.handleSendMessage();
      }
    );
    }
}
