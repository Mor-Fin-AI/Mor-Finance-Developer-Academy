import React from 'react';

interface CreateThreadProps {
  newTitle: string;
  setNewTitle: (title: string) => void;
  newCategory: 'Question' | 'Discussion' | 'Showcase' | 'Help' | 'Announcement';
  setNewCategory: (cat: 'Question' | 'Discussion' | 'Showcase' | 'Help' | 'Announcement') => void;
  newContent: string;
  setNewContent: (content: string) => void;
  newTags: string;
  setNewTags: (tags: string) => void;
  handleCreatePost: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const CreateThread: React.FC<CreateThreadProps> = ({
  newTitle,
  setNewTitle,
  newCategory,
  setNewCategory,
  newContent,
  setNewContent,
  newTags,
  setNewTags,
  handleCreatePost,
  onCancel,
}) => {
  return (
    <div className="create-post-container glass animate-fade-up">
      <div className="create-post-header">
        <h2>Create a New Post</h2>
        <p>Share your question, idea, or project with the community.</p>
      </div>

      <form onSubmit={handleCreatePost} className="create-post-form">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            placeholder="What is your post about?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-select-grid">
            {[
              { id: 'Question', label: '❓ Question', desc: 'Ask a technical query or request code review' },
              { id: 'Discussion', label: '💬 Discussion', desc: 'Discuss Web3 trends, ideas, or architectural patterns' },
              { id: 'Showcase', label: '🚀 Showcase', desc: 'Share your completed project, dApp, or smart contract' },
              { id: 'Help', label: '🚨 Help', desc: 'Get assistance with compiling errors, setups, or bugs' },
              { id: 'Announcement', label: '📢 Announcement', desc: 'Broadcast platform updates, releases, or news' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-select-card ${newCategory === cat.id ? 'category-select-card--active' : ''}`}
                onClick={() => setNewCategory(cat.id as any)}
              >
                <div className="category-select-card__label">{cat.label}</div>
                <div className="category-select-card__desc">{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            placeholder="Write your post content here..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="form-textarea"
            rows={10}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g. solidity, gas, defi"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="create-post-actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Publish Post
          </button>
        </div>
      </form>
    </div>
  );
};
