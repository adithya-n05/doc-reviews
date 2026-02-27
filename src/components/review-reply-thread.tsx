"use client";

import { useMemo, useState, type ReactNode } from "react";

export type ReviewReplyViewModel = {
  id: string;
  userId: string;
  reviewId: string;
  parentReplyId: string | null;
  body: string;
  createdAt: string;
  authorName: string;
  authorInitials: string;
  authorEmail: string;
  authorAvatarUrl: string | null;
};

type ReplyApiPayload = {
  ok?: boolean;
  error?: string;
  reply?: ReviewReplyViewModel;
};

type ReviewReplyThreadProps = {
  moduleCode: string;
  reviewId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  currentUserInitials: string;
  currentUserAvatarUrl: string | null;
  initialReplies: ReviewReplyViewModel[];
  initiallyOpen?: boolean;
};

function formatReplyDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function buildReplyMap(replies: ReviewReplyViewModel[]): Map<string | null, ReviewReplyViewModel[]> {
  const map = new Map<string | null, ReviewReplyViewModel[]>();
  for (const reply of replies) {
    const parentId = reply.parentReplyId ?? null;
    map.set(parentId, [...(map.get(parentId) ?? []), reply]);
  }
  return map;
}

function removeReplyTree(
  replies: ReviewReplyViewModel[],
  replyId: string,
): ReviewReplyViewModel[] {
  const descendantIds = new Set<string>([replyId]);
  let cursor = 0;
  const queue = [replyId];

  while (cursor < queue.length) {
    const current = queue[cursor];
    cursor += 1;
    for (const reply of replies) {
      if (reply.parentReplyId === current && !descendantIds.has(reply.id)) {
        descendantIds.add(reply.id);
        queue.push(reply.id);
      }
    }
  }

  return replies.filter((reply) => !descendantIds.has(reply.id));
}

export function ReviewReplyThread(props: ReviewReplyThreadProps) {
  const [replies, setReplies] = useState(props.initialReplies);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadOpen, setThreadOpen] = useState(Boolean(props.initiallyOpen));
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeReplyTargetId, setActiveReplyTargetId] = useState<string | null>(null);
  const [activeEditTargetId, setActiveEditTargetId] = useState<string | null>(null);

  const repliesByParent = useMemo(() => buildReplyMap(replies), [replies]);
  const rootReplyCount = repliesByParent.get(null)?.length ?? 0;

  async function createReply(body: string, parentReplyId: string | null) {
    const trimmedBody = body.trim();
    if (!trimmedBody || pending) {
      return;
    }

    const optimisticReply: ReviewReplyViewModel = {
      id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      userId: props.currentUserId,
      reviewId: props.reviewId,
      parentReplyId,
      body: trimmedBody,
      createdAt: new Date().toISOString(),
      authorName: props.currentUserName,
      authorInitials: props.currentUserInitials,
      authorEmail: props.currentUserEmail,
      authorAvatarUrl: props.currentUserAvatarUrl,
    };

    setError(null);
    setThreadOpen(true);
    setComposerOpen(false);
    setActiveReplyTargetId(null);
    setReplies((current) => [...current, optimisticReply]);
    setPending(true);

    try {
      const response = await fetch("/api/replies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleCode: props.moduleCode,
          reviewId: props.reviewId,
          parentReplyId,
          body: trimmedBody,
        }),
      });
      const payload = (await response.json()) as ReplyApiPayload;
      if (!response.ok || payload.ok !== true || !payload.reply) {
        throw new Error(payload.error ?? "Unable to post reply.");
      }

      setReplies((current) =>
        current.map((reply) => (reply.id === optimisticReply.id ? payload.reply! : reply)),
      );
    } catch (replyError) {
      setReplies((current) => current.filter((reply) => reply.id !== optimisticReply.id));
      setError(replyError instanceof Error ? replyError.message : "Unable to post reply.");
    } finally {
      setPending(false);
    }
  }

  async function updateReply(replyId: string, body: string) {
    const trimmedBody = body.trim();
    if (!trimmedBody || pending) {
      return;
    }

    const previousReply = replies.find((entry) => entry.id === replyId);
    if (!previousReply) {
      return;
    }

    setError(null);
    setActiveEditTargetId(null);
    setReplies((current) =>
      current.map((reply) => (reply.id === replyId ? { ...reply, body: trimmedBody } : reply)),
    );
    setPending(true);

    try {
      const response = await fetch("/api/replies", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleCode: props.moduleCode,
          reviewId: props.reviewId,
          replyId,
          body: trimmedBody,
        }),
      });
      const payload = (await response.json()) as ReplyApiPayload;
      if (!response.ok || payload.ok !== true || !payload.reply) {
        throw new Error(payload.error ?? "Unable to update reply.");
      }

      setReplies((current) =>
        current.map((reply) => (reply.id === replyId ? payload.reply! : reply)),
      );
    } catch (replyError) {
      setReplies((current) =>
        current.map((reply) =>
          reply.id === replyId ? { ...reply, body: previousReply.body } : reply,
        ),
      );
      setError(replyError instanceof Error ? replyError.message : "Unable to update reply.");
    } finally {
      setPending(false);
    }
  }

  async function deleteReply(replyId: string) {
    if (pending) {
      return;
    }

    const snapshot = replies;
    setError(null);
    setActiveReplyTargetId(null);
    setActiveEditTargetId(null);
    setReplies((current) => removeReplyTree(current, replyId));
    setPending(true);

    try {
      const response = await fetch("/api/replies", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleCode: props.moduleCode,
          reviewId: props.reviewId,
          replyId,
        }),
      });
      const payload = (await response.json()) as ReplyApiPayload;
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error ?? "Unable to delete reply.");
      }
    } catch (replyError) {
      setReplies(snapshot);
      setError(replyError instanceof Error ? replyError.message : "Unable to delete reply.");
    } finally {
      setPending(false);
    }
  }

  function renderReplyTree(parentReplyId: string | null, depth: number): ReactNode {
    const rows = repliesByParent.get(parentReplyId) ?? [];

    return rows.map((reply) => {
      const replyComposerOpen = activeReplyTargetId === reply.id;
      const editComposerOpen = activeEditTargetId === reply.id;

      return (
        <div
          className={`review-reply ${depth > 0 ? "review-reply-child" : ""}`}
          id={`reply-${reply.id}`}
          key={reply.id}
        >
          <div className="review-reply-header">
            <div className="review-avatar review-avatar-small">
              {reply.authorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="review-avatar-photo"
                  src={reply.authorAvatarUrl}
                  alt={`${reply.authorName} avatar`}
                />
              ) : (
                reply.authorInitials
              )}
            </div>
            <div className="review-meta">
              <div className="review-author">{reply.authorName}</div>
              <div className="review-date">{formatReplyDate(reply.createdAt)}</div>
              <div className="review-email">{reply.authorEmail}</div>
            </div>
          </div>

          <p className="review-body reply-body">{reply.body}</p>

          <div className="reply-actions">
            <button
              className="btn btn-ghost btn-sm reply-btn"
              onClick={() => {
                setActiveReplyTargetId((current) => (current === reply.id ? null : reply.id));
                setActiveEditTargetId(null);
              }}
              type="button"
            >
              {replyComposerOpen ? "Close" : "Reply"}
            </button>

            {reply.userId === props.currentUserId ? (
              <>
                <button
                  className="btn btn-ghost btn-sm reply-btn"
                  onClick={() => {
                    setActiveEditTargetId((current) => (current === reply.id ? null : reply.id));
                    setActiveReplyTargetId(null);
                  }}
                  type="button"
                >
                  {editComposerOpen ? "Close" : "Edit Reply"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    void deleteReply(reply.id);
                  }}
                  type="button"
                >
                  Delete Reply
                </button>
              </>
            ) : null}
          </div>

          {replyComposerOpen ? (
            <form
              className={`reply-form ${depth > 0 ? "reply-form-nested" : ""}`}
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const body = String(formData.get("body") ?? "");
                void createReply(body, reply.id);
                event.currentTarget.reset();
              }}
            >
              <textarea
                name="body"
                rows={2}
                maxLength={2000}
                placeholder="Reply to this comment..."
              />
              <button className="btn btn-ghost btn-sm" type="submit">
                Reply
              </button>
            </form>
          ) : null}

          {editComposerOpen ? (
            <form
              className={`reply-form ${depth > 0 ? "reply-form-nested" : ""}`}
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const body = String(formData.get("body") ?? "");
                void updateReply(reply.id, body);
              }}
            >
              <textarea name="body" rows={2} maxLength={2000} defaultValue={reply.body} />
              <button className="btn btn-ghost btn-sm" type="submit">
                Save
              </button>
            </form>
          ) : null}

          {renderReplyTree(reply.id, depth + 1)}
        </div>
      );
    });
  }

  return (
    <section style={{ marginTop: "10px" }}>
      <div className="reply-actions">
        <button
          className="btn btn-ghost btn-sm reply-btn"
          onClick={() => {
            setComposerOpen((current) => !current);
            setActiveReplyTargetId(null);
            setActiveEditTargetId(null);
          }}
          type="button"
        >
          {composerOpen ? "Close" : "Reply"}
        </button>
        {error ? <span className="form-note">{error}</span> : null}
      </div>

      {composerOpen ? (
        <form
          className="reply-form"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const body = String(formData.get("body") ?? "");
            void createReply(body, null);
            event.currentTarget.reset();
          }}
        >
          <textarea
            name="body"
            rows={2}
            maxLength={2000}
            placeholder="Add a reply..."
          />
          <button className="btn btn-ghost btn-sm" type="submit">
            Reply
          </button>
        </form>
      ) : null}

      {replies.length > 0 ? (
        <details className="review-thread" open={threadOpen}>
          <summary
            className="reply-thread-btn"
            onClick={(event) => {
              event.preventDefault();
              setThreadOpen((current) => !current);
            }}
          >
            <span className="reply-thread-show">View replies ({rootReplyCount})</span>
            <span className="reply-thread-hide">Hide replies</span>
          </summary>
          <div className="review-replies">{renderReplyTree(null, 0)}</div>
        </details>
      ) : null}

    </section>
  );
}
