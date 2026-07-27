import React from 'react';
import './AboutPage.css';

export const AboutPage: React.FC = () => {
  return (
    <div className="about-page glass animate-fade-in">
      {/* Header */}
      <div className="about-header">
        <span className="about-badge">ABOUT MOR FINANCE</span>
        <h2 className="about-page__title">Empowering the Next Generation of Smart Contract Engineers</h2>
        <p className="about-page__desc">
          Building a multichain Web3 developer education ecosystem. We bridge structured learning, live AI Mentors, real-world Solidity compilation, and verified open-source contributions.
        </p>
      </div>

      {/* Factual Milestones & Platform Facts */}
      <div className="about-stats-grid">
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">2026</div>
          <div className="about-stat-label">Founded</div>
        </div>
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">2026</div>
          <div className="about-stat-label">Academy Launched</div>
        </div>
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">30+</div>
          <div className="about-stat-label">Developers Onboarded</div>
        </div>
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">Live</div>
          <div className="about-stat-label">OpenClaw & Hermes AI Mentors</div>
        </div>
      </div>

      <div className="about-divider" />

      {/* Mission & Focus Grid */}
      <div className="about-page__grid">
        <div className="about-card glass">
          <div className="about-card__icon">🌐</div>
          <h3 className="about-card__title">Open-Source Mission</h3>
          <p className="about-card__text">
            Building a multichain Web3 developer education ecosystem designed to onboard, educate, and certify high-caliber smart contract developers through open-source innovation.
          </p>
        </div>

        <div className="about-card glass">
          <div className="about-card__icon">🎯</div>
          <h3 className="about-card__title">Current Focus</h3>
          <p className="about-card__text">
            Developer Academy, AI Mentors (OpenClaw & Hermes), Community Forum, Hackathons, and active Open-Source Contributions.
          </p>
        </div>

        <div className="about-card glass">
          <div className="about-card__icon">⬡</div>
          <h3 className="about-card__title">Supported Ecosystems</h3>
          <p className="about-card__text">
            Ethereum, Arbitrum, Optimism, Base, Polygon, Avalanche & Solana multi-chain compatibility and hands-on developer labs.
          </p>
        </div>
      </div>

      <div className="about-divider" />

      {/* Roadmap & Milestones Timeline */}
      <div className="about-section-header">
        <h3 className="about-section-title">Actual Strategic Roadmap</h3>
        <p className="about-section-sub">Our official execution timeline for building multichain Web3 developer infrastructure.</p>
      </div>

      <div className="about-roadmap-grid">
        {[
          {
            phase: '2026 Q3',
            status: 'COMPLETED',
            title: 'Launch MOR Finance Developer Academy MVP',
            desc: 'Released core platform MVP with interactive learning tracks, smart contract compiler sandboxes, and level progress tracking.'
          },
          {
            phase: '2026 Q3',
            status: 'COMPLETED',
            title: 'AI Mentor Integration',
            desc: 'Integrated OpenClaw & Hermes AI Mentors for 24/7 real-time Solidity syntax guidance, code auditing, and debugging.'
          },
          {
            phase: '2026 Q3',
            status: 'COMPLETED',
            title: 'Community Forum & Hackathons',
            desc: 'Deployed developer community discussion forums, peer code reviews, and competitive hackathons with on-chain bounties.'
          },
          {
            phase: '2026 Q4',
            status: 'IN PROGRESS',
            title: 'Multichain Learning Tracks',
            desc: 'Expanding deep-dive tracks across Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, and Solana.'
          },
          {
            phase: '2026 Q4',
            status: 'UPCOMING',
            title: 'Ecosystem Grant Partnerships',
            desc: 'Partnering with protocol foundations and ecosystem funds to award grants to top-performing Academy graduates.'
          },
          {
            phase: '2027',
            status: 'UPCOMING',
            title: 'Developer Certifications & Enterprise Expansion',
            desc: 'Deploying cryptographic developer credentials, enterprise developer training, and global Web3 community expansion.'
          }
        ].map((item) => (
          <div key={item.phase + item.title} className={`roadmap-phase-card glass ${item.status.toLowerCase().replace(' ', '-')}`}>
            <div className="phase-badge">{item.phase} • {item.status}</div>
            <h4 className="phase-title">{item.title}</h4>
            <p className="phase-desc">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="about-divider" />

      {/* Core Team & Contributors */}
      <div className="about-section-header">
        <h3 className="about-section-title">Core Contributors & Engineering Team</h3>
        <p className="about-section-sub">Built by core smart contract architects, AI researchers, and Web3 educators.</p>
      </div>

      <div className="about-team-grid">
        {[
          { name: 'MOR Protocol Team', role: 'Smart Contract & Audit Leads', bio: 'Oversees MOR Vault contracts, yield mechanics, reentrancy audits, and protocol security.', icon: '⬡' },
          { name: 'AI Engineering Group', role: 'OpenClaw & Hermes AI Lead', bio: 'Designs context-aware OpenClaw & Hermes AI agents for live Solidity code reviews and automated evaluations.', icon: '🤖' },
          { name: 'Community Operations', role: 'Ecosystem & Developer Relations', bio: 'Manages developer bounties, Discord community office hours, hackathons, and grant allocations.', icon: '🌐' }
        ].map((member) => (
          <div key={member.name} className="team-card glass">
            <div className="team-avatar">{member.icon}</div>
            <h4 className="team-name">{member.name}</h4>
            <div className="team-role">{member.role}</div>
            <p className="team-bio">{member.bio}</p>
          </div>
        ))}
      </div>

      <div className="about-divider" />

      {/* Developer Resource Hub Links */}
      <div className="about-resources-section">
        <h3 className="about-section-title">Join the Developer Ecosystem</h3>
        <div className="about-resources-grid">
          <a
            href="https://github.com/Mor-Fin-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card glass"
          >
            <span className="resource-icon">🐙</span>
            <div>
              <h4>GitHub Repositories</h4>
              <p>Explore open-source smart contract templates, submit PRs, and review protocol code.</p>
            </div>
          </a>

          <a
            href="https://discord.gg/Jjt52cQEV"
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card glass"
          >
            <span className="resource-icon">💬</span>
            <div>
              <h4>Discord Community</h4>
              <p>Connect with fellow builders, attend weekly office hours, and get live help.</p>
            </div>
          </a>
        </div>
      </div>

      {/* Official Support Emails Section */}
      <div className="about-support-section glass" style={{ marginTop: '32px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(10, 11, 23, 0.45)' }}>
        <h3 className="about-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '8px' }}>
          <span>✉️</span> Contact & Developer Support
        </h3>
        <p className="about-section-sub" style={{ marginBottom: '16px' }}>
          For inquiries regarding developer grants, Academy onboarding, technical support, or partnership opportunities, contact our team:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <a
            href="mailto:john@morfinance.ai"
            className="btn btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '10px 18px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', borderRadius: '8px', textDecoration: 'none' }}
          >
            <span>📧</span> john@morfinance.ai
          </a>
          <a
            href="mailto:admin@morfinance.ai"
            className="btn btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', padding: '10px 18px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', borderRadius: '8px', textDecoration: 'none' }}
          >
            <span>📧</span> admin@morfinance.ai
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

