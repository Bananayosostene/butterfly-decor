"use client";

import type React from "react";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export type ItemComment = { id: string; name: string; text: string; createdAt: string };

const MAX_NAME = 40;
const MAX_TEXT = 500;
const NAME_KEY = "butterfly-comment-name";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function ItemComments({
  itemId,
  initialComments,
  initialCount,
  canModerate,
  onChange,
}: {
  itemId: string;
  initialComments: ItemComment[];
  initialCount: number;
  canModerate: boolean;
  /** Reports the new list and total after a post or delete, so the gallery remembers them. */
  onChange: (comments: ItemComment[], count: number) => void;
}) {
  const [comments, setComments] = useState(initialComments);
  const [count, setCount] = useState(initialCount);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const update = (nextComments: ItemComment[], nextCount: number) => {
    setComments(nextComments);
    setCount(nextCount);
    onChange(nextComments, nextCount);
  };

  // Remember the visitor's name between comments so they only type it once.
  const restoreName = () => {
    if (!name) setName(localStorage.getItem(NAME_KEY) ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || posting) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch(`/api/collection-items/${itemId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Could not post your comment.");
        return;
      }
      localStorage.setItem(NAME_KEY, name.trim());
      update([json.data, ...comments], count + 1);
      setText("");
    } catch {
      setError("Could not post your comment. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    const res = await fetch(`/api/collection-items/${itemId}/comments?commentId=${commentId}`, { method: "DELETE" });
    if (!res.ok) return;
    update(comments.filter((c) => c.id !== commentId), Math.max(0, count - 1));
  };

  return (
    <section id="comments" className="mt-6 pt-5 border-t" style={{ borderColor: "var(--card-border)" }}>
      <h2 className="text-base font-semibold" style={{ color: "var(--primary)" }}>
        Comments <span className="font-normal" style={{ color: "var(--muted-foreground)" }}>({count})</span>
      </h2>

      <form onSubmit={handleSubmit} className="mt-3 rounded-2xl p-3 space-y-2" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={restoreName}
          maxLength={MAX_NAME}
          placeholder="Your name"
          className="w-full px-3 py-2 rounded-lg text-sm bg-background text-foreground border border-border outline-none focus:border-primary"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={restoreName}
          maxLength={MAX_TEXT}
          rows={2}
          placeholder="Share what you think about this…"
          className="w-full px-3 py-2 rounded-lg text-sm bg-background text-foreground border border-border outline-none focus:border-primary resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs" style={{ color: error ? "#b91c1c" : "var(--muted-foreground)" }}>
            {error || `${text.length}/${MAX_TEXT}`}
          </p>
          <button
            type="submit"
            disabled={posting || !name.trim() || !text.trim()}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold uppercase"
                style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                aria-hidden
              >
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{c.name}</p>
                  <p className="text-xs shrink-0" style={{ color: "var(--muted-foreground)" }}>{formatDate(c.createdAt)}</p>
                  {canModerate && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      aria-label="Delete comment"
                      className="ml-auto shrink-0 text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line break-words" style={{ color: "var(--muted-foreground)" }}>
                  {c.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {count > comments.length && (
        <p className="mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          Showing the latest {comments.length} of {count} comments.
        </p>
      )}
    </section>
  );
}
