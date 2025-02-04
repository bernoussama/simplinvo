/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Link } from "@remix-run/react";
import { isLoggedIn, pb } from "@/lib/pocketbase";
import ThemeToggle from "./theme-toggle";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LangSwitcher from "./LangSwitcher";

export default function NavBar() {
  const { t } = useTranslation("common");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    const unsubscribe = pb.authStore.onChange(() => {
      setLoggedIn(isLoggedIn());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const record = await pb
        .collection("companies")
        .getOne(pb.authStore.record?.company);
      setCompanyName(record.name);
    })();
  }, [loggedIn]);

  const navigate = useNavigate();

  function logout() {
    pb.authStore.clear();
    // reload the page
    navigate("/");
  }

  return (
    <div className="navbar w-full bg-base-100 shadow-sm">
      <div className="navbar container mx-auto">
        <div className="navbar-start">
          {loggedIn && (
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/clients">Clients</Link>
                </li>
                <li>
                  <Link to="/products">{t("products")}</Link>
                </li>
                <li>
                  <Link to="/invoices">{t("invoices")}</Link>
                </li>
                <li>
                  <Link to="/invoice">{t("invoice-preview")}</Link>
                </li>
              </ul>
            </div>
          )}
          <Link className="btn btn-ghost text-xl" to="/">
            Simplinvo
          </Link>
        </div>
        {loggedIn && (
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link to="/dashboard">{t("dashboard")}</Link>
              </li>
              <li>
                <Link to="/clients">Clients</Link>
              </li>
              <li>
                <Link to="/products">{t("products")}</Link>
              </li>
              <li>
                <Link to="/invoices">{t("invoices")}</Link>
              </li>
              <li>
                <Link to="/invoice">{t("invoice-preview")}</Link>
              </li>
            </ul>
          </div>
        )}
        <div className="navbar-end gap-4">
          {loggedIn && (
            <Link to="/profile" className="btn btn-ghost">
              {companyName}
            </Link>
          )}
          <ThemeToggle />
          <div className="flex">
            {loggedIn ? (
              <button className="btn" onClick={logout}>
                {t("logout")}
              </button>
            ) : (
              <Link className="btn" to="/login">
                {t("login")}
              </Link>
            )}
          </div>
          <div className="hidden lg:flex">
            <LangSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
