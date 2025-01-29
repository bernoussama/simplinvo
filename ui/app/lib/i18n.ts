/* eslint-disable import/no-named-as-default-member */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import resourcesToBackend from "i18next-resources-to-backend";

if (typeof window !== "undefined") {
  const localResources = {
    en: {
      translation: {
        products: "Products",
        invoices: "Invoices",
        dashboard: "Dashboard",
        clients: "Clients",
        profile: "Profile",
        // "invoice-preview": "Invoice Preview",
      },
    },
    fr: {
      translation: {
        products: "Produits",
        invoices: "Factures",
        clients: "Clients",
        profile: "Profil",
        // "invoice-preview": "Aperçu de facture",
      },
    },
  };

  i18n
    // i18next-http-backend
    // loads translations from your server
    // https://github.com/i18next/i18next-http-backend
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
      debug: true,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      fallbackLng: "en",
      preload: ["en", "fr"],
      // preload: false,
      ns: ["translation"],
      defaultNS: "translation",
      backend: {
        backends: [
          Backend, // if a namespace can't be loaded via normal http-backend loadPath, then the inMemoryLocalBackend will try to return the correct resources
          resourcesToBackend(localResources),
        ],
        // backendOptions: [
        //   {
        //     loadPath: `/locales/{{lng}}/{{ns}}.json`,
        //   },
        // ],
      },
    });
}

export default i18n;
