import React from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  loading: boolean;
  error: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginGitHub,
  onLoginWallet,
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
          <div className="landing-logo__icon">⬡</div>
          <h1 className="landing-logo__title">
            MOR <span className="gradient-text">FINANCE</span>
          </h1>
        </div>

        <h2 className="landing-hero__title">
          Developer <span className="gradient-text">Academy</span>
        </h2>
        <p className="landing-hero__desc">
          The official open-source smart contract & DeFi engineering hub. Master EVM mechanics, build production Solidity protocols, compile code live with 24/7 AI Mentors, and earn verified credentials across the MOR ecosystem.
        </p>

        {loading ? (
          <div className="landing-loading">
            <div className="spinner" />
            <p>Authenticating credentials...</p>
          </div>
        ) : (
          <div className="landing-cta-container">
            <div className="landing-cta-buttons">
              <button className="btn btn--primary landing-login-btn" onClick={onLoginGitHub}>
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

        {/* Quick Links / Badges bar */}
        <div className="landing-hero-links">
          <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer" className="landing-link-pill">
            <span>🐙</span> GitHub Repos
          </a>
          <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer" className="landing-link-pill">
            <span>💬</span> Discord Community
          </a>
        </div>
      </section>

      {/* Academy Core Pillars / CTAs */}
      <section className="landing-pillars animate-fade-up">
        <div className="landing-section-header">
          <span className="landing-badge">ACADEMY CAPABILITIES</span>
          <h3 className="landing-section-title">Everything You Need to Build on MOR Finance</h3>
          <p className="landing-section-sub">A structured, interactive developer platform built by engineers for engineers.</p>
        </div>

        <div className="landing-pillars-grid">
          <div className="landing-pillar-card glass">
            <div className="landing-pillar-icon">🎓</div>
            <h4>6-Level Smart Contract Curriculum</h4>
            <p>From EVM bytecode fundamentals to AMM liquidity vaults, reentrancy guards, and MOR staking protocol integration.</p>
            <button className="landing-pillar-btn" onClick={onLoginGitHub}>
              Explore Courses &rarr;
            </button>
          </div>

          <div className="landing-pillar-card glass">
            <div className="landing-pillar-icon">🤖</div>
            <h4>24/7 AI Code Mentor</h4>
            <p>Instant Solidity compiler feedback, gas optimization tips, security pattern audits, and live debugging assistance.</p>
            <button className="landing-pillar-btn" onClick={onLoginGitHub}>
              Ask AI Mentor &rarr;
            </button>
          </div>

          <div className="landing-pillar-card glass">
            <div className="landing-pillar-icon">⚔️</div>
            <h4>Web3 Hackathons & Bounties</h4>
            <p>Build real-world protocols for the MOR ecosystem, submit open-source PRs, and win developer grants.</p>
            <button className="landing-pillar-btn" onClick={onLoginGitHub}>
              View Hackathons &rarr;
            </button>
          </div>

          <div className="landing-pillar-card glass">
            <div className="landing-pillar-icon">🏆</div>
            <h4>On-Chain Verifiable Badges</h4>
            <p>Earn cryptographic certificates for every level completed, shareable across LinkedIn and GitHub developer profiles.</p>
            <button className="landing-pillar-btn" onClick={onLoginWallet}>
              Verify Credentials &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="landing-stats animate-fade-up glass">
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">6</div>
          <div className="landing-stat-label">Learning Levels</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">15+</div>
          <div className="landing-stat-label">Interactive DeFi Labs</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">100%</div>
          <div className="landing-stat-label">On-Chain Skill Verification</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">24/7</div>
          <div className="landing-stat-label">AI Compiler Mentor</div>
        </div>
      </section>

      {/* Supported Ecosystems Section */}
      <section className="landing-ecosystems animate-fade-up">
        <h3 className="landing-ecosystems__title">Multi-Chain Deployment Compatibility</h3>
        <p className="landing-ecosystems__desc">Build, compile, and deploy smart contracts across leading EVM and high-throughput chains.</p>
        
        <div className="landing-ecosystems-grid">
          {[
            { name: 'Ethereum', desc: 'The foundational Layer 1 network for decentralized smart contracts and Solidity applications.', icon: '🔷' },
            { name: 'Arbitrum', desc: 'Leading optimistic rollup providing ultra-fast execution speed and low fee transactions.', icon: '🌀' },
            { name: 'Optimism', desc: 'Scaling Ethereum via the OP Stack, powering a collective of interoperable superchains.', icon: '🔴' },
            { name: 'Polygon', desc: 'EVM compatible sidechain and aggregates suite supporting custom layer 2 networks.', icon: '💜' },
            { name: 'Base', desc: 'Secure, low-cost, builder-friendly Layer 2 network incubated by Coinbase.', icon: '🔵' },
            { name: 'Avalanche', desc: 'Subnet execution environment designed for custom assets and hyper-scalable dApps.', icon: '🔺' },
            { name: 'Solana', desc: 'High-performance blockchain optimized for sub-second confirmations and Rust programs.', icon: '☀️' }
          ].map((eco) => (
            <div key={eco.name} className="landing-ecosystem-card glass">
              <div className="landing-ecosystem-icon">{eco.icon}</div>
              <h4 className="landing-ecosystem-name">{eco.name}</h4>
              <p className="landing-ecosystem-desc">{eco.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-links">
          <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer">Discord Community</a>
          <a href="/about">About MOR</a>
        </div>
        <p>PROTECTED BY MOR IDENTITY SYSTEM • © 2026 MOR FINANCE DEVELOPER ACADEMY</p>
      </footer>
    </div>
  );
};

export default LandingPage;
