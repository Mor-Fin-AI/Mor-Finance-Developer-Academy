import React, { useState } from 'react';
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
  const [showStudentGateway, setShowStudentGateway] = useState(false);

  return (
    <div className="landing-page">
      {/* Background ambient light */}
      <div className="landing-bg-glow" />

      {/* Hero section */}
      <section className="landing-hero animate-fade-up">
        <div className="landing-logo">
          <img src="/mor-logo.png" alt="MOR Developer Academy Logo" className="landing-logo__img" />
          <h1 className="landing-logo__title">
            MOR <span className="gradient-text">ACADEMY</span>
          </h1>
        </div>

        {/* Official Brand Title Banner */}
        <div className="landing-brand-banner-container">
          <img
            src="/mor-brand-banner.png"
            alt="MOR Developer Academy - Code. Crypto. Build The Future."
            className="landing-brand-banner"
          />
        </div>

        <span className="landing-badge">OFFICIAL WEB3 DEVELOPER ACADEMY</span>

        <h2 className="landing-hero__title">
          Master <span className="gradient-text">Web3 Engineering &amp; Smart Contract Architecture</span>
        </h2>
        <p className="landing-hero__desc">
          The premier developer academy for <strong>Web3 Engineering &amp; Multi-Chain Architecture</strong>. Master <strong>Solidity, Rust, Cairo, Move, and ink!</strong>, build decentralized applications (dApps), compile live in the <strong>Multi-Chain Web3 Sandbox</strong> with <strong>OpenClaw &amp; Hermes AI Mentors</strong>, and earn verified on-chain developer certifications.
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
                🚀 Launch Web3 Developer Portal
              </button>
            </div>
            
            <div className="landing-cta-buttons">
              <button className="btn btn--secondary landing-login-btn" onClick={onLoginGitHub}>
                🐱 Continue with GitHub SSO
              </button>
              <button className="btn btn--secondary landing-login-btn" onClick={onLoginWallet}>
                🦊 Connect Web3 Wallet
              </button>
              <button
                className="btn btn--secondary landing-login-btn"
                onClick={() => setShowStudentGateway(true)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  borderColor: 'rgba(148, 163, 184, 0.3)',
                }}
              >
                🔐 Student &amp; Developer Gateway
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
          <span className="landing-nav-label">Explore Educational Modules:</span>
          <div className="landing-hero-links">
            <button className="landing-link-pill" onClick={onLoginGitHub}>
              <span>📚</span> Curriculum
            </button>
            <button className="landing-link-pill" onClick={onLoginGitHub}>
              <span>🤖</span> AI Mentor
            </button>
            <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer" className="landing-link-pill">
              <span>💬</span> Community
            </a>
            <button className="landing-link-pill" onClick={onLoginGitHub}>
              <span>⚔️</span> Coding Challenges
            </button>
            <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer" className="landing-link-pill">
              <span>🐙</span> GitHub
            </a>
          </div>
        </div>

        {/* Prominent Trust Header Links */}
        <div className="landing-trust-bar">
          <span className="trust-bar-title">ACADEMIC TRUST &amp; COMMUNITY HUB</span>
          <div className="trust-links">
            <a href="https://github.com/Mor-Fin-AI" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>🐙</span> GitHub Repos
            </a>
            <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>💬</span> Developer Forum
            </a>
            <a href="mailto:john@morfinance.ai" className="trust-link" style={{ color: '#60a5fa' }}>
              <span>✉️</span> Academic Inquiries
            </a>
            <a href="mailto:admin@morfinance.ai" className="trust-link" style={{ color: '#c084fc' }}>
              <span>✉️</span> Administration
            </a>
            <a href="https://github.com/Mor-Fin-AI/Mor-Finance-Developer-Academy#readme" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>📖</span> Syllabus &amp; Docs
            </a>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="landing-features">
        <h3 className="landing-section-title">Everything You Need to Master Web3</h3>
        <p className="landing-section-subtitle">
          From Solidity fundamentals to advanced Multi-Chain scaling and ZK protocols.
        </p>

        <div className="landing-grid">
          {[
            {
              icon: '📚',
              title: 'Structured Multichain Curriculum',
              desc: 'From cryptographic primitives to Solidity, Rust Anchor, Move, Cairo, and ink!. 7 complete levels with interactive quizzes.',
            },
            {
              icon: '🤖',
              title: 'OpenClaw & Hermes AI Mentors',
              desc: '24/7 AI pair programming with OpenClaw for curriculum guidance and Hermes for automated smart contract auditing & code reviews.',
            },
            {
              icon: '💻',
              title: 'Multi-Chain Sandbox IDE',
              desc: 'Write, compile, and deploy Solidity, Rust (Stylus & Anchor), Cairo 2.0, Move, and ink! in an interactive browser IDE.',
            },
            {
              icon: '🏆',
              title: 'On-Chain Verifiable Certifications',
              desc: 'Earn cryptographic certificates and build proof-of-work credentials recognized across Web3 foundations.',
            },
            {
              icon: '⚔️',
              title: 'Hackathons & Bounties',
              desc: 'Participate in real-time hackathons, build innovative dApps, and win bounties directly from leading protocols.',
            },
            {
              icon: '💼',
              title: 'Web3 Career Portal',
              desc: 'Access curated smart contract jobs, paid internships, and foundation grants across top blockchain ecosystems.',
            },
          ].map((feat) => (
            <div key={feat.title} className="landing-card glass">
              <div className="landing-card__icon">{feat.icon}</div>
              <h4 className="landing-card__title">{feat.title}</h4>
              <p className="landing-card__desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Multi-Chain Ecosystems section */}
      <section className="landing-ecosystems animate-fade-up">
        <h3 className="landing-section-title">Supported Blockchain Ecosystems</h3>
        <p className="landing-section-subtitle">
          Dedicated tracks, smart contract compilers, and sandbox testnets for the leading Layer 1 and Layer 2 networks.
        </p>

        <div className="landing-ecosystem-grid">
          {[
            { name: 'Ethereum', desc: 'Layer 1 settlement and EVM standard. Solidity, Hardhat, Foundry, and OpenZeppelin smart contracts.', icon: '🔷' },
            { name: 'Arbitrum', desc: 'L2 Optimistic Rollup & Stylus WASM with Rust / C++. Deploy high-throughput dApps at ultra-low gas.', icon: '🌀' },
            { name: 'Optimism', desc: 'OP Stack Superchain & Cross-Domain Rollup messaging connecting inter-operable Ethereum L2s.', icon: '🔴' },
            { name: 'Base', desc: 'Coinbase L2, OnchainKit, Smart Wallets, and Gasless Paymasters for seamless user onboarding.', icon: '🔵' },
            { name: 'Polygon', desc: 'Polygon PoS, CDK (Chain Development Kit), Plonky2 ZK verifiers, and zkEVM rollups.', icon: '💜' },
            { name: 'Solana', desc: 'High-throughput Sealevel runtime, Proof-of-History, and Rust Anchor smart contract framework.', icon: '☀️' },
            { name: 'Starknet', desc: 'ZK-Rollup validity proofs, Cairo 2.0 smart contracts, and native Account Abstraction.', icon: '✨' },
            { name: 'Aptos', desc: 'MoveVM safe memory execution, resource accounts, and parallel transaction engine.', icon: '⚡' },
            { name: 'Polkadot', desc: 'Heterogeneous multi-chain framework connecting Substrate parachains with ink! Rust.', icon: '🟣' }
          ].map((eco) => (
            <div key={eco.name} className="landing-ecosystem-card glass">
              <div className="landing-ecosystem-icon">{eco.icon}</div>
              <h4 className="landing-ecosystem-name">{eco.name}</h4>
              <p className="landing-ecosystem-desc">{eco.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Architecture */}
      <section className="landing-stats animate-fade-up glass">
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">2026</div>
          <div className="landing-stat-label">Founded &amp; Launched</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">11+</div>
          <div className="landing-stat-label">Multi-Chain Tracks</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">WASM &amp; EVM</div>
          <div className="landing-stat-label">Multi-Runtime Compilers</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">Live</div>
          <div className="landing-stat-label">OpenClaw &amp; Hermes Mentors</div>
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
        <p>© 2026 Morfinance AI. 66 Paul Street, London, EC2A 4NA. All rights reserved. | Official Web3 Developer Academy</p>
      </footer>

      {/* Secure Student & Developer Gateway Modal */}
      {showStudentGateway && (
        <div
          className="student-gateway-overlay"
          onClick={() => setShowStudentGateway(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 3, 7, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="student-gateway-modal glass animate-fade-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '36px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(10, 15, 30, 0.95)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setShowStudentGateway(false)}
              aria-label="Close Gateway"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Student &amp; Developer Gateway
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '28px' }}>
              Authentication portal for enrolled university students, researchers, and Web3 smart contract engineers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn btn--primary"
                onClick={() => {
                  setShowStudentGateway(false);
                  onLoginGitHub();
                }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <span>🐱</span> Continue with GitHub Student SSO
              </button>

              <button
                className="btn btn--secondary"
                onClick={() => {
                  setShowStudentGateway(false);
                  onLoginWallet();
                }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  color: '#93c5fd',
                }}
              >
                <span>🦊</span> Connect Web3 Wallet (MetaMask / EIP-1193)
              </button>

              {onOpenFastTrack && (
                <button
                  className="btn btn--secondary"
                  onClick={() => {
                    setShowStudentGateway(false);
                    onOpenFastTrack();
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                  }}
                >
                  <span>🎓</span> Kenyatta Univ Fast-Track Routing
                </button>
              )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#64748b' }}>
              🔒 Protected by Cryptographic Signatures &amp; Verified SSO
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
