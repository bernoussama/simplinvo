import { Outlet } from "@remix-run/react";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div className="w-full mx-auto h-full flex">
      <NavBar />
      <Outlet />
    </div>
  );
}
