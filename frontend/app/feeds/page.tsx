"use client";

import { useEffect, useState } from "react";

const APIURL = "http://3.218.151.177:4080" ;

interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  summary: string;
  imageUrl: string | null;
  link: string | null;
  status: "published" | "draft";
  createdAt: string;
}

export default function Feeds() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${APIURL}/api/feed`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setError("");
      } else {
        setError("Failed to load feed from server.");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Could not connect to the RSS Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Feeds / Announcements</h2>
      <p className="text-sm text-gray-500 mb-4">
        Live data fetched from the RSS Server backend
      </p>

      <button
        onClick={fetchPosts}
        className="mb-6 px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-700 transition-colors"
      >
        Refresh Feed
      </button>

      {loading && <p>Loading feed...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="text-gray-500">No posts available yet.</p>
      )}

      <div className="grid gap-4">
        {posts.map((post) => {
          const isExpanded = expandedId === post.id;
          return (
            <div
              key={post.id}
              className="border-2 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-[#A6192E] hover:bg-red-50 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()} · Posted by {post.author} ·{" "}
                <strong>{post.status}</strong>
              </p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded mt-2"
                />
              )}

              <p className="mt-2">{post.summary}</p>

              {isExpanded && <p className="mt-2 text-gray-700">{post.content}</p>}

              <button
                onClick={() => toggleExpand(post.id)}
                className="text-[#A6192E] underline mt-2"
              >
                {isExpanded ? "Show less ▲" : "Show more ▼"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}