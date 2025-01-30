/* eslint-disable import/no-named-as-default-member */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEN from "@/locales/en/common.json";
import commonFR from "@/locales/fr/common.json";
import invoicesEN from "@/locales/en/invoices.json";
import invoicesFR from "@/locales/fr/invoices.json";
import profileEN from "@/locales/en/profile.json";
import profileFR from "@/locales/fr/profile.json";
import indexEN from "@/locales/en/index.json";
import indexFR from "@/locales/fr/index.json";
import { isProd } from "./utils";

if (typeof window !== "undefined") {
  const localResources = {
    en: {
      common: commonEN,
      clients: {
        title: "Clients",
        new: "New",
        newClient: "New Client",
        form: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          address: "Address",
          city: "City",
          country: "Country",
          postalCode: "Postal Code",
          ice: "ICE",
          tax: "Tax",
        },
        actions: {
          save: "Save",
          cancel: "Cancel",
          edit: "Edit",
          delete: "Delete",
        },
        errors: {
          deleteError:
            "Product can't be deleted because it's referenced in an invoice",
          noCompany: "No company found",
        },
      },
      products: {
        title: "Products",
        new: "New Product",
        form: {
          name: "Name",
          description: "Description",
          price: "Price",
          tax: "Tax",
        },
        actions: {
          save: "Save",
          cancel: "Cancel",
          edit: "Edit",
          delete: "Delete",
        },
        errors: {
          deleteError:
            "Product can't be deleted because it's referenced in an invoice",
        },
      },
      invoices: invoicesEN,
      profile: profileEN,
      index: indexEN,
    },
    fr: {
      common: commonFR,
      clients: {
        title: "Clients",
        new: "Nouveau",
        newClient: "Nouveau Client",
        form: {
          name: "Nom",
          email: "Email",
          phone: "Téléphone",
          address: "Adresse",
          city: "Ville",
          country: "Pays",
          postalCode: "Code Postal",
          ice: "ICE",
          tax: "Taxe",
        },
        actions: {
          save: "Enregistrer",
          cancel: "Annuler",
          edit: "Modifier",
          delete: "Supprimer",
        },
        errors: {
          deleteError:
            "Le produit ne peut pas être supprimé car il est référencé dans une facture",
          noCompany: "Aucune entreprise trouvée",
        },
      },
      products: {
        title: "Produits",
        new: "Nouveau Produit",
        form: {
          name: "Nom",
          description: "Description",
          price: "Prix",
          tax: "Taxe",
        },
        actions: {
          save: "Enregistrer",
          cancel: "Annuler",
          edit: "Modifier",
          delete: "Supprimer",
        },
        errors: {
          deleteError:
            "Le produit ne peut pas être supprimé car il est référencé dans une facture",
        },
      },
      invoices: invoicesFR,
      profile: profileFR,
      index: indexFR,
    },
  };

  i18n
    // i18next-http-backend
    // loads translations from your server
    // https://github.com/i18next/i18next-http-backend
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
      debug: !isProd,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      fallbackLng: "en",
      resources: localResources,
    });
}

export default i18n;
