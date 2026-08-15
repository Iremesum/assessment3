"use client"; // This uses React state and browser APIs (cookies), so it must run in the browser

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Context lets us share the theme state with any component in the app,
// without manually passing it down through every single component as a prop.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Writes a cookie manually, since cookies don't have a simple built-in JS API like localStorage does.
function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

// Reads a cookie's value by name, using a regex to find it inside document.cookie's raw string.
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Wraps the whole app (see layout.tsx) so every page/component can access the current theme.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Runs once when the app first loads in the browser.
  // Checks if a theme was saved from a previous visit, and applies it.
  useEffect(() => {
    const savedTheme = getCookie("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  // Switches between light and dark, saves the choice as a cookie (30 day expiry),
  // and updates the <html> tag so CSS can respond to the change.
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setCookie("theme", newTheme, 30);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook so any component can easily read/change the theme with useTheme()
// instead of manually importing and using ThemeContext directly.
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}