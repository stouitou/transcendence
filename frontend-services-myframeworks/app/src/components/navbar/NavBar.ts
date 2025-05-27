import { BaseComponent } from "../../frameworks/base-component";
import {  UserContext } from "../../globalstate/GlobalState";
import { User } from "../../types/types";
import { Logout } from "../button/logout-btn";
import { MessageBtn } from "../button/message-btn";
import { DropdownProfile } from "../DropdownProfile";

if (!customElements.get('logout-btn'))
customElements.define('logout-btn', Logout);

if (!customElements.get('msg-btn'))
customElements.define('msg-btn', MessageBtn);
if (!customElements.get('dropdown-porfile-component')) {
  customElements.define('dropdown-porfile-component', DropdownProfile);
}

/**
 * Composant de barre de navigation
 */
export class NavBarComponent extends BaseComponent<{ theme: string,user: User | null,islogged:boolean }> {
    
  constructor() { super({ theme: 'light',user:null, islogged:false }); }

    connectedCallback() {
      this.state.user = UserContext().user();
      this.render();
      document.addEventListener('profile-data-updated', (e: Event) => {
        const customEvent = e as CustomEvent;
        console.log('profile-data-updated event received');
        this.state.user = customEvent.detail.profileData;
        this.render();
      });

    }

  render() {
    const { user } = this.state;
      this.innerHTML = `
          <header class="relative z-10 py-5 ">
            <div class="container mx-auto flex justify-between my-6">
                <div class="main-title">
                    Plastic Pong Game
                </div>
                <nav class="flex space-x-6 ">

                <!-- Theme Toggle -->
                   <div  id="theme-toggle"  class="flex h-7 w-14 rounded-full bg-gray-100 dark:bg-gray-900">
                      <span class="sr-only">Switch to light / dark version</span>
                      <div class="flex justify-between items-center w-full">
                        <div class="flex justify-center items-center h-6 w-6">
                          <button class="flex justify-center items-center h-6 w-6 rounded-full bg-yellow-300 text-gray-900 dark:bg-transparent dark:text-gray-200" id="handle-darkmode-off" type="button">
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
                              </path>
                            </svg><span class="sr-only">DarkMode off</span>
                          </button>
                        </div>
                        <div class="flex justify-center items-center h-6 w-6">
                          <button class="flex justify-center items-center h-6 w-6 rounded-full bg-transparent text-gray-900 dark:bg-white text dark:text-gray-900" id="handle-darkmode-on" type="button">
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg><span class="sr-only">darkMode on</span>
                          </button>
                        </div>
                      </div>
                    </div>
                <!-- End Theme Toggle -->

                    <a href="/"  class=" nav-link">
                      Home	
                    </a>
                    <a href="/game" class="nav-link">
                      Game	
                    </a>

               <!--     <a href="/game-loby" class="nav-link">
                    game-loby	test
                    </a> -->

                     ${!user ?`
                    <a href="/login" class="nav-link">
                      Log-In	
                    </a>
                    <a href="/register" class="nav-link">
                      Register	
                    </a>`:``}                   
 <dropdown-porfile-component></dropdown-porfile-component>

                </nav>
                
            </div>
          </header>
    `;

 this.attachEvent(this, '#theme-toggle', 'click', this.themeToggleFn.bind(this));
 
 

 const currentUrl = window.location.href;
  const links = document.querySelectorAll('#subMenu a');
links.forEach(link => {
  if ((link as HTMLAnchorElement).href === currentUrl) {
    link.classList.add('text-blue-500', 'dark:text-blue-400');
  } else {
    link.classList.remove('text-blue-500', 'dark:text-blue-400');
  }
});


 this.attachEvent(this,'header','click', (e: Event) => {
  const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const links = document.querySelectorAll('header a');
        links.forEach(link => link.classList.remove('text-blue-500', 'dark:text-blue-400'));
        target.classList.add('text-blue-500', 'dark:text-blue-400');
      }
    });
  } 


  themeToggleFn(e: Event) {
    e.preventDefault();
    const currentTheme = document.documentElement.getAttribute('data-theme');

    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }

    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    };

  // create a new theme attribute
  // and set it to the new theme
  const newTheme = localStorage.getItem('color-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
}

}