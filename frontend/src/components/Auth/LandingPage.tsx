import React from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  onOpenFastTrack?: () => void;
  loading: boolean;
  error: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginGitHub,
  onLoginWallet,
  onOpenFastTrack,
  loading,
  error,
}) => {
  return (
    <div className="landing-page">
      {/* Background ambient light */}
      <div className="landing-bg-glow" />

      {/* Hero section */}
      <section className="landing-hero animate-fade-up">
        <div className="landing-logo">
          <img src="/mor-logo.png" alt="MOR Finance Logo" className="landing-logo__img" />
          <h1 className="landing-logo__title">
            MOR <span className="gradient-text">FINANCE</span>
          </h1>
        </div>

        {/* Official Brand Title Banner */}
        <div className="landing-brand-banner-container">
          <img
            src="/mor-brand-banner.png"
            alt="MORFINANCE DEV ACADEMY - CODE. FINANCE. BUILD THE FUTURE."
            className="landing-brand-banner"
          />
        </div>

        <span className="landing-badge">OFFICIAL DEVELOPER ACADEMY</span>

        <h2 className="landing-hero__title">
          Master Web3 Engineering with <span className="gradient-text">MOR Developer Academy</span>
        </h2>
        <p className="landing-hero__desc">
          The primary portal for smart contract developers, open-source contributors, and protocol architects. Learn Solidity, build multichain dApps, compile live with <strong>OpenClaw & Hermes AI Mentors</strong>, and earn verified credentials.
        </p>

        {loading ? (
          <div className="landing-loading">
            <div className="spinner" />
            <p>Authenticating credentials...</p>
          </div>
        ) : (
          <div className="landing-cta-container">
            {/* Fast Track Institutional Enrollment Banner CTA */}
            {onOpenFastTrack && (
              <button
                className="btn btn--primary"
                onClick={onOpenFastTrack}
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.6)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  marginBottom: '10px'
                }}
              >
                🎓 Fast Track Student Enrollment (Kenyatta Univ)
              </button>
            )}

            {/* Primary Call To Action - Enter Developer Academy */}
            <div className="landing-primary-cta">
              <button className="btn btn--secondary landing-main-cta-btn" onClick={onLoginGitHub}>
                🚀 Launch MOR Developer Academy
              </button>
            </div>
            
            <div className="landing-cta-buttons">
              <button className="btn btn--secondary landing-login-btn" onClick={onLoginGitHub}>
                🐱 Continue with GitHub
              </button>
              <button className="btn btn--secondary landing-login-btn" onClick={onLoginWallet}>
                🦊 Connect Web3 Wallet
              </button>
            </div>

            {error && (
              <div className="landing-error">
                <span>⚠️ {error}</span>
              </div>
            )}
          </div>
        )}

        {/* Primary Navigation / Direct Links Bar */}
        <div className="landing-hero-nav">
          <span className="landing-nav-label">Explore Academy Features:</span>
          <div className="landing-hero-links">
            <button className="landing-link-pill" onClick={onLoginGitHub}>
              <span>📚</span> Courses
            </button>
            <button className="landing-link-pill" onClick={onLoginGitHub}>
              <span>🤖</span> AI Mentor
            </button>
            <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer" className="landing-link-pill">
              <span>💬</span> Community
            </a>
            <button className="landing-link-pill" onClick={onLoginGitHub}>
              <span>⚔️</span> Hackathons
            </button>
            <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer" className="landing-link-pill">
              <span>🐙</span> GitHub
            </a>
          </div>
        </div>

        {/* Prominent Trust Header Links */}
        <div className="landing-trust-bar">
          <span className="trust-bar-title">TRUST & COMMUNITY HUB</span>
          <div className="trust-links">
            <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>🐙</span> GitHub Repos
            </a>
            <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>💬</span> Discord Community
            </a>
            <a href="mailto:john@morfinance.ai" className="trust-link" style={{ color: '#60a5fa' }}>
              <span>✉️</span> john@morfinance.ai
            </a>
            <a href="mailto:admin@morfinance.ai" className="trust-link" style={{ color: '#c084fc' }}>
              <span>✉️</span> admin@morfinance.ai
            </a>
            <a href="https://github.com/Mor-Fin-AI/Mor-Finance-Developer-Academy#readme" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>📖</span> Documentation
            </a>
            <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>🌐</span> Developer Forum
            </a>
          </div>
        </div>
      </section>

      {/* Built for Developers Section */}
      <section className="landing-built-devs animate-fade-up">
        <div className="landing-section-header">
          <span className="landing-badge">DEVELOPER ENGINE</span>
          <h3 className="landing-section-title">Built for Web3 Developers</h3>
          <p className="landing-section-sub">Everything you need to level up from beginner smart contract builder to protocol engineer.</p>
        </div>

        <div className="built-devs-grid">
          {[
            { icon: '📚', title: 'Interactive Courses', desc: 'Structured learning tracks covering EVM opcodes, Solidity syntax, ERC standards, and vault design.' },
            { icon: '📝', title: 'Solidity Quizzes', desc: 'Test your understanding with instant quiz evaluations and security concept checks.' },
            { icon: '💻', title: 'Coding Exercises', desc: 'Live in-browser Solidity compilation with automated test suites and line-by-line feedback.' },
            { icon: '🚀', title: 'Starter Projects', desc: 'Production-ready code templates for AMMs, staking contracts, reentrancy guards, and yield vaults.' },
            { icon: '🤖', title: 'AI Code Mentor', desc: 'Powered by OpenClaw & Hermes models for 24/7 real-time debugging and security auditing.' },
            { icon: '📊', title: 'Learning Analytics', desc: 'Track your XP, streak counters, completed levels, and verified skill badges on your profile.' },
            { icon: '💬', title: 'Community Forum', desc: 'Collaborate with fellow builders, request code reviews, and join ecosystem hackathons.' }
          ].map((item) => (
            <div key={item.title} className="built-dev-card glass">
              <div className="built-dev-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Ecosystems Section */}
      <section className="landing-ecosystems animate-fade-up">
        <div className="landing-section-header">
          <span className="landing-badge">MULTI-CHAIN INTEGRATION</span>
          <h3 className="landing-ecosystems__title">Supported Ecosystems</h3>
          <p className="landing-ecosystems__desc">Build, compile, and deploy smart contracts across leading EVM networks and high-throughput blockchains.</p>
        </div>
        
        <div className="landing-ecosystems-grid">
          {[
            { name: 'Ethereum', desc: 'The foundational Layer 1 network for decentralized smart contracts and Solidity applications.', icon: '🔷' },
            { name: 'Arbitrum', desc: 'Leading optimistic rollup providing ultra-fast execution speed and low fee transactions.', icon: '🌀' },
            { name: 'Optimism', desc: 'Scaling Ethereum via the OP Stack, powering a collective of interoperable superchains.', icon: '🔴' },
            { name: 'Base', desc: 'Secure, low-cost, builder-friendly Layer 2 network incubated by Coinbase.', icon: '🔵' },
            { name: 'Polygon', desc: 'EVM compatible sidechain and aggregates suite supporting custom layer 2 networks.', icon: '💜' },
            { name: 'Avalanche', desc: 'Subnet execution environment designed for custom assets and hyper-scalable dApps.', icon: '🔺' },
            { name: 'Solana', desc: 'High-performance blockchain optimized for sub-second confirmations and Rust programs.', icon: '☀️' },
            { name: 'Starknet', desc: 'Validity rollup scaling Ethereum with STARK cryptographic proofs and native CairoVM smart contracts.', icon: '⭐' },
            { name: 'Aptos', desc: 'High-throughput Layer 1 blockchain powered by the Move programming language and Block-STM parallel engine.', icon: '🟢' },
            { name: 'Polkadot', desc: 'Heterogeneous multi-chain framework connecting specialized Parachains with ink! Rust contracts.', icon: '🟣' }
          ].map((eco) => (
            <div key={eco.name} className="landing-ecosystem-card glass">
              <div className="landing-ecosystem-icon">{eco.icon}</div>
              <h4 className="landing-ecosystem-name">{eco.name}</h4>
              <p className="landing-ecosystem-desc">{eco.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="landing-stats animate-fade-up glass">
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">2026</div>
          <div className="landing-stat-label">Founded & Launched</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">32</div>
          <div className="landing-stat-label">Active Developers</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">10</div>
          <div className="landing-stat-label">Supported Chains</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">Live</div>
          <div className="landing-stat-label">OpenClaw & Hermes Mentors</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-links">
          <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer">Discord</a>
          <a href="https://github.com/Mor-Fin-AI/Mor-Finance-Developer-Academy#readme" target="_blank" rel="noopener noreferrer">Documentation</a>
          <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer">Community</a>
          <a href="/about">About MOR</a>
        </div>
        <p>© 2026 Morfinance AI. 66 Paul Street, London, EC2A 4NA. All rights reserved. | AI-Powered Web3 Developer Academy</p>
      </footer>
    </div>
  );
};

export default LandingPage;

