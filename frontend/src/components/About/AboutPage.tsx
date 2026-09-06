import React, { useState } from 'react';
import FastTrackEnrollmentModal from '../Auth/FastTrackEnrollmentModal';
import './AboutPage.css';

export interface AboutPageProps {
  isLoggedIn?: boolean;
}

export const AboutPage: React.FC<AboutPageProps> = ({ isLoggedIn = false }) => {
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  return (
    <div className="about-page glass animate-fade-in">
      {/* Header */}
      <div className="about-header">
        <span className="about-badge">ABOUT MOR ACADEMY</span>
        <h2 className="about-page__title">Empowering the Next Generation of Distributed Systems &amp; Software Engineers</h2>
        <p className="about-page__desc">
          Building an enterprise developer education platform for Distributed Ledger Programming &amp; Advanced Data Architectures. We bridge structured learning, live AI Mentors, real-world algorithmic compilation, and verified software contributions.
        </p>
      </div>

      {/* Factual Milestones & Platform Facts */}
      <div className="about-stats-grid">
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">8+ Runtimes</div>
          <div className="about-stat-label">Supported Distributed Runtimes</div>
        </div>
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">2026</div>
          <div className="about-stat-label">Academy Launched</div>
        </div>
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">Multi-Runtime</div>
          <div className="about-stat-label">Ecosystem Learning Tracks</div>
        </div>
        <div className="about-stat-card glass">
          <div className="about-stat-number gradient-text">Live</div>
          <div className="about-stat-label">OpenClaw & Hermes AI Mentors</div>
        </div>
      </div>

      {/* ─── University Web3 Onboarding Placeholder & Gateway ─────────────────── */}
      <div className="about-university-section glass">
        <div className="about-university-badge">
          <span>🏛️ INSTITUTIONAL ACADEMIC INITIATIVE</span>
        </div>
        <div className="about-university-content">
          <div className="about-university-text">
            <h3 className="about-university-title">
              University Software Engineering Onboarding Program
            </h3>
            <p className="about-university-desc">
              Turnkey academic infrastructure empowering university computer science departments, student developer clubs, and distributed systems research groups. Featuring frictionless 1-click GitHub SSO cohort routing, multi-runtime compiler sandboxes, and automated grant telemetry.
            </p>
          </div>
          <div className="about-university-actions">
            <button
              type="button"
              className="about-enroll-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEnrollModalOpen(true);
              }}
            >
              <span>⚡ Fast-Track Student Onboarding</span>
            </button>
            <a
              href="mailto:admin@morfinance.ai?subject=University%20Cohort%20Partnership%20Application"
              className="about-partner-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span>🏛️ Partner Your University</span>
            </a>
          </div>
        </div>

        {/* Institutional Highlight Cards */}
        <div className="about-university-grid">
          <div className="about-uni-feature-card">
            <div className="about-uni-feature-icon">⚡</div>
            <h4>Frictionless GitHub SSO</h4>
            <p>1-click onboarding automatically maps students into designated institutional cohorts with 0 manual forms.</p>
          </div>
          <div className="about-uni-feature-card">
            <div className="about-uni-feature-icon">💻</div>
            <h4>8 Multi-Runtime Sandboxes</h4>
            <p>Hands-on compilation in Arbitrum Stylus (Rust), Base, Optimism, Solana, Aptos Move, Starknet, and ink!.</p>
          </div>
          <div className="about-uni-feature-card">
            <div className="about-uni-feature-icon">📊</div>
            <h4>Programmatic Grant Telemetry</h4>
            <p>Real-time tracking of code completion, execution efficiency, and verified project milestones.</p>
          </div>
          <div className="about-uni-feature-card">
            <div className="about-uni-feature-icon">🏆</div>
            <h4>Verified Developer Credentials</h4>
            <p>Verifiable digital developer credentials issued directly upon project milestone completion and code verification.</p>
          </div>
        </div>

        <div className="about-university-footer">
          <div className="about-university-pill">
            🏛️ Active Pilot Cohort: <strong>Kenyatta University</strong> (<code>KU_COHORT_2026_01</code>)
          </div>
          <div className="about-university-status">
            <span className="status-dot"></span> Verified Academic Track • Target Grants Ready
          </div>
        </div>
      </div>

      {/* Fast-Track Enrollment Modal */}
      <FastTrackEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        university="Kenyatta University"
        cohortId="KU_COHORT_2026_01"
      />

      <div className="about-divider" />

      {/* Mission & Focus Grid */}
      <div className="about-page__grid">
        <div className="about-card glass">
          <div className="about-card__icon">🌐</div>
          <h3 className="about-card__title">Open-Source Mission</h3>
          <p className="about-card__text">
            Building a distributed systems education ecosystem designed to onboard, educate, and certify high-caliber software architects through open-source innovation.
          </p>
        </div>

        <div className="about-card glass">
          <div className="about-card__icon">🎯</div>
          <h3 className="about-card__title">Current Focus</h3>
          <p className="about-card__text">
            Developer Academy, AI Mentors (OpenClaw & Hermes), Community Forum, Technical Sprints, and active Open-Source System Contributions.
          </p>
        </div>

        <div className="about-card glass">
          <div className="about-card__icon">⬡</div>
          <h3 className="about-card__title">Supported Cloud Environments</h3>
          <p className="about-card__text">
            Modern object-oriented database layers, high-scale execution environments, fault-proof networks, parallel processing protocol clusters, high-throughput distributed architectures, and hands-on developer infrastructure testing labs.
          </p>
        </div>
      </div>

      <div className="about-divider" />

      {/* Roadmap & Milestones Timeline */}
      <div className="about-section-header">
        <h3 className="about-section-title">Actual Strategic Roadmap</h3>
        <p className="about-section-sub">Our official execution timeline for building high-performance distributed enterprise software infrastructure.</p>
      </div>

      <div className="about-roadmap-grid">
        {[
          {
            phase: '2026 Q1 & Q2',
            status: 'COMPLETED',
            title: 'Full Development of Academy & Developer Onboarding',
            desc: 'Core platform development, interactive learning tracks, software architecture compiler sandboxes, and developer onboarding workflows.'
          },
          {
            phase: '2026 Q3',
            status: 'COMPLETED',
            title: 'Developer Course Certification Expansion',
            desc: 'Expansion of verifiable developer credentials, certificates, and specialized course tracks for MOR ecosystem engineers.'
          },
          {
            phase: '2026 Q3',
            status: 'COMPLETED',
            title: 'Distributed Infrastructure Learning Tracks',
            desc: 'Dedicated ecosystem learning tracks launched across modern object-oriented database layers, high-scale execution environments, fault-proof networks, parallel processing protocol clusters, high-throughput distributed architectures, and hands-on developer infrastructure testing labs.'
          },
          {
            phase: '2026 Q4',
            status: 'IN PROGRESS',
            title: 'AI-Powered Protocol Services & Developer Tooling',
            desc: 'Advanced AI code auditing, automated performance optimization, and protocol integration services for enterprise developers.'
          },
          {
            phase: '2027',
            status: 'UPCOMING',
            title: 'Enterprise Infrastructure & Global Community Expansion',
            desc: 'Deploying enterprise developer training, cryptographic credential verification, and global distributed software engineering community expansion.'
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
        <h3 className="about-section-title">Core Contributors &amp; Engineering Team</h3>
        <p className="about-section-sub">Built by core distributed systems architects, AI researchers, and software engineering educators.</p>
      </div>

      <div className="about-team-grid">
        {[
          { name: 'MOR Platform Architecture Team', role: 'Distributed Systems & Security Leads', bio: 'Oversees software architecture, algorithmic verification, concurrency safety, and system security.', icon: '⬡' },
          { name: 'AI Engineering Group', role: 'OpenClaw & Hermes AI Lead', bio: 'Designs context-aware OpenClaw & Hermes AI agents for live code reviews, syntax verification, and automated evaluations.', icon: '🤖' },
          { name: 'Community Operations', role: 'Developer Relations & Academics', bio: `Manages developer bounties, Discord community office hours, ${isLoggedIn ? 'hackathons' : 'technical sprints'}, and cohort workshops.`, icon: '🌐' }
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
              <p>
                {isLoggedIn
                  ? 'Explore open-source smart contract templates, submit PRs, and review protocol code.'
                  : 'Explore open-source software architecture templates, submit PRs, and review protocol code.'}
              </p>
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
          For inquiries regarding developer certifications, Academy onboarding, technical support, or partnership opportunities, contact our team:
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

      {/* Company & Registered Office Details */}
      <div className="about-company-section glass" style={{ marginTop: '24px', padding: '24px', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(10, 11, 23, 0.45)' }}>
        <h3 className="about-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '12px' }}>
          <span>🏛️</span> Company Details & Registered Office
        </h3>
        <div style={{ color: 'var(--clr-text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
          <strong style={{ color: '#fff', fontSize: '1.05rem', display: 'block', marginBottom: '6px' }}>Morfinance AI</strong>
          <div>66 Paul Street</div>
          <div>London</div>
          <div>EC2A 4NA</div>
          <div style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>United Kingdom</div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

