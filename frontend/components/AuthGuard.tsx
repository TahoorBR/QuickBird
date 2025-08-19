"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("authUser");
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        router.push("/auth/login");
      }
      setLoading(false);
    };

    checkAuth();

    // Listen to changes in localStorage (e.g., logout in another tab)
    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        Loading...
      </div>
    );

  if (!authenticated) return null;

  return <>{children}</>;
};

export default AuthGuard;
