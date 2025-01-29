import { useTranslation } from "react-i18next";

const lngs = {
  en: { nativeName: "English" },
  fr: { nativeName: "Français" },
} as const;

function LangSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm">
        Language
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box"
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
