import { BaseComponent } from "../frameworks/base-component.ts";
import { User, UserContext } from "../globalstate/GlobalState.ts";
import { IWebSocketsService, WebSocketsService } from "../globalstate/WebSocketService.ts";
import { Logout } from "../components/button/logout-btn.ts";
import { LanguageContext } from "../globalstate/LanguageContext";
import { t } from "../i18n/translations";

if (!customElements.get('logout-btn'))
  customElements.define('logout-btn', Logout);

interface PrivateMessage {
  from: string;
  message: string;
}
export class ChatComponent extends BaseComponent<{
  ws: IWebSocketsService | null, isOnline: string[] | null,
  privateMessage: { to: string, inputMessage: string },
  messagesBySender: { [key: string]: PrivateMessage[] },
  activeTab: string | null
}> {

  constructor() {
    super(
      {
        ws: null,
        isOnline: null,
        privateMessage: { to: '', inputMessage: '' },
        messagesBySender: {},
        activeTab: null
      });
  }
  connectedCallback() {
    super.connectedCallback();
    this.state.ws = UserContext().ws();
    this.handleMessageBySender();
    this.state.isOnline = UserContext().ws()?.isOnline ?? null;
    this.render();
    LanguageContext().subscribe(() => this.render());
    document.addEventListener('ws-isOnline', (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('profile-data-updated event received');
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

    })

    document.addEventListener('ws-privateMessage', (e: Event) => {
      this.handleMessageBySender();
      this.render();
    });
  }



  handleMessageBySender = () => {
    const myEmail = UserContext().user()?.email;
    if (!myEmail) return;

    const privateMessages = this.state.ws?.privateMessages || [];

    // Regrouper les messages par contact (from ou to != moi)
    const groupedMessages: { [key: string]: PrivateMessage[] } = {};

    privateMessages.forEach((msg) => {
      const contact = msg.from === myEmail ? msg.to : msg.from;
      if (!groupedMessages[contact]) {
        groupedMessages[contact] = [];
      }
      groupedMessages[contact].push(msg);
    });

    this.setMessagesBySender(groupedMessages);
  };



  setMessagesBySender = (messages: { [key: string]: PrivateMessage[] }) => {
    this.setState({ messagesBySender: { ...this.state.messagesBySender, ...messages } });
  }

  setActiveTab = (sender: string) => {
    this.setState({ activeTab: sender });
    this.render();
  }

  setInput = (input: string) => {
    this.setState({ privateMessage: { ...this.state.privateMessage, inputMessage: input } });
  }

  handleSendMessage = () => {
    const { inputMessage, to } = this.state.privateMessage;

    if (inputMessage.trim() !== '' && to.trim() !== '') {
      const msgData = {
        type: "private",
        to,
        message: inputMessage,
      };

      // Ajoute immédiatement le message dans le bon groupe de messages (optimiste)
      const currentUser = UserContext().user()?.email || 'Me';
      const newMessage = { from: currentUser, message: inputMessage };

      const updatedMessages = {
        ...this.state.messagesBySender,
        [to]: [...(this.state.messagesBySender[to] || []), newMessage]
      };

      this.setState({
        privateMessage: { ...this.state.privateMessage, inputMessage: '' },
        messagesBySender: updatedMessages
      });

      // Envoi WebSocket
      this.state.ws?.sendMessage(JSON.stringify(msgData));

      // Garde la tab active après envoi
      this.setActiveTab(to);
    }
  };


  render() {
    const currentLang = LanguageContext().getLang();

    const { isOnline, messagesBySender, activeTab, privateMessage } = this.state;

    this.innerHTML = `
      <div class="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        
        <!-- Header Tabs (conversations) -->
        <div class="flex overflow-x-auto gap-2 bg-gray-100 dark:bg-gray-800 p-3 border-b dark:border-gray-700">
          ${Object.keys(messagesBySender).map(sender => `
            <button
              data-sender="${sender}"
              class="chat-tab-btn relative shrink-0 px-4 py-2 rounded-full whitespace-nowrap text-sm transition
                ${activeTab === sender ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-blue-500 hover:text-white'}
                ${!isOnline?.includes(sender) ? 'opacity-40' : ''}
              ">
              ${sender}
              ${messagesBySender[sender].length > 0 ? `
                <span class="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  ${messagesBySender[sender].length}
                </span>
              ` : ''}
            </button>
          `).join('')}
        </div>
  
        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-800" id="messageContainer">
          ${activeTab && messagesBySender[activeTab] ? messagesBySender[activeTab].map(msg => {
      const isMine = msg.from === UserContext().user()?.email;
      return `
    <div class="flex ${isMine ? 'justify-end' : 'justify-start'}">
      <div class="max-w-xs px-4 py-2 rounded-2xl text-sm
        ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 dark:text-white'}
      ">
        ${msg.message}
        <div class="text-[10px] opacity-60 mt-1">${isMine ? `${t("me", currentLang)}` : msg.from}</div>
      </div>
    </div>
  `;
    }).join('') : `
  <div class="text-sm text-gray-500 dark:text-gray-400 text-center">${t("no_conv", currentLang)}</div>
`}

        </div>
  
        <!-- Input Area -->
        <div class="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700 space-y-2">
          <div class="flex gap-2">
            <select id="inputSelectUser" class="w-1/3 rounded-lg border px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
              <option value="">${t("choose_user", currentLang)}</option>
              ${isOnline?.map(user => `
                <option value="${user}" ${user === privateMessage.to ? 'selected' : ''}>${user}</option>
              `).join('')}
            </select>
  
            <input
              id="inputMessage"
              type="text"
              placeholder="${t("write_msg", currentLang)}"
              value="${privateMessage.inputMessage}"
              class="flex-1 rounded-lg border px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button id="send-button" class="bg-gradient-to-br
                 from-indigo-500 via-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg transition">
                 ${t("send", currentLang)}
            </button>
          </div>
        </div>
      </div>
    `;

    // 👇 Réattacher les événements après render (important car DOM recréé à chaque fois)

    // Tabs
    this.querySelectorAll('.chat-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sender = btn.getAttribute('data-sender');
        if (sender) {
          this.setActiveTab(sender);
        }
      });
    });

    // Input message
    this.attachEvent(this, '#inputMessage', 'input', (e) => {
      const input = e.target as HTMLInputElement;
      this.setInput(input.value);
    });

    // Select user
    this.attachEvent(this, '#inputSelectUser', 'change', (e) => {
      const select = e.target as HTMLSelectElement;
      this.setState({ privateMessage: { ...this.state.privateMessage, to: select.value } });
    });

    // Send message
    this.attachEvent(this, '#send-button', 'click', (e) => {
      e.preventDefault();
      this.handleSendMessage();
    });

    // Focus scroll on new message
    const container = this.querySelector('#messageContainer');
    if (container) container.scrollTop = container.scrollHeight;
  }
}

