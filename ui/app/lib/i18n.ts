/* eslint-disable import/no-named-as-default-member */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

if (typeof window !== "undefined") {
  const localResources = {
    en: {
      common: {
        products: "Products",
        invoices: "Invoices",
        dashboard: "Dashboard",
        clients: "Clients",
        profile: "Profile",
        login: "Login",
        logout: "Logout",
        "invoice-preview": "Invoice Preview",
        "total-sales": "Total sales",
        sales: "Sales",
        "sales-by-client": "Sales by client",
      },
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
    },
    fr: {
      common: {
        products: "Produits",
        invoices: "Factures",
        dashboard: "Tableau de bord",
        clients: "Clients",
        profile: "Profil",
        login: "Connexion",
        logout: "Déconnexion",
        "invoice-preview": "Aperçu de facture",
        "total-sales": "Total des ventes",
        sales: "Ventes",
        "sales-by-client": "Ventes par client",
      },
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
      debug: true,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      fallbackLng: "en",
      resources: localResources,
    });
}

export default i18n;
