import { getCurrentUser, isLoggedIn } from "@/lib/pocketbase";
import { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Dashboard page" },
  ];
};

export default function Dashboard() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    if (isLoggedIn()) {
      setUsername(getCurrentUser()?.name);
    }
  }, []);

  return (
    <div>
      {/* <h1 className="text-3xl font-bold">Dashboard</h1> */}
      {loggedIn ? (
        <h1 className="text-3xl font-bold">Welcome {username}</h1>
      ) : (
        <></>
      )}
    </div>
  );
}
