import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation("footer");
  const year = new Date().getFullYear().toString();

  return (
    <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto">
      <aside>
        <p>{t("copyright", { year })}</p>
      </aside>
    </footer>
  );
}

export default Footer;
