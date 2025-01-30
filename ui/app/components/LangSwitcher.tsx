import { useTranslation } from "react-i18next";

const lngs = {
  en: { nativeName: "English" },
  fr: { nativeName: "Français" },
} as const;

function LangSwitcher() {
  const { t, i18n } = useTranslation("common");
  return (
    <div className="dropdown">
      <div tabIndex={0} className="btn btn-ghost m-1">
        {t("language")}
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content bg-base-100 rounded-box z-[1] gap-1 w-full p-2 shadow"
      >
        {Object.entries(lngs).map(([lng, { nativeName }]) => (
          <li key={lng}>
            <a
              className={i18n.resolvedLanguage === lng ? "active" : ""}
              onClick={() => i18n.changeLanguage(lng)}
            >
              {nativeName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LangSwitcher;
