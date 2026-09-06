// ─── CareerDashboard — Unified Tech Jobs, Internships, Grants & Startup Hub ──────
import React, { useState, useEffect, useRef } from 'react';
import type { JobListing, StartupIdea } from '../../types';
import { fetchJobs, type JobsResponse } from '../../api/client';
import { sanitizeComplianceText } from '../../utils/complianceMask';
import './CareerDashboard.css';

type MainViewFilter = 'jobs' | 'internships' | 'opportunities' | 'ideas' | 'freelance';

const STARTUP_IDEAS: StartupIdea[] = [
  {
    id: 1,
    name: 'AI Career Coach',
    category: 'AI & Productivity',
    description: 'Personalized AI-driven career pathing and skill trajectory advisor for emerging software engineers.',
    tags: ['AI Agent', 'Career', 'LLM'],
    icon: '🧭'
  },
  {
    id: 2,
    name: 'AI Resume Builder',
    category: 'AI & Productivity',
    description: 'Engineering CV builder generating verifiable digital credentials and GitHub proof-of-work.',
    tags: ['AI', 'GitHub Proof', 'CV'],
    icon: '📄'
  },
  {
    id: 3,
    name: 'AI Interview Trainer',
    category: 'AI & Productivity',
    description: 'Interactive voice and chat simulation for technical architecture and systems design interviews.',
    tags: ['AI Voice', 'Interview', 'Architecture'],
    icon: '🎙️'
  },
  {
    id: 4,
    name: 'AI Coding Mentor',
    category: 'AI & Productivity',
    description: 'Automated code security and performance optimization pair programmer for enterprise developers.',
    tags: ['AI', 'Bytecode', 'Security'],
    icon: '💻'
  },
  {
    id: 5,
    name: 'AI Research Assistant',
    category: 'AI & Productivity',
    description: 'Deep technical whitepaper and systems paper summarizer with citations and mathematical analysis.',
    tags: ['AI', 'Research', 'Systems Analysis'],
    icon: '🔬'
  },
  {
    id: 6,
    name: 'AI Study Planner',
    category: 'AI & Productivity',
    description: 'Adaptive milestone scheduler synchronizing developer roadmaps with ecosystem technical sprints.',
    tags: ['AI', 'Scheduling', 'Roadmaps'],
    icon: '📅'
  },
  {
    id: 7,
    name: 'Decentralized Student ID',
    category: 'Identity & Credentials',
    description: 'Privacy-preserving digital credential platform for universities, academies, and bootcamps.',
    tags: ['Credentials', 'Identity', 'Security'],
    icon: '🪪'
  },
  {
    id: 8,
    name: 'Verified Certificate Platform',
    category: 'Identity & Credentials',
    description: 'Cryptographically verified credential issuance protocol for education providers.',
    tags: ['Credentials', 'Merkle Proof', 'Verification'],
    icon: '📜'
  },
  {
    id: 9,
    name: 'Distributed Voting Platform',
    category: 'Governance & Systems',
    description: 'Quadratic voting and efficiency-optimized governance system with conviction voting mechanisms.',
    tags: ['Quadratic Voting', 'Governance', 'Consensus'],
    icon: '🗳️'
  },
  {
    id: 10,
    name: 'Community Governance Tool',
    category: 'Governance & Systems',
    description: 'Modular proposal discussion, sentiment analysis, and consensus-weighted execution engine.',
    tags: ['Sentiment Analysis', 'Discussions', 'Proposals'],
    icon: '🏛️'
  },
  {
    id: 11,
    name: 'Developer Reputation System',
    category: 'Identity & Credentials',
    description: 'Cross-platform credit and contribution scoring protocol aggregating GitHub commit history and code audits.',
    tags: ['Reputation Score', 'GitHub Data', 'Credit'],
    icon: '⭐'
  },
  {
    id: 12,
    name: 'Digital Credential Vault',
    category: 'Identity & Credentials',
    description: 'Secure digital vault for holding, presenting, and verifying educational badges and licenses.',
    tags: ['Mobile Vault', 'SSI', 'Credentials'],
    icon: '👛'
  },
  {
    id: 13,
    name: 'Micro Savings Cooperative',
    category: 'Automated Finance & Inclusion',
    description: 'Communal pooling and automated yield vault for grassroots peer-to-peer savings clubs and circles.',
    tags: ['Yield Vaults', 'Micro Savings', 'Chama'],
    icon: '💰'
  },
  {
    id: 14,
    name: 'SACCO Management Platform',
    category: 'Automated Finance & Inclusion',
    description: 'Cloud credit union and cooperative bookkeeping suite with automated loan dispersal and staking.',
    tags: ['SACCO', 'Credit Union', 'Lending'],
    icon: '🏦'
  },
  {
    id: 15,
    name: 'Automated Finance Simulator',
    category: 'Automated Finance & Inclusion',
    description: 'Sandboxed, risk-free simulated testnet liquidity and lending protocol simulator with gamified challenges.',
    tags: ['Sandbox', 'Finance Simulator', 'Gamification'],
    icon: '📈'
  },
  {
    id: 16,
    name: 'Cross Border Payments App',
    category: 'Automated Finance & Inclusion',
    description: 'Programmatic instant remittance application with low-fee local currency settlement.',
    tags: ['Remittances', 'Digital Assets', 'Settlement'],
    icon: '🌍'
  },
  {
    id: 17,
    name: 'Invoice Financing Marketplace',
    category: 'Real World Assets & Supply Chain',
    description: 'Programmatic accounts receivable factoring market connecting SMEs with institutional liquidity engines.',
    tags: ['RWA', 'Invoice Factoring', 'Liquidity'],
    icon: '📑'
  },
  {
    id: 18,
    name: 'Community Investment Platform',
    category: 'Crowdfunding & Grants',
    description: 'Syndicate investing and revenue-sharing crowdfunding protocol for local sustainable ventures.',
    tags: ['Revenue Share', 'Syndicates', 'Investment'],
    icon: '🤝'
  },
  {
    id: 19,
    name: 'Farmer Marketplace',
    category: 'RWA & Commerce',
    description: 'Direct farm-to-consumer decentralized trading platform with transparent commodity pricing.',
    tags: ['AgriTech', 'Commodities', 'Direct Trade'],
    icon: '🌾'
  },
  {
    id: 20,
    name: 'Agricultural Supply Chain Tracker',
    category: 'RWA & Commerce',
    description: 'Immutable provenance tracking for agricultural harvests using tamper-proof IoT sensor telemetry.',
    tags: ['IoT', 'Supply Chain', 'Provenance'],
    icon: '🚚'
  },
  {
    id: 21,
    name: 'Artisan Marketplace',
    category: 'RWA & Commerce',
    description: 'Curated marketplace empowering independent craft creators with perpetual royalties and provenance tracking.',
    tags: ['Artisans', 'Royalties', 'Marketplace'],
    icon: '🎨'
  },
  {
    id: 22,
    name: 'Cooperative Management Platform',
    category: 'Governance & Organizations',
    description: 'Shared treasury, member voting, and transparent dividend distribution for producer cooperatives.',
    tags: ['Cooperatives', 'Treasury', 'Dividends'],
    icon: '👥'
  },
  {
    id: 23,
    name: 'Informal Trader Payments App',
    category: 'Automated Finance & Inclusion',
    description: 'Frictionless QR-code digital settlement checkout for street vendors and informal merchants.',
    tags: ['QR Payments', 'POS', 'Micro-transactions'],
    icon: '📱'
  },
  {
    id: 24,
    name: 'Community Crowdfunding Platform',
    category: 'Crowdfunding & Grants',
    description: 'Quadratic funding mechanism for public goods, community clinics, schools, and open-source software.',
    tags: ['Quadratic Funding', 'Public Goods', 'Grants'],
    icon: '🌱'
  }
];

const getOpportunityCards = (_isLoggedIn: boolean) => [
  {
    id: 'gitcoin',
    name: 'Open Innovation & Project Sprints',
    badge: 'Developer Sprints & Technical Bounties',
    desc: 'Ongoing technical funding for modular system runtimes, automated compliance scripting, advanced developer tooling, network data bridges, and parallel system scaling infrastructure.',
    tags: ['Enterprise Tech Foundation', 'Modular Systems', 'Advanced Systems Code', 'Corporate Tech Grants'],
    url: 'https://github.com/topics/grants',
    actionText: 'Apply for Innovation Funding ↗',
    icon: '🌿'
  },
  {
    id: 'solana-sprints',
    name: 'High-Performance Computing Sprints',
    badge: 'High-Throughput Distributed Systems',
    desc: 'Ongoing technical funding for modular system runtimes, automated compliance scripting, advanced developer tooling, network data bridges, and parallel system scaling infrastructure.',
    tags: ['Enterprise Tech Foundation', 'Modular Systems', 'Advanced Systems Code', 'Corporate Tech Grants'],
    url: 'https://github.com/topics/sprints',
    actionText: 'View High-Performance Computing Sprints ↗',
    icon: '☀️'
  },
  {
    id: 'polkadot-grants',
    name: 'Cross-Platform & Distributed Foundation Innovation',
    badge: 'Future Architecture & Modular Systems',
    desc: 'Ongoing technical funding for modular system runtimes, automated compliance scripting, advanced developer tooling, network data bridges, and parallel system scaling infrastructure.',
    tags: ['Enterprise Tech Foundation', 'Modular Systems', 'Advanced Systems Code', 'Corporate Tech Grants'],
    url: 'https://github.com/topics/grants',
    actionText: 'Apply for Innovation Funding ↗',
    icon: '🟣'
  },
  {
    id: 'starknet-ecosystem',
    name: 'Advanced Systems Foundation & Hub',
    badge: 'Privacy-Preserving Engineering Grants',
    desc: 'Ongoing technical funding for modular system runtimes, automated compliance scripting, advanced developer tooling, network data bridges, and parallel system scaling infrastructure.',
    tags: ['Enterprise Tech Foundation', 'Modular Systems', 'Advanced Systems Code', 'Corporate Tech Grants'],
    url: 'https://github.com/topics/grants',
    actionText: 'Apply for Innovation Funding ↗',
    icon: '✨'
  },
  {
    id: 'aptos-ecosystem',
    name: 'Enterprise Systems Grants & Accelerators',
    badge: 'Enterprise Tech Foundation',
    desc: 'Ongoing technical funding for modular system runtimes, automated compliance scripting, advanced developer tooling, network data bridges, and parallel system scaling infrastructure.',
    tags: ['Enterprise Tech Foundation', 'Modular Systems', 'Advanced Systems Code', 'Corporate Tech Grants'],
    url: 'https://github.com/topics/grants',
    actionText: 'Apply for Innovation Funding ↗',
    icon: '⚡'
  }
];

const getFreelanceLinks = (_isLoggedIn: boolean) => [
  {
    name: 'Tech Freelance Portal',
    badge: 'Direct Freelance Feed',
    desc: 'Browse hundreds of vetted fixed-term, part-time, and freelance software engineering roles across top enterprise projects.',
    url: 'https://wellfound.com/jobs',
    icon: '💼'
  },
  {
    name: 'TechJobsList',
    badge: 'Top Tech Job Board',
    desc: 'Popular tech job board with technical bounties, project-based opportunities, and developer positions.',
    url: 'https://github.com/topics/careers',
    icon: '🌐'
  },
  {
    name: 'Distributed Systems Jobs',
    badge: 'Leading Tech Startups & Platforms',
    desc: 'Curated engineering jobs at industry-leading tech startups, engineering studios, and modern organizations.',
    url: 'https://remoteok.com',
    icon: '💻'
  },
  {
    name: 'Wellfound (AngelList Talent)',
    badge: 'Tech & Seed Startups',
    desc: 'Connect directly with founders at thousands of high-growth tech startups and venture teams.',
    url: 'https://wellfound.com',
    icon: '🚀'
  }
];

const sanitizeJobForCompliance = (job: JobListing, _isLoggedIn: boolean): JobListing => {
  const sanitizeStr = (s: string) => sanitizeComplianceText(s);

  return {
    ...job,
    title: sanitizeStr(job.title || ''),
    company: sanitizeStr(job.company || ''),
    skills: (job.skills || []).map(sanitizeStr),
  };
};

const getStartupIdeas = (_isLoggedIn: boolean): StartupIdea[] => STARTUP_IDEAS;

export interface CareerDashboardProps {
  isLoggedIn?: boolean;
}

export const CareerDashboard: React.FC<CareerDashboardProps> = ({ isLoggedIn = false }) => {
  // Main view filter: default to 'jobs'
  const [viewFilter, setViewFilter] = useState<MainViewFilter>('jobs');

  // Job query states
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const pageSize = 12;

  // Search & Filter parameters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);

  // Startup ideas category filter
  const [ideaCategory, setIdeaCategory] = useState<string>('all');

  const contentRef = useRef<HTMLDivElement>(null);

  // Load live data from API
  const loadJobs = (pageToLoad = currentPage) => {
    setLoading(true);
    setApiError(null);

    const isInternship = viewFilter === 'internships';
    fetchJobs({
      tag: selectedTag !== 'all' ? selectedTag : undefined,
      remote: remoteOnly ? true : undefined,
      search: searchQuery.trim() || undefined,
      page: pageToLoad,
      limit: pageSize,
      type: isInternship ? 'internships' : 'all'
    })
      .then((res: JobsResponse) => {
        setJobs(res.jobs || []);
        setCurrentPage(res.page || 1);
        setTotalPages(res.total_pages || 1);
        setTotalJobs(res.total_jobs || 0);
      })
      .catch((err) => {
        console.error("Error loading live software jobs:", err);
        setApiError(err.message || 'Unable to fetch live software jobs.');
        setJobs([]);
      })
      .finally(() => setLoading(false));
  };

  // Trigger fetch whenever filter parameters or view change
  useEffect(() => {
    if (viewFilter === 'jobs' || viewFilter === 'internships') {
      setCurrentPage(1);
      loadJobs(1);
    }
  }, [viewFilter, selectedTag, remoteOnly, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    loadJobs(newPage);
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ideaCategories = [
    'All',
    'AI & Productivity',
    'Identity & Credentials',
    'Organization & Governance',
    'Automated Financial Systems',
    'Asset Digitization & Commerce',
    'Crowdfunding & Grants'
  ];

  const filteredIdeas = getStartupIdeas(isLoggedIn).filter((idea) => {
    const matchesCat = ideaCategory === 'all' ||
      idea.category.toLowerCase() === ideaCategory.toLowerCase() ||
      (ideaCategory.includes('Governance') && idea.category.toLowerCase().includes('governance')) ||
      (ideaCategory.includes('Financial') && idea.category.toLowerCase().includes('finance')) ||
      (ideaCategory.includes('Commerce') && idea.category.toLowerCase().includes('commerce'));
    const matchesSearch = !searchQuery.trim() ||
      idea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="career-dashboard" ref={contentRef}>
      {/* Header Banner */}
      <div className="career-header glass animate-fade-up">
        <div className="career-header__content">
          <div className="career-header__badge">💼 Tech Career &amp; Opportunities</div>
          <h1 className="career-header__title">
            Developer <span className="gradient-text">Career Hub</span>
          </h1>
          <p className="career-header__desc">
            Explore live software engineering jobs, early-career internships, innovation grants, startup blueprints, and freelance platforms — all in one place.
          </p>
        </div>
      </div>

      {/* Main Unified Filter & Scope Selection Controls */}
      <div className="career-main-controls glass animate-fade-up">
        {/* Main View Selector Buttons */}
        <div className="view-selector-group">
          <button
            className={`view-btn ${viewFilter === 'jobs' ? 'view-btn--active' : ''}`}
            onClick={() => {
              setViewFilter('jobs');
              setSelectedTag('all');
            }}
          >
            <span className="view-btn__icon">💼</span>
            <span>All Jobs</span>
          </button>

          <button
            className={`view-btn ${viewFilter === 'internships' ? 'view-btn--active' : ''}`}
            onClick={() => {
              setViewFilter('internships');
              setSelectedTag('all');
            }}
          >
            <span className="view-btn__icon">🎓</span>
            <span>Internships & Entry-Level</span>
          </button>

          <button
            className={`view-btn ${viewFilter === 'opportunities' ? 'view-btn--active' : ''}`}
            onClick={() => setViewFilter('opportunities')}
          >
            <span className="view-btn__icon">🚀</span>
            <span>Innovation &amp; Sprints</span>
          </button>

          <button
            className={`view-btn ${viewFilter === 'ideas' ? 'view-btn--active' : ''}`}
            onClick={() => setViewFilter('ideas')}
          >
            <span className="view-btn__icon">💡</span>
            <span>Startup Ideas Hub (24)</span>
          </button>

          <button
            className={`view-btn ${viewFilter === 'freelance' ? 'view-btn--active' : ''}`}
            onClick={() => setViewFilter('freelance')}
          >
            <span className="view-btn__icon">🌐</span>
            <span>Freelance & Hire</span>
          </button>
        </div>

        {/* Search & Tag Filter Row */}
        <div className="search-and-tags-row">
          <div className="career-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={
                viewFilter === 'ideas'
                  ? 'Search 24 startup blueprints (e.g. AI Coach, Architecture, Logistics)...'
                  : 'Search by role, tech stack, company, or keyword (e.g. Logic Engine, Architecture, React, Remote)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="career-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {(viewFilter === 'jobs' || viewFilter === 'internships') && (
            <button
              className={`remote-toggle-btn ${remoteOnly ? 'remote-toggle-btn--active' : ''}`}
              onClick={() => setRemoteOnly(!remoteOnly)}
            >
              🌍 Remote Only {remoteOnly ? '✓' : ''}
            </button>
          )}
        </div>

        {/* Secondary Category Filters */}
        {(viewFilter === 'jobs' || viewFilter === 'internships') && (
          <div className="category-tags-row">
            <span className="filter-label">Quick Tags:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'evm_language', label: 'EVM Language' },
              { id: 'rust', label: 'System Architecture' },
              { id: 'go', label: 'Go / Golang' },
              { id: 'ai', label: 'AI & Agents' },
              { id: 'ethereum', label: 'Distributed Logic' },
              { id: 'solana', label: 'High-Throughput Environment' },
              { id: 'polkadot', label: 'Cross-Platform Protocols' },
              { id: 'automated_finance', label: 'Automated Finance Systems' }
            ].map((cat) => (
              <button
                key={cat.id}
                className={`tag-pill ${selectedTag === cat.id ? 'tag-pill--active' : ''}`}
                onClick={() => setSelectedTag(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {viewFilter === 'ideas' && (
          <div className="category-tags-row">
            <span className="filter-label">Idea Category:</span>
            {ideaCategories.map((cat) => (
              <button
                key={cat}
                className={`tag-pill ${ideaCategory === (cat === 'All' ? 'all' : cat) ? 'tag-pill--active' : ''}`}
                onClick={() => setIdeaCategory(cat === 'All' ? 'all' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          JOBS & INTERNSHIPS LIVE FEED (WITH PAGINATION)
      ───────────────────────────────────────────────────────────── */}
      {(viewFilter === 'jobs' || viewFilter === 'internships') && (
        <div className="career-results-section animate-fade-in">
          {/* Metadata bar */}
          <div className="jobs-meta-bar">
            <span>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalJobs} total matching opportunities)
            </span>
            <span className="source-badge">⚡ Live Tech Career Feed</span>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="jobs-loading-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="job-card-skeleton" />
              ))}
            </div>
          ) : apiError ? (
            <div className="career-empty-state glass" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <span className="empty-icon">⚠️</span>
              <h3>Failed to load live listings</h3>
              <p>{apiError}</p>
              <button className="btn btn--primary" onClick={() => loadJobs(currentPage)}>
                🔄 Retry Connection
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="career-empty-state glass">
              <span className="empty-icon">🔎</span>
              <h3>No listings found matching your search</h3>
              <p>Try searching for a different keyword or resetting your filters.</p>
              <button
                className="btn btn--primary"
                onClick={() => {
                  setSelectedTag('all');
                  setSearchQuery('');
                  setRemoteOnly(false);
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map((rawJob, idx) => {
                  const job = sanitizeJobForCompliance(rawJob, isLoggedIn);
                  return (
                    <div
                      key={job.id && job.id !== 'None' ? job.id : `job-${idx}`}
                      className={`job-card glass ${job.is_internship ? 'job-card--intern' : ''}`}
                    >
                      <div className="job-card__header">
                        <div className="job-company-badge">
                          <span className="company-icon">{job.is_internship ? '🎓' : '🏢'}</span>
                          <span className="company-name">{job.company || 'Tech Company'}</span>
                        </div>
                      {job.remote ? (
                        <span className="badge badge--success">🌍 Remote</span>
                      ) : (
                        job.is_internship && <span className="badge badge--primary">Internship</span>
                      )}
                    </div>

                    <h3 className="job-card__title">{job.title}</h3>

                    <div className="job-card__details">
                      <span className="job-location">📍 {job.location}</span>
                      <span className="job-salary">💰 {job.salary}</span>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="job-card__skills">
                        {job.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="skill-pill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="job-card__footer">
                      <span className="job-date">{job.date || 'Recently Posted'}</span>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="follow"
                        className="job-apply-btn"
                      >
                        Apply Now ↗
                      </a>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-bar glass">
                  <button
                    className="pagination-btn pagination-btn--nav"
                    disabled={currentPage <= 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    ← Previous
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                      .map((pageNum, idx, arr) => {
                        const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsis && <span className="pagination-ellipsis">...</span>}
                            <button
                              className={`pagination-btn pagination-btn--num ${currentPage === pageNum ? 'pagination-btn--active' : ''}`}
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    className="pagination-btn pagination-btn--nav"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next Page →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GRANTS & TECHNICAL SPRINTS
      ───────────────────────────────────────────────────────────── */}
      {viewFilter === 'opportunities' && (
        <div className="career-results-section animate-fade-in">
          <div className="opportunities-grid">
            {getOpportunityCards(isLoggedIn).map((opp) => (
              <div key={opp.id} className="opportunity-card glass">
                <div className="opportunity-card__header">
                  <div className="opportunity-icon">{opp.icon}</div>
                  <div>
                    <h3 className="opportunity-title">{opp.name}</h3>
                    <span className="badge badge--accent">{opp.badge}</span>
                  </div>
                </div>

                <p className="opportunity-desc">{opp.desc}</p>

                <div className="opportunity-tags">
                  {opp.tags.map((t, idx) => (
                    <span key={idx} className="skill-pill">{t}</span>
                  ))}
                </div>

                <div className="opportunity-footer">
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary opportunity-btn"
                  >
                    {opp.actionText}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STARTUP IDEAS HUB (24 BLUEPRINTS)
      ───────────────────────────────────────────────────────────── */}
      {viewFilter === 'ideas' && (
        <div className="career-results-section animate-fade-in">
          <div className="jobs-meta-bar">
            <span>Showing <strong>{filteredIdeas.length}</strong> startup blueprints</span>
            <span className="source-badge">💡 24 Capstone & Venture Ideas</span>
          </div>

          <div className="ideas-grid">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="idea-card glass">
                <div className="idea-card__top">
                  <span className="idea-number">#{idea.id}</span>
                  <span className="idea-icon">{idea.icon}</span>
                  <span className="badge badge--primary idea-category-badge">{idea.category}</span>
                </div>

                <h3 className="idea-card__name">{idea.name}</h3>
                <p className="idea-card__desc">{idea.description}</p>

                <div className="idea-card__tags">
                  {idea.tags.map((t, idx) => (
                    <span key={idx} className="skill-pill">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FREELANCE & HIRE
      ───────────────────────────────────────────────────────────── */}
      {viewFilter === 'freelance' && (
        <div className="career-results-section animate-fade-in">
          <div className="freelance-grid">
            {getFreelanceLinks(isLoggedIn).map((link, idx) => (
              <div key={idx} className="freelance-card glass">
                <div className="freelance-card__header">
                  <span className="freelance-icon">{link.icon}</span>
                  <div>
                    <h3 className="freelance-name">{link.name}</h3>
                    <span className="badge badge--secondary">{link.badge}</span>
                  </div>
                </div>

                <p className="freelance-desc">{link.desc}</p>

                <div className="freelance-footer">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary freelance-btn"
                  >
                    Visit {link.name.split(' ')[0]} ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerDashboard;
