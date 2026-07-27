import React from 'react';
import type { ForumThread } from '../../types';

interface ForumListProps {
  threads: ForumThread[];
  loading: boolean;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleSelectThread: (threadId: string) => void;
  trendingTags: { tag: string; count: number }[];
  topContributors: { username: string; avatar: string; xp: number }[];
  onCreatePostClick: () => void;
  formatAuthor: (author: string) => string;
  getCategoryColor: (cat: string) => string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
}

export const ForumList: React.FC<ForumListProps> = ({
  threads,
  loading,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  handleSelectThread,
  trendingTags,
  topContributors,
  onCreatePostClick,
  formatAuthor,
  getCategoryColor,
  currentPage,
  setCurrentPage,
  totalCount,
}) => {
  const totalPages = Math.ceil(totalCount / 5) || 1;

  const categoriesRef = React.useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="forum-layout">
      <div className="forum-main">
        {/* Header Row */}
        <div className="forum-header-row">
          <div className="forum-header-row__left">
            <h2 className="forum-title">Connect with the MOR Developer Community</h2>
            <p className="forum-subtitle">Share ideas, ask questions, and build together.</p>
          </div>
          <div className="forum-header-row__right">
            <form className="forum-header-row__search-container" onSubmit={handleSearchSubmit}>
              <span className="forum-header-row__search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="forum-header-row__search-input"
              />
            </form>
            <button className="btn btn--primary" onClick={onCreatePostClick}>
              + New Post
            </button>
          </div>
        </div>

        {/* Navigation & Search Pills with Left / Right Scroll Arrows */}
        <div className="forum-nav-bar glass">
          <button
            type="button"
            className="forum-cat-scroll-arrow forum-cat-scroll-arrow--left"
            onClick={() => scrollCategories('left')}
            aria-label="Scroll categories left"
            title="Scroll Left"
          >
            ‹
          </button>

          <div className="forum-categories" ref={categoriesRef}>
            {[
              { id: 'All Topics', label: 'All Discussions' },
              { id: 'Discussion', label: 'Web3 Development' },
              { id: 'Question', label: 'Smart Contracts' },
              { id: 'Showcase', label: 'DeFi & DAOs' },
              { id: 'Help', label: 'Ecosystem & Grants' }
            ].map((cat) => (
              <button
                key={cat.id}
                className={`forum-cat-btn ${activeCategory === cat.id ? 'forum-cat-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="forum-cat-scroll-arrow forum-cat-scroll-arrow--right"
            onClick={() => scrollCategories('right')}
            aria-label="Scroll categories right"
            title="Scroll Right"
          >
            ›
          </button>
        </div>

        {/* Threads List */}
        {loading ? (
          <div className="forum-loading">
            <div className="spinner" />
            <p>Loading discussions...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="forum-empty glass">
            <p>No threads found in this category. Be the first to start a discussion!</p>
          </div>
        ) : (
          <>
            <div className="forum-threads-list">
              {threads.map((thread) => (
                <div
                  key={thread.thread_id}
                  className="thread-row-card glass"
                  onClick={() => handleSelectThread(thread.thread_id)}
                >
                  <div className="thread-row-card__avatar">
                    {thread.author.replace('gh-', '').replace('wallet-', '').slice(0, 2).toUpperCase()}
                  </div>
                  
                  <div className="thread-row-card__content">
                    <h4 className="thread-row-card__title">{thread.title}</h4>
                    
                    <div className="thread-row-card__tags">
                      <span 
                        className="thread-row-card__tag-item"
                        style={{
                          backgroundColor: `${getCategoryColor(thread.category)}15`,
                          borderColor: `${getCategoryColor(thread.category)}40`,
                          color: getCategoryColor(thread.category),
                          border: '1px solid'
                        }}
                      >
                        {thread.category}
                      </span>
                      {thread.tags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className={`thread-row-card__tag-item ${
                            idx === 0 ? 'thread-row-card__tag-item--green' : 'thread-row-card__tag-item--purple'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="thread-row-card__meta">
                      <span>{formatAuthor(thread.author)}</span>
                      <span>•</span>
                      <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="thread-row-card__metrics">
                    <span className="thread-row-card__metric-item">
                      💬 {thread.replies_count}
                    </span>
                    <span className="thread-row-card__metric-item">
                      ❤️ {thread.likes_count}
                    </span>
                    <span className="thread-row-card__metric-item">
                      👁️ {thread.views_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn btn--secondary btn--sm pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page <strong>{currentPage}</strong> of {totalPages}
                </span>
                <button
                  className="btn btn--secondary btn--sm pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar Panels */}
      <div className="forum-sidebar">
        {/* Academy Guidelines */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">Academy Guidelines</h3>
          <div style={{ marginTop: 12 }}>
            {[
              { emoji: '🤝', text: 'Be respectful and helpful.' },
              { emoji: '🔍', text: 'Search before creating a thread.' },
              { emoji: '📝', text: 'Format code blocks with syntax highlighting.' },
            ].map((g, idx) => (
              <div key={idx} className="guideline-bullet">
                <span>{g.emoji}</span>
                <span>{g.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Discord Community Panel */}
        <div className="forum-panel glass" style={{ border: '1px solid rgba(88, 101, 242, 0.3)', background: 'rgba(88, 101, 242, 0.06)' }}>
          <h3 className="forum-panel__title" style={{ color: '#7289da' }}>Discord Community</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', margin: '8px 0 14px 0', lineHeight: 1.4 }}>
            Join our active Developer Academy Discord server for live chat, office hours, and real-time developer support.
          </p>
          <a
            href="https://discord.gg/Jjt52cQEV"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', background: '#5865F2', borderColor: '#5865F2', textDecoration: 'none' }}
          >
            💬 Join Discord Server
          </a>
        </div>

        {/* Support Emails Panel */}
        <div className="forum-panel glass" style={{ border: '1px solid rgba(59, 130, 246, 0.25)', background: 'rgba(59, 130, 246, 0.04)' }}>
          <h3 className="forum-panel__title" style={{ color: '#60a5fa' }}>Email Support</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-secondary)', margin: '8px 0 10px 0', lineHeight: 1.4 }}>
            Need direct help from the MOR Finance core team? Email us anytime:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <a href="mailto:john@morfinance.ai" style={{ fontSize: '0.78rem', color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
              ✉️ john@morfinance.ai
            </a>
            <a href="mailto:admin@morfinance.ai" style={{ fontSize: '0.78rem', color: '#c084fc', textDecoration: 'none', fontWeight: 600 }}>
              ✉️ admin@morfinance.ai
            </a>
          </div>
        </div>



        {/* Trending topics */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">Trending Topics</h3>
          <div className="trending-tags">
            {trendingTags.map((tagObj, idx) => (
              <span
                key={idx}
                className="trending-tag"
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchQuery(tagObj.tag)}
              >
                #{tagObj.tag}{' '}
                <span className="trending-tag__count">
                  {tagObj.count} {tagObj.count === 1 ? 'post' : 'posts'}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">Top Contributors</h3>
          {topContributors.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginTop: 8 }}>
              No top contributors yet.
            </p>
          ) : (
            <div className="contributors-list">
              {topContributors.map((c, idx) => (
                <div key={idx} className="contributor-item">
                  <div className="contributor-avatar">{c.avatar}</div>
                  <div>
                    <div className="contributor-name">{c.username}</div>
                    <div className="contributor-xp">{c.xp.toLocaleString()} points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
