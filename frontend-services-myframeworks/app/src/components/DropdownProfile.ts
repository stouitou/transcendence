import { BaseComponent } from "../frameworks/base-component";

export class DropdownProfile extends BaseComponent<{ isDrop: boolean, avatar: string }> {
  constructor() {
    super({
      isDrop: false,
      avatar: "https://localhost:4433/uploads/1-avatartest.jpg"
    });
  }

  connectedCallback() {
    this.render();
  }

  toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    this.state.isDrop = !this.state.isDrop;
    this.render();
    if (this.state.isDrop) {
      document.addEventListener("click", this.handleOutsideClick);
    } else {
      document.removeEventListener("click", this.handleOutsideClick);
    }
  }

  handleOutsideClick = (e: MouseEvent) => {
    if (!this.contains(e.target as Node)) {
      this.state.isDrop = false;
      this.render();
      document.removeEventListener("click", this.handleOutsideClick);
    }
  }

  render() {
    const { isDrop, avatar } = this.state;

    this.innerHTML = `
    <div class="relative inline-block text-left">
      <button id="avatar-btn" class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
        <img src="${avatar}" alt="User avatar" class="w-8 h-8 rounded-full" />
      </button>

      ${isDrop ? `
        <div id="dropdown" class="dropdown-menu transition ease-out duration-200 transform opacity-0 scale-95 absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg divide-y divide-gray-100 dark:divide-gray-600 z-50">
          <div class="flex items-center p-4">
            <img src="${avatar}" alt="User avatar" class="w-10 h-10 rounded-full mr-3">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Bonnie Green</p>
              <p class="text-sm text-gray-500 dark:text-gray-300">name@flowbite.com</p>
            </div>
          </div>
          <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li><a href="/settings" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a></li>
            <li><a href="/dashboard" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a></li>
            <li><a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a></li>
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  // Ajouter listener bouton
  const btn = this.querySelector('#avatar-btn');
  if (btn) {
    btn.addEventListener('click', this.toggleDropdown);
  }

  // Animation dropdown (après le render)
  if (isDrop) {
    const dropdown = this.querySelector('#dropdown');
    if (dropdown) {
      requestAnimationFrame(() => {
        dropdown.classList.remove('opacity-0', 'scale-95');
        dropdown.classList.add('opacity-100', 'scale-100');
      });
    }
  }}}