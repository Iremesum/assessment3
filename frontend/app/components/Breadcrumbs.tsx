"use client"; // Needs to read the current URL live, so it must run in the browser

import Link from "next/link";
import { usePathname } from "next/navigation"; // Next.js hook that tells us the current page's URL

export default function Breadcrumbs() {
  const pathname = usePathname(); // e.g. "/feeds/2"

  // Split the URL into pieces, ignoring empty strings
  // e.g. "/feeds/2" becomes ["feeds", "2"]
  const segments = pathname.split("/").filter((seg) => seg !== "");

  return (
    <nav aria-label="Breadcrumb" className="p-4 text-sm text-gray-600">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      {/* Build up a trail of links, one for each part of the URL */}
      {segments.map((segment, index) => {
        // Build the URL for this specific breadcrumb link
        const href = "/" + segments.slice(0, index + 1).join("/");
        // Capitalize the first letter for display (e.g. "feeds" -> "Feeds")
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        return (
          <span key={href}>
            {" "}
            &gt;{" "}
            <Link href={href} className="hover:underline">
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}