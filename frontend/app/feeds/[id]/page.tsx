"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

export default function PostPage() {
  const params = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const [message, setMessage] = useState("");

  const postId = params.id;

  async function loadPost() {
    try {
      const response = await fetch(
        `${APIURL}/api/feed?id=${postId}`
      );

      if (response.status === 404) {
        setPost(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load post");
      }

      const data: Post = await response.json();

      setPost(data);

      setEditTitle(data.title);
      setEditAuthor(data.author);
      setEditSummary(data.summary);
      setEditContent(data.content);
      setEditImageUrl(data.imageUrl || "");
    } catch (error) {
      console.error("Post loading failed:", error);
      setMessage("Could not load announcement.");
    } finally {
      setLoading(false);
    }
  }

  async function checkSession() {
    try {
      const response = await fetch(`${APIURL}/api/auth/session`, {
        credentials: "include",
      });

      const data = await response.json();

      setAuthenticated(data.authenticated === true);
    } catch {
      setAuthenticated(false);
    }
  }

  useEffect(() => {
    loadPost();
    checkSession();
  }, [postId]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${APIURL}/api/feed?id=${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: editTitle,
            author: editAuthor,
            summary: editSummary,
            content: editContent,
            imageUrl: editImageUrl.trim() || null,
          }),
        }
      );

      if (response.status === 401) {
        setAuthenticated(false);
        setMessage("Please log in again.");
        return;
      }

      if (!response.ok) {
        setMessage("Could not save changes.");
        return;
      }

      const updatedPost = await response.json();

      setPost(updatedPost);
      setIsEditing(false);
      setMessage("Announcement updated successfully.");
    } catch (error) {
      console.error("Update failed:", error);
      setMessage("Could not connect to the backend.");
    }
  }

  async function handleDelete() {
    const confirmed = confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${APIURL}/api/feed?id=${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setAuthenticated(false);
        setMessage("Please log in again.");
        return;
      }

      if (!response.ok) {
        setMessage("Could not delete announcement.");
        return;
      }

      router.push("/feeds");
    } catch (error) {
      console.error("Delete failed:", error);
      setMessage("Could not connect to the backend.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8FA] p-8">
        <p className="text-[#52606D]">
          Loading announcement...
        </p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[#F6F8FA] p-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/feeds"
            className="mb-4 inline-block font-medium text-[#1E3A5F]"
          >
            ← Back to Feeds
          </Link>

          <p className="text-[#52606D]">
            Announcement not found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F8FA] p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/feeds"
          className="mb-6 inline-block font-medium text-[#1E3A5F]"
        >
          ← Back to Feeds
        </Link>

        {message && (
          <div className="mb-6 rounded-lg border border-[#D9E1E8] bg-white p-3">
            <p className="text-sm text-[#52606D]">
              {message}
            </p>
          </div>
        )}

        {!isEditing ? (
          <div className="rounded-xl border border-[#D9E1E8] bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-[#172033]">
              {post.title}
            </h1>

            <p className="mt-2 text-sm text-[#52606D]">
              {new Date(post.createdAt).toLocaleDateString()} ·
              Posted by {post.author}
            </p>

            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="mt-6 w-full max-w-2xl rounded-lg"
              />
            )}

            <p className="mt-6 whitespace-pre-wrap text-[#172033]">
              {post.content}
            </p>

            {authenticated && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-[#1E3A5F] px-4 py-2 font-medium text-white hover:bg-[#172E4D]"
                >
                  Edit Announcement
                </button>

                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800"
                >
                  Delete Announcement
                </button>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSave}
            className="flex max-w-2xl flex-col gap-4 rounded-xl border border-[#D9E1E8] bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-[#172033]">
              Edit Announcement
            </h2>

            <label className="flex flex-col gap-1 text-[#172033]">
              Title
              <input
                type="text"
                value={editTitle}
                onChange={(event) =>
                  setEditTitle(event.target.value)
                }
                required
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Posted by
              <input
                type="text"
                value={editAuthor}
                onChange={(event) =>
                  setEditAuthor(event.target.value)
                }
                required
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Summary
              <input
                type="text"
                value={editSummary}
                onChange={(event) =>
                  setEditSummary(event.target.value)
                }
                required
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Full content
              <textarea
                value={editContent}
                onChange={(event) =>
                  setEditContent(event.target.value)
                }
                required
                rows={6}
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-[#172033]">
              Image URL (optional)
              <input
                type="url"
                value={editImageUrl}
                onChange={(event) =>
                  setEditImageUrl(event.target.value)
                }
                className="rounded-lg border border-[#D9E1E8] p-2"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-[#1E3A5F] px-4 py-2 font-medium text-white hover:bg-[#172E4D]"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-[#E2E8F0] px-4 py-2 font-medium text-[#172033] hover:bg-[#CBD5E1]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}