import { BaseComponent } from "../frameworks/base-component.ts";
import { User, UserContext } from "../globalstate/GlobalState.ts";

export class GameSetting extends BaseComponent<{ user: User | null; difficulty: number }> {
  constructor() {
    super({ user: null, difficulty: 1 });
  }

  connectedCallback() {
    super.connectedCallback();
    this.state.user = UserContext().user();
    this.render();
    document.addEventListener('profile-data-updated', (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log('profile-data-updated event received');
      this.state.user = customEvent.detail.profileData;
      this.render();
    });
  }

  setDifficulty(difficulty: number) {
    this.setState({ ...this.state, difficulty });
    this.render();
  }

  setUser(user: User) {
    this.setState({ ...this.state, user });
  }

  handleDifficultyChange(event: Event) {
    event.preventDefault();
    console.log('handleDifficultyChange');
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.setDifficulty(value);
    console.log('Difficulty changed:', value);
    const progress = this.querySelector('#progress') as HTMLElement;
    if (progress) {
    //  progress.style.width = `${(value - 1) * 20}%`;
  //   const percentage = (value - 1) / (difficultyInput.max - 1) * 100;
     const percentage = (value ) / (5 ) * 100;
     progress.style.width = percentage + '%';
    }
  }

  render() {
    const { user, difficulty } = this.state;
    const percentage = (difficulty ) / (5 ) * 100; // Calculer la largeur initiale
    this.innerHTML = `
    <div class="flex flex-col items-center">
      <label for="difficulty" class="text-lg font-medium mb-4">Difficulté du jeu</label>
      <div class="relative w-64 h-8 bg-gray-300 rounded-full overflow-hidden">
        <div id="progress" class="h-full bg-blue-500 transition-all duration-300" style="width: ${percentage}%;"></div>
        <input type="range" id="difficulty" name="difficulty" min="1" max="5" value="${difficulty}" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
      </div>
      <div class="mt-4 text-center">
        <span class="text-sm ">Difficulté actuelle : ${difficulty}</span>
      </div>
    </div>
  `;
   this.attachEvent(this, '#difficulty', 'input', this.handleDifficultyChange.bind(this));

  }
}
