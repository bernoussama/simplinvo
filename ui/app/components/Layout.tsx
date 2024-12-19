import { Outlet } from "@remix-run/react";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="container">
      <NavBar />
      <main className="container mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
