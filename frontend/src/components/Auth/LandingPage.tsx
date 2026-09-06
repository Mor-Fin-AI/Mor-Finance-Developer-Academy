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
            alt="MOR Developer Academy - Code. Architecture. Build The Future."
            className="landing-brand-banner"
          />
        </div>

        <span className="landing-badge">ENTERPRISE EDTECH &amp; SOFTWARE ARCHITECTURE</span>

        <h2 className="landing-hero__title">
          Master <span className="gradient-text">Distributed Ledger Programming &amp; Advanced Data Architectures</span>
        </h2>
        <p className="landing-hero__desc">
          The enterprise educational platform for <strong>Distributed Ledger Programming &amp; Advanced Data Architectures</strong>. Master <strong>Open-Source Software Architecture &amp; Algorithmic Design</strong>, explore <strong>Automated Financial Technology Tooling &amp; SaaS Sandbox</strong> environments, compile live with <strong>OpenClaw &amp; Hermes AI Mentors</strong>, and earn verified academic credentials.
        </p>

        {loading ? (
          <div className="landing-loading">
            <div className="spinner" />
            <p>Authenticating student credentials...</p>
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
                🚀 Launch Enterprise Learning Portal
              </button>
            </div>
            
            <div className="landing-cta-buttons">
              <button className="btn btn--secondary landing-login-btn" onClick={onLoginGitHub}>
                🐱 Continue with GitHub SSO
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
            <a href="https://discord.gg/Jjt52cQEV" target="_blank" rel="noopener noreferrer" className="trust-link">
              <span>🌐</span> Student Community
            </a>
          </div>
        </div>
      </section>

      {/* Built for Developers Section */}
      <section className="landing-built-devs animate-fade-up">
        <div className="landing-section-header">
          <span className="landing-badge">ENTERPRISE SOFTWARE ENGINE</span>
          <h3 className="landing-section-title">Built for Distributed Systems &amp; Software Engineers</h3>
          <p className="landing-section-sub">Everything you need to advance from computer science fundamentals to enterprise systems architect.</p>
        </div>

        <div className="built-devs-grid">
          {[
            {
              icon: '🏛️',
              title: 'Distributed Ledger Programming',
              desc: 'Structured curriculum in Distributed Ledger Programming & Advanced Data Architectures, virtual machines, and state machines.'
            },
            {
              icon: '⚙️',
              title: 'Open-Source Architecture',
              desc: 'Hands-on practice in Open-Source Software Architecture & Algorithmic Design, modular patterns, and enterprise code quality.'
            },
            {
              icon: '📊',
              title: 'Automated FinTech Tooling',
              desc: 'Production-ready templates for Automated Financial Technology Tooling & SaaS Sandbox environments, concurrency guards, and event streaming.'
            },
            {
              icon: '📝',
              title: 'Architecture Quizzes',
              desc: 'Test your understanding with instant quiz evaluations, algorithmic concept checks, and system security reviews.'
            },
            {
              icon: '💻',
              title: 'Coding Exercises',
              desc: 'Live in-browser code compilation with automated test suites, syntax verification, and line-by-line feedback.'
            },
            {
              icon: '🤖',
              title: 'AI Code Mentor',
              desc: 'Powered by OpenClaw & Hermes models for 24/7 real-time debugging, architectural guidance, and security auditing.'
            },
            {
              icon: '📈',
              title: 'Learning Analytics',
              desc: 'Track your XP, streak counters, completed levels, and verified institutional skill badges on your student profile.'
            },
            {
              icon: '💬',
              title: 'Community Forum',
              desc: 'Collaborate with fellow builders, request peer code reviews, and join collaborative engineering sprints.'
            }
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
          <span className="landing-badge">DISTRIBUTED RUNTIMES &amp; COMPILERS</span>
          <h3 className="landing-ecosystems__title">Supported Distributed Systems</h3>
          <p className="landing-ecosystems__desc">Build, compile, and test distributed ledger software across high-performance execution environments and modern data networks.</p>
        </div>
        
        <div className="landing-ecosystems-grid">
          {[
            { name: 'Object-Oriented Logic Engine', desc: 'Foundational distributed ledger runtime for verifiable state computation and open-source applications.', icon: '🔷' },
            { name: 'Optimistic Rollup Engine', desc: 'Leading optimistic execution layer providing ultra-fast throughput and low-latency transaction processing.', icon: '🌀' },
            { name: 'Interoperable Systems Engine', desc: 'Scalable architecture powering an ecosystem of interoperable network clusters.', icon: '🔴' },
            { name: 'High-Throughput Layer-2 Engine', desc: 'Secure, low-latency, developer-friendly Layer 2 network architecture incubated by Coinbase.', icon: '🔵' },
            { name: 'Modular Distributed System Engine', desc: 'Modular distributed system and aggregation suite supporting enterprise layer 2 networks.', icon: '💜' },
            { name: 'Multi-Subnet Architecture', desc: 'Subnet execution environment designed for high-throughput enterprise architectures and modular microservices.', icon: '🔺' },
            { name: 'High-Throughput Parallel Systems Engine', desc: 'High-performance distributed network optimized for sub-second execution and Rust-based programs.', icon: '☀️' },
            { name: 'Provable Verification Engine', desc: 'Scalable execution network leveraging STARK validity proofs and high-assurance CairoVM architectures.', icon: '✨' },
            { name: 'Modular State Engine', desc: 'High-throughput distributed ledger powered by the Move programming language and Block-STM parallel engine.', icon: '🟢' },
            { name: 'Modular Micro-Consensus Engine', desc: 'Heterogeneous multi-network framework connecting specialized application chains with ink! Rust modules.', icon: '🟣' }
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
          <div className="landing-stat-value gradient-text">Multi-Runtime</div>
          <div className="landing-stat-label">Distributed Network Tracks</div>
        </div>
        <div className="landing-stat-divider" />
        <div className="landing-stat-item">
          <div className="landing-stat-value gradient-text">WASM &amp; Native</div>
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
        <p>© 2026 Morfinance AI. 66 Paul Street, London, EC2A 4NA. All rights reserved. | Enterprise EdTech &amp; Advanced Software Architectures</p>
      </footer>

      {/* Secure Student & Developer Gateway Modal (Gated Behind User Action) */}
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
              Secure authentication portal for enrolled university students, researchers, and accredited software engineers.
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

              {/* Developer Key & Key-Pair Authentication - Gated Inside Student Gateway */}
              <div style={{ margin: '12px 0 4px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  Advanced Developer Authentication
                </span>
              </div>

              <button
                className="btn btn--secondary"
                onClick={() => {
                  setShowStudentGateway(false);
                  onLoginWallet();
                }}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  color: '#93c5fd',
                }}
              >
                <span>🔑</span> Authorized Developer Key (PKI / Key-Pair Auth)
              </button>
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#64748b' }}>
              🔒 Protected by Enterprise Identity &amp; Role-Based Access Control
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

