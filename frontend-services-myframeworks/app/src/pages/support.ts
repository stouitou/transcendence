import { BaseComponent } from "../frameworks/base-component.ts";
import { LanguageContext } from "../globalstate/LanguageContext.ts";
import { t } from "../i18n/translations.ts";

export class Support extends BaseComponent<{}> {
  constructor() {
    super({});
  }

  connectedCallback() {
    this.render();
    LanguageContext().subscribe(this.render.bind(this));
  }

  disconnectedCallback() {
    LanguageContext().unsubscribe(this.render.bind(this));
  }

  render() {
    const lang = LanguageContext().getLang();

    this.innerHTML = `
      <section class="px-4 py-10 text-gray-900 dark:text-white min-h-screen">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6 text-center">${t("support_title", lang)}</h1>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-6">
            
            <section>
              <h2 class="text-xl font-semibold mb-2">${t("legal_title", lang)}</h2>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                ${t("legal_text", lang)} 
                <a href="mailto:support@crocopong.com" class="text-blue-500 hover:underline">support@crocopong.com</a>.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold mb-2">${t("privacy_title", lang)}</h2>
              <ul class="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>${t("privacy_1", lang)}</li>
                <li>${t("privacy_2", lang)}</li>
                <li>${t("privacy_3", lang)}</li>
                <li>${t("privacy_4", lang)}</li>
                <li>${t("privacy_5", lang)}</li>
              </ul>
            </section>

            <section>
              <h2 class="text-xl font-semibold mb-2">${t("contact_title", lang)}</h2>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                ${t("contact_text", lang)} 
                <a href="mailto:support@crocopong.com" class="text-blue-500 hover:underline">support@crocopong.com</a>.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold mb-2">${t("update_title", lang)}</h2>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                ${t("update_text", lang)} <strong>Mai 2025</strong>
              </p>
            </section>

          </div>
        </div>
      </section>
    `;
  }
}
