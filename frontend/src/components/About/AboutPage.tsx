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
          The MOR Finance Developer Academy bridges structured education, real-world Solidity compilation, and verified open-source contributions across the Web3 ecosystem.
        </p>
      </div>

      {/* Grid: Mission, Infrastructure, Governance */}
      <div className="about-page__grid">
        <div className="about-card glass">
          <div className="about-card__icon">🚀</div>
          <h3 className="about-card__title">Our Mission</h3>
          <p className="about-card__text">
            To accelerate decentralized technology by onboarding, educating, and certifying high-caliber smart contract developers. Through interactive EVM sandboxes, 24/7 AI Code Mentors, and on-chain progress tracking, we turn programmers into battle-tested protocol architects.
          </p>
        </div>

        <div className="about-card glass">
          <div className="about-card__icon">🛡️</div>
          <h3 className="about-card__title">Smart Contract Security</h3>
          <p className="about-card__text">
            Security is paramount in Web3. Our curriculum covers Automated Market Makers (AMMs), reentrancy prevention via Checks-Effects-Interactions (CEI), gas-optimized storage slots, and MOR protocol staking and vault architectures.
          </p>
        </div>

        <div className="about-card glass">
          <div className="about-card__icon">⬡</div>
          <h3 className="about-card__title">DeFi Ecosystem Grants</h3>
          <p className="about-card__text">
            Top graduates of the MOR Finance Developer Academy receive direct access to hackathon bounties, open-source organization repository access, and ecosystem grant funding to launch their own decentralized protocols.
          </p>
        </div>
      </div>

      <div className="about-divider" />

      {/* Roadmap & Milestones Timeline */}
      <div className="about-section-header">
        <h3 className="about-section-title">Ecosystem Roadmap & Platform Milestones</h3>
        <p className="about-section-sub">Our strategic execution timeline for scaling developer infrastructure.</p>
      </div>

      <div className="about-roadmap-grid">
        {[
          {
            phase: 'Q1 2026',
            status: 'COMPLETED',
            title: 'Core EVM & Solidity Curriculum Launch',
            desc: 'Released 6 structured learning levels covering Ethereum, Arbitrum, Optimism, Polygon, and Base. Deployed on-chain XP verification system.'
          },
          {
            phase: 'Q2 2026',
            status: 'COMPLETED',
            title: '24/7 AI Mentor & Compiler Engine',
            desc: 'Integrated real-time Solidity syntax assistance, gas optimization analysis, and compiler error resolution powered by Claude & OpenClaw AI.'
          },
          {
            phase: 'Q3 2026',
            status: 'IN PROGRESS',
            title: 'MOR Vault & Staking Protocol Bounties',
            desc: 'Launching interactive MOR Finance protocol labs, yield vault security challenges, and automated hackathon evaluation pipelines.'
          },
          {
            phase: 'Q4 2026',
            status: 'UPCOMING',
            title: 'Decentralized Grant DAO & Developer Network',
            desc: 'Transitioning curriculum governance to Academy DAO token holders and distributing direct grant funding for top-performing builders.'
          }
        ].map((item) => (
          <div key={item.phase} className={`roadmap-phase-card glass ${item.status.toLowerCase().replace(' ', '-')}`}>
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
          { name: 'Anjanay Raina', role: 'Lead Platform Engineer & Architect', bio: 'Specializes in EVM compiler sandboxes, full-stack Web3 architecture, and MOR protocol integration.', icon: '⚡' },
          { name: 'MOR Protocol Team', role: 'Smart Contract & Audit Leads', bio: 'Oversees MOR Vault contracts, yield mechanics, reentrancy audits, and protocol security.', icon: '⬡' },
          { name: 'AI Engineering Group', role: 'AI Compiler & Mentor Lead', bio: 'Designs context-aware LLM agents for live Solidity code reviews and automated quiz evaluations.', icon: '🤖' },
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
    </div>
  );
};

export default AboutPage;
