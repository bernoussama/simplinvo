import { isLoggedIn } from "@/lib/pocketbase";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Protected({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  if (loggedIn === null) {
    return <div>Loading...</div>;
  }

  return loggedIn ? <>{children}</> : <Navigate to="/join" />;
}
