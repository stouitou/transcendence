import { BaseComponent } from "../frameworks/base-component";

export class Support extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="px-4 py-10 text-gray-900 dark:text-white">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">${this.t("SUPPORT.TITLE")}</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            
            <section>
              <h2 class="text-xl font-semibold mb-2">${this.t("SUPPORT.LEGAL_TITLE")}</h2>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                ${this.t("SUPPORT.LEGAL_TEXT")} 
                <a href="mailto:support@crocopong.com" class="text-blue-500 hover:underline">support@crocopong.com</a>.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold mb-2">${this.t("SUPPORT.PRIVACY_TITLE")}</h2>
              <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>${this.t("SUPPORT.PRIVACY_1")}</li>
                <li>${this.t("SUPPORT.PRIVACY_2")}</li>
                <li>${this.t("SUPPORT.PRIVACY_3")}</li>
                <li>${this.t("SUPPORT.PRIVACY_4")}</li>
                <li>${this.t("SUPPORT.PRIVACY_5")}</li>
              </ul>
            </section>

            <section>
              <h2 class="text-xl font-semibold mb-2">${this.t("SUPPORT.CONTACT_TITLE")}</h2>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                ${this.t("SUPPORT.CONTACT_TEXT")} 
                <a href="mailto:support@crocopong.com" class="text-blue-500 hover:underline">support@crocopong.com</a>.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold mb-2">${this.t("SUPPORT.UPDATE_TITLE")}</h2>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                ${this.t("SUPPORT.UPDATE_TEXT")} <strong>Mai 2025</strong>
              </p>
            </section>

          </div>
        </div>
      </section>
    `;
  }
}
