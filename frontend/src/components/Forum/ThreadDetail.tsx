import React from 'react';
import type { ForumThread } from '../../types';

const getAuthorBadge = (author: string) => {
  const name = author.toLowerCase();
  if (name.includes('mor_academy') || name.includes('admin') || name.includes('staff') || name.includes('academy')) {
    return { text: 'Academy Staff', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)' };
  }
  if (name.includes('mentor') || name.includes('openclaw') || name.includes('hermes')) {
    return { text: 'AI Mentor', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
  }
  return { text: 'Student Builder', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' };
};

interface ThreadDetailProps {
  thread: ForumThread;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handlePostReply: (e: React.FormEvent) => void;
  onBack: () => void;
  formatAuthor: (author: string) => string;
  getCategoryColor: (cat: string) => string;
  currentUserId?: string;
  onDeleteThread?: (threadId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const ThreadDetail: React.FC<ThreadDetailProps> = ({
  thread,
  replyContent,
  setReplyContent,
  handlePostReply,
  onBack,
  formatAuthor,
  getCategoryColor,
  currentUserId,
  onDeleteThread,
  onDeleteComment,
}) => {
  return (
    <div className="thread-view-container">
      <div className="thread-view-header">
        <button className="btn btn--text back-btn" onClick={onBack}>
          ← Back to Forum
        </button>
      </div>

      <div className="thread-main-card glass">
        <div className="thread-card-header">
          <span
            className="thread-item__badge"
            style={{ backgroundColor: getCategoryColor(thread.category) }}
          >
            {thread.category}
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginTop: '8px', marginBottom: '8px' }}>
            <h1 className="thread-detail-title" style={{ margin: 0, flex: 1 }}>{thread.title}</h1>
            {thread.author === currentUserId && onDeleteThread && (
              <button
                className="forum-delete-btn"
                onClick={() => onDeleteThread(thread.thread_id)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  color: '#f87171',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                  e.currentTarget.style.color = '#f87171';
                }}
              >
                🗑️ Delete Thread
              </button>
            )}
          </div>
          <div className="thread-meta-info">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Posted by <strong>{formatAuthor(thread.author)}</strong>
              {(() => {
                const badge = getAuthorBadge(thread.author);
                return (
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    color: badge.color,
                    backgroundColor: badge.bg,
                    border: badge.border,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {badge.text}
                  </span>
                );
              })()}
            </span>
            <span>•</span>
            <span>{new Date(thread.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="thread-detail-content">
          {thread.content}
        </div>

        <div className="thread-detail-tags">
          {thread.tags.map(t => (
            <span key={t} className="thread-tag">#{t}</span>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div className="comments-section">
        <h3 className="comments-title">Replies ({thread.replies_count})</h3>

        <div className="comments-list">
          {thread.comments.map((comment) => (
            <div key={comment.comment_id} className="comment-card glass" style={{ position: 'relative' }}>
              <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="comment-author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {formatAuthor(comment.author)}
                    {(() => {
                      const badge = getAuthorBadge(comment.author);
                      return (
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          color: badge.color,
                          backgroundColor: badge.bg,
                          border: badge.border,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {badge.text}
                        </span>
                      );
                    })()}
                  </span>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                {comment.author === currentUserId && onDeleteComment && (
                  <button
                    className="forum-delete-btn"
                    onClick={() => onDeleteComment(comment.comment_id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      color: 'var(--clr-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.color = '#f87171';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'var(--clr-text-muted)';
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
              <div className="comment-body">
                {comment.content}
              </div>
            </div>
          ))}
        </div>

        {/* Post comment reply */}
        <form className="comment-reply-form glass" onSubmit={handlePostReply}>
          <h4 className="reply-form-title">Reply to this thread</h4>
          <textarea
            placeholder="Write your reply here..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="reply-textarea"
            rows={4}
            required
          />
          <button type="submit" className="btn btn--primary reply-submit-btn">
            Reply
          </button>
        </form>
      </div>
    </div>
  );
};
