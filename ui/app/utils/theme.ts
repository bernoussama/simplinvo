export function setTheme() {
  if (typeof window === "undefined") return;

  const dark = JSON.parse(window.localStorage.getItem("isdark") || "true");

  window.document.documentElement.setAttribute(
    "data-theme",
    dark ? "business" : "corporate"
  );
}
