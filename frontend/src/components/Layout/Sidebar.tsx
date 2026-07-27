// ─── Sidebar navigation component with dynamic session displays ──────────────
import React from 'react';
import type { NavPage } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  userId: string;
  authType: 'github' | 'wallet' | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: { id: NavPage; label: string; icon: string; description: string }[] = [
  { id: 'dashboard',    label: 'My Dashboard',     icon: '📊',  description: 'Progress & XP' },
  { id: 'academy',      label: 'Developer Academy', icon: '🎓',  description: '6-level curriculum' },
  { id: 'mentor',       label: 'AI Mentor (OpenClaw)', icon: '🤖', description: 'Real-time compiler assistance' },
  { id: 'forum',        label: 'Community Forum',  icon: '💬',  description: 'Connect & discuss' },
  { id: 'hackathons',   label: 'Web3 Hackathons',  icon: '⚔️',  description: 'Build & innovate' },
  { id: 'certificates', label: 'My Certificates',  icon: '🏆',  description: 'Earned credentials' },
  { id: 'subscriptions', label: 'Subscription Plans', icon: '💎', description: 'Unlock premium features' },
  { id: 'about',        label: 'About MOR Finance', icon: 'ℹ️',  description: 'Mission & ecosystem' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  userId,
  authType,
  onLogout,
  isOpen,
  onClose,
}) => {
  const getAvatarText = () => {
    if (authType === 'github') {
      return userId.replace('gh-', '').slice(0, 2).toUpperCase();
    }
    if (authType === 'wallet') {
      return 'W3';
    }
    return 'DA';
  };

  const getFormattedName = () => {
    if (authType === 'github') {
      return `@${userId.replace('gh-', '')}`;
    }
    if (authType === 'wallet') {
      const addr = userId.replace('wallet-', '');
      if (addr.startsWith('0x') && addr.length === 42) {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
      }
      return addr;
    }
    return 'MOR Builder';
  };

  const getFormattedRole = () => {
    if (authType === 'github') return 'GitHub Learner';
    if (authType === 'wallet') return 'Web3 Architect';
    return 'Junior Dev';
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'sidebar-backdrop--open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar glass ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-brand">
            <div className="sidebar__logo-icon">⬡</div>
            <div>
              <div className="sidebar__logo-title">Developer</div>
              <div className="sidebar__logo-subtitle gradient-text">Academy</div>
            </div>
          </div>
          {onClose && (
            <button className="sidebar__close-btn" onClick={onClose} aria-label="Close navigation menu">
              ✕
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <p className="sidebar__nav-label">Navigation</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`sidebar__nav-item ${activePage === item.id ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
                if (onClose) onClose();
              }}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <div className="sidebar__nav-text">
                <span className="sidebar__nav-name">{item.label}</span>
                <span className="sidebar__nav-desc">{item.description}</span>
              </div>
              {activePage === item.id && <span className="sidebar__nav-indicator" />}
            </button>
          ))}
        </nav>

        {/* Community & Support Banner Links */}
        <div className="sidebar__discord-container">
          <a
            href="https://discord.gg/Jjt52cQEV"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar__discord-link"
            title="Join Developer Academy Discord Community"
          >
            <span className="sidebar__discord-icon">💬</span>
            <div className="sidebar__discord-text">
              <span className="sidebar__discord-title">Contact & Support</span>
              <span className="sidebar__discord-sub">Discord Community</span>
            </div>
            <span className="sidebar__discord-arrow">↗</span>
          </a>

          <div className="sidebar__sublinks">
            <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer" className="sidebar__sublink">
              <span>🐙</span> GitHub
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar__footer">
          <div className="sidebar__user-container">
            <div className="sidebar__user">
              <div className="sidebar__avatar">{getAvatarText()}</div>
              <div>
                <div className="sidebar__username" title={userId}>{getFormattedName()}</div>
                <div className="sidebar__user-role">{getFormattedRole()}</div>
              </div>
            </div>
            {authType && (
              <button
                className="sidebar__logout-btn"
                onClick={() => {
                  onLogout();
                  if (onClose) onClose();
                }}
                title="Disconnect session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
