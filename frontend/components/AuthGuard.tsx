"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../lib/api";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const user = localStorage.getItem("user");
      
      if (token && user) {
        try {
          // Verify token is still valid by making a request
          await apiClient.getCurrentUser();
          setAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear it
          apiClient.clearToken();
          setAuthenticated(false);
          router.push("/auth/login");
        }
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
