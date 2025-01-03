/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Link } from "@remix-run/react";
import { isLoggedIn, pb } from "@/lib/pocketbase";
import ThemeToggle from "./theme-toggle";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    const unsubscribe = pb.authStore.onChange(() => {
      setLoggedIn(isLoggedIn());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const navigate = useNavigate();
  function logout() {
    console.log("logout");
    pb.authStore.clear();
    // reload the page
    navigate("/");
  }
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          {/* small screen menu */}
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
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
              {/* <ul className="p-2"> */}
              {/*   <li> */}
              {/*     <a>Submenu 1</a> */}
              {/*   </li> */}
              {/*   <li> */}
              {/*     <a>Submenu 2</a> */}
              {/*   </li> */}
              {/* </ul> */}
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/invoices">Invoices</Link>
            </li>
          </ul>
        </div>
        {/* large screen nav */}
        <Link className="btn btn-ghost text-xl" to="/">
          Simplinvo
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/clients">Clients</Link>
          </li>
          <li>
            <Link to="/products">Products</Link>
          </li>
          <li>
            <Link to="/invoices">Invoices</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end gap-4">
        <ThemeToggle />
        {loggedIn ? (
          <button className="btn" onClick={logout}>
            Logout
          </button>
        ) : (
          <Link className="btn" to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
