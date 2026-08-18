"use client";

import { useEffect, useState } from "react";

const APIURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function AuthStatus() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkSession() {
    try {
      const response = await fetch(`${APIURL}/api/auth/session`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      setAuthenticated(data.authenticated === true);
    } catch (error) {
      console.error("Session check failed:", error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${APIURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) {
    return (
      <span className="text-sm text-[#52606D]">
        Checking session...
      </span>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#52606D]">
          Logged in as Admin
        </span>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-[#1E3A5F] px-3 py-2 text-sm font-medium text-white hover:bg-[#172E4D]"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <a
      href="/login"
      className="rounded-lg bg-[#1E3A5F] px-3 py-2 text-sm font-medium text-white hover:bg-[#172E4D]"
    >
      Login
    </a>
  );
}