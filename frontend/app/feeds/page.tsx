"use client";

import { useEffect, useState } from "react";

const APIURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RSSItem {
  id: string;
  title: string;
  author: string;
  summary: string;
  link: string;
  pubDate: string;
}

export default function Feeds() {
  const [posts, setPosts] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${APIURL}/api/rss`);

      if (!res.ok) {
        setError("Failed to load RSS feed from server.");
        return;
      }

      const xmlText = await res.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");

      const parserError = xml.querySelector("parsererror");

      if (parserError) {
        setError("Invalid RSS feed received from server.");
        return;
      }

      const items = Array.from(xml.querySelectorAll("item"));

      const parsedPosts: RSSItem[] = items.map((item) => ({
        id: item.querySelector("guid")?.textContent || "",
        title: item.querySelector("title")?.textContent || "",
        author: item.querySelector("author")?.textContent || "",
        summary: item.querySelector("description")?.textContent || "",
        link: item.querySelector("link")?.textContent || "",
        pubDate: item.querySelector("pubDate")?.textContent || "",
      }));

      setPosts(parsedPosts);
      setError("");
    } catch (err) {
      console.error("Error fetching RSS feed:", err);
      setError("Could not connect to the RSS Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">
        Feeds / Announcements
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Live RSS XML data fetched from the RSS Server backend
      </p>

      <button
        onClick={fetchPosts}
        className="mb-6 px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-700 transition-colors"
      >
        Refresh Feed
      </button>

      {loading && <p>Loading feed...</p>}

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="text-gray-500">
          No posts available yet.
        </p>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border-2 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-[#A6192E] hover:bg-red-50 hover:-translate-y-1"
          >
            <h3 className="text-lg font-semibold">
              {post.title}
            </h3>

            <p className="text-sm text-gray-500">
              {post.pubDate
                ? new Date(post.pubDate).toLocaleDateString()
                : "No date"}
              {" · "}
              Posted by {post.author || "Unknown"}
            </p>

            <p className="mt-2">
              {post.summary}
            </p>

            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A6192E] underline mt-2 inline-block"
              >
                Read more
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}