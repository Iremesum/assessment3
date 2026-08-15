"use client"; // This component uses interactivity (useState), so it must run in the browser, not just on the server

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  // Tracks whether the mobile hamburger menu is currently open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Shared styling for nav links - includes a hover highlight effect
  const linkClasses = "px-3 py-1 rounded transition-colors duration-200 hover:bg-[#7d1220] hover:text-white";
  
  return (
    <nav className="bg-[#A6192E] text-white p-4 relative">
      <div className="flex justify-between items-center">
        {/* Full navigation links - only visible on larger screens (sm breakpoint and up) */}
        <div className="hidden sm:flex gap-4">
          <Link href="/" className={linkClasses}>Home</Link>
          <Link href="/about" className={linkClasses}>About</Link>
          <Link href="/feeds" className={linkClasses}>Feeds</Link>
          <Link href="/settings" className={linkClasses}>Settings</Link>
        </div>

        {/* Hamburger icon button - only visible on small screens (mobile) */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu" // Helps screen readers understand what this button does
          aria-expanded={isOpen} // Tells screen readers whether the menu is currently open
        >
          {/* Three lines that make up the hamburger icon. Each animates using CSS transforms. */}
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : "" // Rotates into the top part of an X when open
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100" // Middle line fades out when open
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : "" // Rotates into the bottom part of an X when open
            }`}
          />
        </button>
      </div>

      {/* Dropdown menu for mobile - slides open/closed using a max-height transition */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-60 mt-4" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-2">
          {/* Clicking a link also closes the menu, giving clear feedback that navigation happened */}
          <Link href="/" className={linkClasses} onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/about" className={linkClasses} onClick={() => setIsOpen(false)}>About</Link>
          <Link href="/feeds" className={linkClasses} onClick={() => setIsOpen(false)}>Feeds</Link>
          <Link href="/settings" className={linkClasses} onClick={() => setIsOpen(false)}>Settings</Link>
        </div>
      </div>
    </nav>
  );
}