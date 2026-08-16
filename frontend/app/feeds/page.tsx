"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const APIURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Post = {
  id: number;
  title: string;
  author: string;
  summary: string;
  content: string;
  imageUrl?: string | null;
  link?: string | null;
  status: string;
  createdAt: string;
};

export default function Feeds() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const [message, setMessage] = useState("");

  async function loadPosts() {
    try {
      const response = await fetch(`${APIURL}/api/feed`);

      if (!response.ok) {
        throw new Error("Could not load posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Feed loading failed:", error);
      setMessage("Could not load announcements.");
    }
  }

  async function checkSession() {
    try {
      const response = await fetch(`${APIURL}/api/auth/session`, {
        credentials: "include",
      });

      setAuthenticated(response.ok);
    } catch {
      setAuthenticated(false);
    }
  }

  useEffect(() => {
    async function initialise() {
      await Promise.all([loadPosts(), checkSession()]);
      setLoading(false);
    }

    initialise();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredPosts = posts.filter((post) => {
    const term = searchTerm.toLowerCase();

    return (
      post.title.toLowerCase().includes(term) ||
      post.summary.toLowerCase().includes(term)
    );
  });

  async function handleAddPost(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${APIURL}/api/feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor,
          summary: newSummary,
          content: newContent,
          imageUrl: newImageUrl.trim() || null,
          link: null,
          status: "published",
        }),
      });

      if (response.status === 401) {
        setAuthenticated(false);
        setShowForm(false);
        setMessage("Please log in again.");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        setMessage(errorText || "Could not create announcement.");
        return;
      }

      setNewTitle("");
      setNewAuthor("");
      setNewSummary("");
      setNewContent("");
      setNewImageUrl("");
      setShowForm(false);

      setMessage("Announcement published successfully.");

      await loadPosts();
    } catch (error) {
      console.error("Create announcement failed:", error);
      setMessage("Could not connect to the backend.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] p-8">
        <p className="text-[#52606D]">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FA] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#172033]">
            Feeds / Announcements
          </h2>

          <p className="mt-2 text-[#52606D]">
            Latest announcements published through the RSS Server.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search posts"
          className="mb-4 w-full max-w-md rounded-lg border border-[#D9E1E8] bg-white p-2 text-[#172033]"
        />

        {authenticated ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 mt-2 block rounded-lg bg-[#1E3A5F] px-4 py-2 font-medium text-white transition-colors hover:bg-[#172E4D]"
          >
            {showForm ? "Cancel" : "+ New Announcement"}
          </button>
        ) : (
          <div className="mb-6 mt-2">
            <Link
              href="/login"
              className="text-sm font-medium text-[#1E3A5F] underline"
            >
              Login to create announcements
            </Link>
          </div>
        )}

        {showForm && authenticated && (
          <form
            onSubmit={handleAddPost}
            className="mb-6 flex flex-col gap-4 rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-[#172033]">
              New Announcement
            </h3>

            <label className="flex flex-col gap-1 text-[#172033]">
              Title
              <input
                type="text"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                required
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Posted by
              <input
                type="text"
                value={newAuthor}
                onChange={(event) => setNewAuthor(event.target.value)}
                required
                placeholder="e.g. Admin"
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Summary
              <input
                type="text"
                value={newSummary}
                onChange={(event) => setNewSummary(event.target.value)}
                required
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Full content
              <textarea
                value={newContent}
                onChange={(event) => setNewContent(event.target.value)}
                required
                rows={4}
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Image URL (optional)
              <input
                type="url"
                value={newImageUrl}
                onChange={(event) => setNewImageUrl(event.target.value)}
                placeholder="https://example.com/image.jpg"
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <button
              type="submit"
              className="self-start rounded-lg bg-[#1E3A5F] px-4 py-2 font-medium text-white transition-colors hover:bg-[#172E4D]"
            >
              Publish Announcement
            </button>
          </form>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-[#D9E1E8] bg-white p-3">
            <p className="text-sm text-[#52606D]">{message}</p>
          </div>
        )}

        <div className="grid gap-4">
          {filteredPosts.length === 0 && (
            <p className="text-[#52606D]">
              No posts match your search.
            </p>
          )}

          {filteredPosts.map((post) => {
            const isExpanded = expandedId === post.id;

            return (
              <div
                key={post.id}
                className="rounded-xl border-2 border-[#D9E1E8] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#0891B2] hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#172033]">
                  {post.title}
                </h3>

                <p className="mt-1 text-sm text-[#52606D]">
                  {new Date(post.createdAt).toLocaleDateString()} · Posted by{" "}
                  {post.author}
                </p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="mt-3 h-40 w-full rounded-lg object-cover"
                  />
                )}

                <p className="mt-3 text-[#172033]">{post.summary}</p>

                {isExpanded && (
                  <p className="mt-3 text-[#52606D]">{post.content}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-4">
                  <button
                    onClick={() => toggleExpand(post.id)}
                    aria-expanded={isExpanded}
                    className="font-medium text-[#1E3A5F] underline"
                  >
                    {isExpanded ? "Show less ▲" : "Show more ▼"}
                  </button>

                  <Link
                    href={`/feeds/${post.id}`}
                    className="font-medium text-[#1E3A5F]"
                  >
                    Full page →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}