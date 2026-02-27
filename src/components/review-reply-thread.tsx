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
  helpfulCount: number;
  viewerHasHelpfulVote: boolean;
};

type ReplyApiPayload = {
  ok?: boolean;
  error?: string;
  reply?: ReviewReplyViewModel;
};

type ReplyHelpfulApiPayload = {
  ok?: boolean;
  error?: string;
  voted?: boolean;
  count?: number;
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
  initialReplyHelpfulCountByReplyId: Map<string, number>;
  initialCurrentUserHelpfulReplyIds: Set<string>;
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

function replyChevronSvg() {
  return (
    <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ReviewReplyThread(props: ReviewReplyThreadProps) {
  const [replies, setReplies] = useState(() =>
    props.initialReplies.map((reply) => ({
      ...reply,
      helpfulCount: props.initialReplyHelpfulCountByReplyId.get(reply.id) ?? reply.helpfulCount,
      viewerHasHelpfulVote:
        props.initialCurrentUserHelpfulReplyIds.has(reply.id) || reply.viewerHasHelpfulVote,
    })),
  );
  const [pending, setPending] = useState(false);
  const [pendingHelpfulReplyIds, setPendingHelpfulReplyIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [threadOpen, setThreadOpen] = useState(Boolean(props.initiallyOpen));
  const [rootBody, setRootBody] = useState("");
  const [activeReplyTargetId, setActiveReplyTargetId] = useState<string | null>(null);
  const [activeEditTargetId, setActiveEditTargetId] = useState<string | null>(null);

  const repliesByParent = useMemo(() => buildReplyMap(replies), [replies]);
  const replyById = useMemo(() => {
    const map = new Map<string, ReviewReplyViewModel>();
    for (const reply of replies) {
      map.set(reply.id, reply);
    }
    return map;
  }, [replies]);
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
      helpfulCount: 0,
      viewerHasHelpfulVote: false,
    };

    setError(null);
    setThreadOpen(true);
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
        current.map((reply) =>
          reply.id === optimisticReply.id
            ? {
                ...payload.reply!,
                helpfulCount: payload.reply!.helpfulCount ?? optimisticReply.helpfulCount,
                viewerHasHelpfulVote:
                  payload.reply!.viewerHasHelpfulVote ?? optimisticReply.viewerHasHelpfulVote,
              }
            : reply,
        ),
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
        current.map((reply) =>
          reply.id === replyId
            ? {
                ...payload.reply!,
                helpfulCount: reply.helpfulCount,
                viewerHasHelpfulVote: reply.viewerHasHelpfulVote,
              }
            : reply,
        ),
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

  async function toggleReplyHelpful(replyId: string) {
    if (pendingHelpfulReplyIds.has(replyId)) {
      return;
    }

    const previousReply = replies.find((entry) => entry.id === replyId);
    if (!previousReply) {
      return;
    }

    const nextVoted = !previousReply.viewerHasHelpfulVote;
    const nextCount = Math.max(0, previousReply.helpfulCount + (nextVoted ? 1 : -1));

    setReplies((current) =>
      current.map((reply) =>
        reply.id === replyId
          ? {
              ...reply,
              viewerHasHelpfulVote: nextVoted,
              helpfulCount: nextCount,
            }
          : reply,
      ),
    );
    setPendingHelpfulReplyIds((current) => new Set(current).add(replyId));

    try {
      const response = await fetch("/api/replies/helpful", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ replyId }),
      });
      const payload = (await response.json()) as ReplyHelpfulApiPayload;
      if (!response.ok || payload.ok !== true) {
        throw new Error(payload.error ?? "Unable to update helpful vote.");
      }

      setReplies((current) =>
        current.map((reply) =>
          reply.id === replyId
            ? {
                ...reply,
                viewerHasHelpfulVote: payload.voted ?? nextVoted,
                helpfulCount: payload.count ?? nextCount,
              }
            : reply,
        ),
      );
    } catch {
      setReplies((current) =>
        current.map((reply) =>
          reply.id === replyId
            ? {
                ...reply,
                viewerHasHelpfulVote: previousReply.viewerHasHelpfulVote,
                helpfulCount: previousReply.helpfulCount,
              }
            : reply,
        ),
      );
    } finally {
      setPendingHelpfulReplyIds((current) => {
        const next = new Set(current);
        next.delete(replyId);
        return next;
      });
    }
  }

  function renderReplyTree(parentReplyId: string | null): ReactNode {
    const rows = repliesByParent.get(parentReplyId) ?? [];

    return rows.map((reply) => {
      const replyComposerOpen = activeReplyTargetId === reply.id;
      const editComposerOpen = activeEditTargetId === reply.id;
      const replyTargetName = reply.parentReplyId
        ? replyById.get(reply.parentReplyId)?.authorName ?? null
        : null;

      return (
        <article className="reply-item" id={`reply-${reply.id}`} key={reply.id}>
          {replyTargetName ? (
            <div className="reply-to">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 14l-4-4 4-4" />
                <path d="M5 10h11a4 4 0 0 1 4 4v1" />
              </svg>
              Replying to <span className="reply-to-name">@{replyTargetName}</span>
            </div>
          ) : null}

          <div className="reply-item-header">
            <div className="reply-author-section">
              <div className="reply-avatar">
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
              <div>
                <div className="reply-author-name">{reply.authorName}</div>
                <div className="reply-meta">
                  <span>{formatReplyDate(reply.createdAt)}</span>
                </div>
              </div>
            </div>

            {reply.userId === props.currentUserId ? (
              <div className="reply-action-group">
                <button
                  className="reply-action-btn reply-edit-btn"
                  onClick={() => {
                    setActiveEditTargetId((current) => (current === reply.id ? null : reply.id));
                    setActiveReplyTargetId(null);
                  }}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="reply-action-btn reply-delete-btn"
                  onClick={() => {
                    void deleteReply(reply.id);
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>

          <p className="reply-body">{reply.body}</p>

          <div className="reply-actions">
            <button
              className={`reply-helpful-btn ${reply.viewerHasHelpfulVote ? "voted" : ""}`}
              disabled={pendingHelpfulReplyIds.has(reply.id)}
              onClick={() => {
                void toggleReplyHelpful(reply.id);
              }}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{reply.helpfulCount}</span>
            </button>
            <button
              className="reply-action-btn"
              onClick={() => {
                setActiveReplyTargetId((current) => (current === reply.id ? null : reply.id));
                setActiveEditTargetId(null);
              }}
              type="button"
            >
              {replyComposerOpen ? "Close" : "Reply"}
            </button>
          </div>

          {replyComposerOpen ? (
            <form
              className="reply-inline-form"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const body = String(formData.get("body") ?? "");
                void createReply(body, reply.id);
                event.currentTarget.reset();
              }}
            >
              <textarea name="body" rows={2} maxLength={2000} placeholder="Write a reply..." />
              <div className="reply-inline-actions">
                <button className="btn btn-ghost btn-sm" type="submit">
                  Post Reply
                </button>
              </div>
            </form>
          ) : null}

          {editComposerOpen ? (
            <form
              className="reply-inline-form"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const body = String(formData.get("body") ?? "");
                void updateReply(reply.id, body);
              }}
            >
              <textarea name="body" rows={2} maxLength={2000} defaultValue={reply.body} />
              <div className="reply-inline-actions">
                <button className="btn btn-ghost btn-sm" type="submit">
                  Save
                </button>
              </div>
            </form>
          ) : null}

          {renderReplyTree(reply.id)}
        </article>
      );
    });
  }

  const toggleLabel = rootReplyCount > 0 ? `${rootReplyCount} replies` : "Add reply";

  return (
    <section className="review-thread-shell">
      <button
        className={`reply-toggle ${threadOpen ? "expanded" : ""}`}
        onClick={() => {
          setThreadOpen((current) => !current);
          setActiveReplyTargetId(null);
          setActiveEditTargetId(null);
        }}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {toggleLabel}
        {replyChevronSvg()}
      </button>

      <div className={`replies-section ${threadOpen ? "open" : ""}`}>
        <div className="replies-list">{renderReplyTree(null)}</div>
        <form
          className="reply-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void createReply(rootBody, null);
            setRootBody("");
          }}
        >
          <textarea
            className="reply-composer-input"
            name="body"
            rows={3}
            maxLength={2000}
            placeholder={rootReplyCount > 0 ? "Write a reply..." : "Be the first to reply..."}
            value={rootBody}
            onChange={(event) => {
              setRootBody(event.target.value);
            }}
          />
          <div className="reply-composer-actions">
            <span className="reply-composer-hint">
              {error ? error : "Your reply will be visible to everyone"}
            </span>
            <div className="reply-composer-buttons">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setRootBody("");
                }}
                type="button"
              >
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" disabled={pending} type="submit">
                Post Reply
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
