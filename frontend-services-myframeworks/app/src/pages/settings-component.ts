import { BaseComponent } from "../frameworks/base-component";

export class Settings extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
     <section class="section-container">
        <div class="section-content">
          <h1 class="section-title">${this.t("SETTINGS.TITLE")}</h1>
          <div class="section-sub-content">
            <div>
              <label class="form-label" for="theme">${this.t("THEME.TITLE")}</label>
              <select id="theme" class="form-input-select">
                <option value="light">${this.t("THEME.LIGHT")}</option>
                <option value="dark">${this.t("THEME.DARK")}</option>
                <option value="system">${this.t("THEME.SYSTEM")}</option>
              </select>
            </div>
            <language-component></language-component>
        </div>
      </section>
    `;
  }
}
