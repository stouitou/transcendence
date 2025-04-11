import { BaseComponent } from "../frameworks/base-component.ts";
import { LoginGoogle } from './button/login-google-btn.ts';
import { LoginGithub } from './button/login-github-btn.ts';
import { Login42Api } from './button/login-42Api-btn.ts';

if (!customElements.get('login-google-btn'))
customElements.define('login-google-btn', LoginGoogle);
if (!customElements.get('login-github-btn'))
customElements.define('login-github-btn', LoginGithub);
if (!customElements.get('login-42api-btn'))
customElements.define('login-42api-btn', Login42Api);

export class LoginProvider extends BaseComponent {
  constructor() {
    super({});
  }

  render() {
      this.innerHTML = `
        <div class="max-w-sm mx-auto flex flex-col space-y-1">
                <login-google-btn></login-google-btn>
                <login-github-btn></login-github-btn>
                <login-42api-btn></login-42api-btn>
        </div>
    `;
  } 
}