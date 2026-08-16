"use client";

import { useState } from "react";

const APIURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${APIURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        setMessage("Invalid email or password.");
        return;
      }

      setMessage("Login successful.");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] p-8">
      <div className="mx-auto max-w-md rounded-xl border border-[#D9E1E8] bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-[#172033]">
          Admin Login
        </h1>

        <p className="mb-6 text-[#52606D]">
          Sign in to manage RSS announcements.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[#172033]"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[#D9E1E8] px-3 py-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[#172033]"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[#D9E1E8] px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#1E3A5F] px-4 py-2 font-medium text-white hover:bg-[#172E4D]"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-[#52606D]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}