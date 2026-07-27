import React, { useState } from 'react';
import './AnalyticsPage.css';

interface DeveloperActivityItem {
  id: string;
  name: string;
  avatar: string;
  role: 'Beginner' | 'Intermediate' | 'Advanced';
  trackId: string;
  trackName: string;
  trackIcon: string;
  activity: string;
  date: string;
  month: 'May 2026' | 'June 2026' | 'July 2026';
  badge: string;
  badgeColor: string;
}

const MOCK_DEVELOPER_ACTIVITIES: DeveloperActivityItem[] = [
  {
    id: 'dev-1',
    name: 'Alex Chen',
    avatar: '👨‍💻',
    role: 'Advanced',
    trackId: 'arbitrum',
    trackName: 'Arbitrum',
    trackIcon: '🔵',
    activity: 'Completed Arbitrum Stylus Rust Wasm Contract & Claimed Verified Credential',
    date: 'July 26, 2026',
    month: 'July 2026',
    badge: '🏆 Certified',
    badgeColor: '#a855f7'
  },
  {
    id: 'dev-2',
    name: 'Elena Rostova',
    avatar: '👩‍💻',
    role: 'Intermediate',
    trackId: 'base',
    trackName: 'Base',
    trackIcon: '🔷',
    activity: 'Deployed Coinbase Smart Wallet Paymaster dApp on Base Sepolia',
    date: 'July 25, 2026',
    month: 'July 2026',
    badge: '⚡ Deployed',
    badgeColor: '#3b82f6'
  },
  {
    id: 'dev-3',
    name: 'Marcus Vance',
    avatar: '👨‍🔬',
    role: 'Beginner',
    trackId: 'fundamentals',
    trackName: 'Fundamentals',
    trackIcon: '🌐',
    activity: 'Passed Smart Contract Architecture Quiz (100% Score) & Unlocked Level 2',
    date: 'July 24, 2026',
    month: 'July 2026',
    badge: '🎯 Passed',
    badgeColor: '#10b981'
  },
  {
    id: 'dev-4',
    name: 'Devon Wright',
    avatar: '🧑‍💻',
    role: 'Advanced',
    trackId: 'solana',
    trackName: 'Solana',
    trackIcon: '🟠',
    activity: 'Passed Anchor CPI Security Reentrancy Audit & Merged GitHub Pull Request',
    date: 'July 23, 2026',
    month: 'July 2026',
    badge: '🐙 PR Merged',
    badgeColor: '#f59e0b'
  },
  {
    id: 'dev-5',
    name: 'Sophia Patel',
    avatar: '👩‍🔬',
    role: 'Intermediate',
    trackId: 'optimism',
    trackName: 'Optimism',
    trackIcon: '🔴',
    activity: 'Built OP Stack Cross-Domain Messenger Protocol on OP Sepolia',
    date: 'July 21, 2026',
    month: 'July 2026',
    badge: '⚡ Deployed',
    badgeColor: '#ef4444'
  },
  {
    id: 'dev-6',
    name: 'Mateo Silva',
    avatar: '👨‍💼',
    role: 'Beginner',
    trackId: 'polygon',
    trackName: 'Polygon',
    trackIcon: '🟣',
    activity: 'Deployed Polygon CDK Validium Testnet Node & Configured ZK Verifier',
    date: 'July 20, 2026',
    month: 'July 2026',
    badge: '⚙️ Configured',
    badgeColor: '#8b5cf6'
  },
  {
    id: 'dev-7',
    name: 'Liam O\'Connor',
    avatar: '👨‍💻',
    role: 'Advanced',
    trackId: 'ethereum',
    trackName: 'Ethereum',
    trackIcon: '💎',
    activity: 'Completed EIP-4337 Account Abstraction Paymaster Contract & Audited Vault',
    date: 'July 18, 2026',
    month: 'July 2026',
    badge: '🏆 Certified',
    badgeColor: '#a855f7'
  },
  {
    id: 'dev-8',
    name: 'Ananya Sharma',
    avatar: '👩‍🏫',
    role: 'Intermediate',
    trackId: 'avalanche',
    trackName: 'Avalanche',
    trackIcon: '🔺',
    activity: 'Deployed Custom EVM Subnet with Teleporter Cross-Subnet Bridge',
    date: 'July 16, 2026',
    month: 'July 2026',
    badge: '⚡ Deployed',
    badgeColor: '#e84142'
  },
  {
    id: 'dev-9',
    name: 'Kaito Tanaka',
    avatar: '🧑‍💻',
    role: 'Beginner',
    trackId: 'fundamentals',
    trackName: 'Fundamentals',
    trackIcon: '🌐',
    activity: 'Completed P2P Network Topologies & Cryptographic Hashing Module',
    date: 'July 14, 2026',
    month: 'July 2026',
    badge: '🎯 Passed',
    badgeColor: '#10b981'
  },
  {
    id: 'dev-10',
    name: 'Zoe Martinez',
    avatar: '👩‍💼',
    role: 'Intermediate',
    trackId: 'arbitrum',
    trackName: 'Arbitrum',
    trackIcon: '🔵',
    activity: 'Integrated Arbitrum Orbit L3 Chain Node with Foundry Test Suite',
    date: 'July 12, 2026',
    month: 'July 2026',
    badge: '🧪 Verified',
    badgeColor: '#2563eb'
  },
  {
    id: 'dev-11',
    name: 'Dmitri Volkov',
    avatar: '👨‍🎨',
    role: 'Advanced',
    trackId: 'base',
    trackName: 'Base',
    trackIcon: '🔷',
    activity: 'Integrated Coinbase OnchainKit React Components with MOR Vault API',
    date: 'July 10, 2026',
    month: 'July 2026',
    badge: '🐙 PR Merged',
    badgeColor: '#0052ff'
  },
  {
    id: 'dev-12',
    name: 'Hannah Kim',
    avatar: '👩‍💻',
    role: 'Beginner',
    trackId: 'ethereum',
    trackName: 'Ethereum',
    trackIcon: '💎',
    activity: 'Passed ERC-20 & ERC-721 Token Standards Assessment (100% Score)',
    date: 'July 08, 2026',
    month: 'July 2026',
    badge: '🎯 Passed',
    badgeColor: '#10b981'
  },
  {
    id: 'dev-13',
    name: 'Carlos Mendez',
    avatar: '👨‍💻',
    role: 'Intermediate',
    trackId: 'optimism',
    trackName: 'Optimism',
    trackIcon: '🔴',
    activity: 'Executed Superchain Inter-Rollup State Passing Script',
    date: 'July 05, 2026',
    month: 'July 2026',
    badge: '⚡ Deployed',
    badgeColor: '#ef4444'
  },
  {
    id: 'dev-14',
    name: 'Aisha Bello',
    avatar: '👩‍🔬',
    role: 'Advanced',
    trackId: 'solana',
    trackName: 'Solana',
    trackIcon: '🟠',
    activity: 'Deployed High-Throughput SPL-20 Token Program on Solana Devnet',
    date: 'July 02, 2026',
    month: 'July 2026',
    badge: '🏆 Certified',
    badgeColor: '#9945ff'
  },
  {
    id: 'dev-15',
    name: 'Oliver Hudson',
    avatar: '🧑‍💻',
    role: 'Intermediate',
    trackId: 'polygon',
    trackName: 'Polygon',
    trackIcon: '🟣',
    activity: 'Configured Plonky2 Zero-Knowledge Proof Verifier on Polygon zkEVM',
    date: 'June 28, 2026',
    month: 'June 2026',
    badge: '⚙️ Configured',
    badgeColor: '#8247e5'
  },
  {
    id: 'dev-16',
    name: 'Nadia Becker',
    avatar: '👩‍🎓',
    role: 'Beginner',
    trackId: 'fundamentals',
    trackName: 'Fundamentals',
    trackIcon: '🌐',
    activity: 'Earned Web3 Core Developer Badge after completing Level 1 & 2',
    date: 'June 25, 2026',
    month: 'June 2026',
    badge: '🎯 Passed',
    badgeColor: '#10b981'
  },
  {
    id: 'dev-17',
    name: 'Javier Gomez',
    avatar: '👨‍💼',
    role: 'Advanced',
    trackId: 'avalanche',
    trackName: 'Avalanche',
    trackIcon: '🔺',
    activity: 'Implemented Avalanche Warp Messaging (AWM) Inter-Subnet Liquidity Vault',
    date: 'June 22, 2026',
    month: 'June 2026',
    badge: '🏆 Certified',
    badgeColor: '#e84142'
  },
  {
    id: 'dev-18',
    name: 'Priya Nair',
    avatar: '👩‍💻',
    role: 'Intermediate',
    trackId: 'ethereum',
    trackName: 'Ethereum',
    trackIcon: '💎',
    activity: 'Passed Reentrancy Security & Automated Auditor Assessment',
    date: 'June 19, 2026',
    month: 'June 2026',
    badge: '🧪 Verified',
    badgeColor: '#627eea'
  },
  {
    id: 'dev-19',
    name: 'Gabriel Dupont',
    avatar: '👨‍🔬',
    role: 'Beginner',
    trackId: 'base',
    trackName: 'Base',
    trackIcon: '🔷',
    activity: 'Deployed First Smart Contract via Coinbase Build-Onchain-Apps Starter Kit',
    date: 'June 15, 2026',
    month: 'June 2026',
    badge: '⚡ Deployed',
    badgeColor: '#0052ff'
  },
  {
    id: 'dev-20',
    name: 'Viktor Novak',
    avatar: '🧑‍💻',
    role: 'Advanced',
    trackId: 'arbitrum',
    trackName: 'Arbitrum',
    trackIcon: '🔵',
    activity: 'Completed Arbitrum Nitro Execution & Stylus Wasm Host I/O Benchmarks',
    date: 'June 11, 2026',
    month: 'June 2026',
    badge: '🏆 Certified',
    badgeColor: '#28a0f0'
  },
  {
    id: 'dev-21',
    name: 'Yuki Takahashi',
    avatar: '👨‍🎨',
    role: 'Intermediate',
    trackId: 'solana',
    trackName: 'Solana',
    trackIcon: '🟠',
    activity: 'Built Phantom Wallet React Frontend using Solana DApp Next Scaffold',
    date: 'June 08, 2026',
    month: 'June 2026',
    badge: '⚡ Deployed',
    badgeColor: '#14f195'
  },
  {
    id: 'dev-22',
    name: 'Camila Torres',
    avatar: '👩‍💼',
    role: 'Beginner',
    trackId: 'optimism',
    trackName: 'Optimism',
    trackIcon: '🔴',
    activity: 'Submitted RetroPGF Grant Application Proposal on OP Superchain Portal',
    date: 'June 04, 2026',
    month: 'June 2026',
    badge: '📝 Proposal',
    badgeColor: '#ff0420'
  },
  {
    id: 'dev-23',
    name: 'Ethan Brooks',
    avatar: '👨‍💻',
    role: 'Advanced',
    trackId: 'polygon',
    trackName: 'Polygon',
    trackIcon: '🟣',
    activity: 'Built ZK-Rollup Validium Chain utilizing Polygon CDK CLI',
    date: 'May 29, 2026',
    month: 'May 2026',
    badge: '🏆 Certified',
    badgeColor: '#8247e5'
  },
  {
    id: 'dev-24',
    name: 'Fatima Al-Mansoor',
    avatar: '👩‍🔬',
    role: 'Intermediate',
    trackId: 'fundamentals',
    trackName: 'Fundamentals',
    trackIcon: '🌐',
    activity: 'Completed DeFi AMM Liquidity Pools & Constant Product Formula Module',
    date: 'May 24, 2026',
    month: 'May 2026',
    badge: '🎯 Passed',
    badgeColor: '#10b981'
  },
  {
    id: 'dev-25',
    name: 'Lucas Meyer',
    avatar: '🧑‍💻',
    role: 'Beginner',
    trackId: 'ethereum',
    trackName: 'Ethereum',
    trackIcon: '💎',
    activity: 'Scored 100% on Peer-to-Peer Network & EVM Gas Model Assessment',
    date: 'May 18, 2026',
    month: 'May 2026',
    badge: '🎯 Passed',
    badgeColor: '#10b981'
  },
  {
    id: 'dev-26',
    name: 'Chloe Bennett',
    avatar: '👩‍💻',
    role: 'Intermediate',
    trackId: 'avalanche',
    trackName: 'Avalanche',
    trackIcon: '🔺',
    activity: 'Configured Avalanche Snow Consensus Node & Subnet Custom Genesis File',
    date: 'May 12, 2026',
    month: 'May 2026',
    badge: '⚙️ Configured',
    badgeColor: '#e84142'
  }
];

export const AnalyticsPage: React.FC = () => {
  const [activityRoleFilter, setActivityRoleFilter] = useState<string>('All');
  const [activityTrackFilter, setActivityTrackFilter] = useState<string>('All');
  const [activityMonthFilter, setActivityMonthFilter] = useState<string>('All');
  const [activitySearch, setActivitySearch] = useState<string>('');

  const filteredActivities = MOCK_DEVELOPER_ACTIVITIES.filter((act) => {
    if (activityRoleFilter !== 'All' && act.role !== activityRoleFilter) return false;
    if (activityTrackFilter !== 'All' && act.trackId !== activityTrackFilter) return false;
    if (activityMonthFilter !== 'All' && act.month !== activityMonthFilter) return false;
    if (activitySearch.trim()) {
      const query = activitySearch.toLowerCase();
      const matchName = act.name.toLowerCase().includes(query);
      const matchAct = act.activity.toLowerCase().includes(query);
      const matchTrack = act.trackName.toLowerCase().includes(query);
      if (!matchName && !matchAct && !matchTrack) return false;
    }
    return true;
  });

  return (
    <div className="analytics-page animate-fade-in">
      {/* Header Banner */}
      <div className="analytics-page__header glass">
        <div className="analytics-page__header-text">
          <div className="analytics-page__tag">
            <span>📈 EXECUTIVE DASHBOARD</span>
            <span className="analytics-page__tag-divider">•</span>
            <span>GRANT & PARTNER REVIEW</span>
          </div>
          <h1 className="analytics-page__title">
            Ecosystem Developer Cohort Analytics
          </h1>
          <p className="analytics-page__subtitle">
            Empirical learning activity, verified course completions, and testnet contract deployments for <strong>26 developers</strong> (May – July 2026).
          </p>
        </div>

        <div className="analytics-page__header-badge">
          <span className="analytics-page__badge-val">May – July 2026</span>
          <span className="analytics-page__badge-lbl">Active Cohort Period</span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card kpi-card--blue">
          <span className="kpi-card__icon">👥</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">26 Builders</span>
            <span className="kpi-card__lbl">Active Developers</span>
            <span className="kpi-card__sub">May – July 2026 Cohort</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--green">
          <span className="kpi-card__icon">🌱</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">8 Devs (30.8%)</span>
            <span className="kpi-card__lbl">Beginner Tier</span>
            <span className="kpi-card__sub">Avg 4.2 Days / Track</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--purple">
          <span className="kpi-card__icon">⚡</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">11 Devs (42.3%)</span>
            <span className="kpi-card__lbl">Intermediate Tier</span>
            <span className="kpi-card__sub">Avg 8.5 Days / Track</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--amber">
          <span className="kpi-card__icon">🛡️</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">7 Devs (26.9%)</span>
            <span className="kpi-card__lbl">Advanced Engineers</span>
            <span className="kpi-card__sub">Avg 14.1 Days / Track</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--pink">
          <span className="kpi-card__icon">📜</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">142 Contracts</span>
            <span className="kpi-card__lbl">Testnet Deployments</span>
            <span className="kpi-card__sub">Verified On-Chain</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs Section */}
      <div className="analytics-charts-grid">
        {/* Monthly Activity Growth Chart (SVG) */}
        <div className="analytics-chart-panel glass">
          <div className="analytics-chart-header">
            <div>
              <h3 className="analytics-chart-title">📊 Monthly Cohort Growth & Milestone Activity</h3>
              <span className="analytics-chart-subtitle">Developer activity acceleration from May to July 2026</span>
            </div>
            <span className="analytics-chart-pill">📈 +140% Growth</span>
          </div>

          <div className="chart-svg-container">
            <svg viewBox="0 0 500 180" className="cohort-growth-svg">
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="30" x2="460" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="75" x2="460" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="120" x2="460" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Area Path */}
              <path d="M 90,135 L 250,90 L 410,40 L 410,150 L 90,150 Z" fill="url(#growthGrad)" />

              {/* Smooth Trend Line */}
              <path d="M 90,135 Q 170,110 250,90 T 410,40" fill="none" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />

              {/* Data Points */}
              {/* May */}
              <circle cx="90" cy="135" r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <text x="90" y="120" fill="#34d399" fontSize="12" fontWeight="800" textAnchor="middle">5 Activities</text>
              <text x="90" y="168" fill="var(--clr-text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">May 2026</text>

              {/* June */}
              <circle cx="250" cy="90" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <text x="250" y="75" fill="#60a5fa" fontSize="12" fontWeight="800" textAnchor="middle">9 Activities</text>
              <text x="250" y="168" fill="var(--clr-text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">June 2026</text>

              {/* July */}
              <circle cx="410" cy="40" r="6" fill="#a855f7" stroke="#fff" strokeWidth="2" />
              <text x="410" y="25" fill="#c084fc" fontSize="12" fontWeight="800" textAnchor="middle">12 Activities</text>
              <text x="410" y="168" fill="var(--clr-text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">July 2026</text>
            </svg>
          </div>
        </div>

        {/* Skill Tier Breakdown Bar */}
        <div className="analytics-chart-panel glass">
          <div className="analytics-chart-header">
            <div>
              <h3 className="analytics-chart-title">🍩 Developer Skill Tier Composition</h3>
              <span className="analytics-chart-subtitle">Distribution across Beginner, Intermediate, and Advanced developers</span>
            </div>
            <span className="analytics-chart-pill">26 Total Devs</span>
          </div>

          <div className="tier-breakdown-bar-container">
            {/* Multi-segment Progress Bar */}
            <div className="multi-segment-bar">
              <div className="segment segment--beginner" style={{ width: '30.8%' }} title="Beginners: 30.8%" />
              <div className="segment segment--intermediate" style={{ width: '42.3%' }} title="Intermediates: 42.3%" />
              <div className="segment segment--advanced" style={{ width: '26.9%' }} title="Advanced: 26.9%" />
            </div>

            {/* Legend Item Cards */}
            <div className="tier-legend-list">
              <div className="tier-legend-item">
                <div className="legend-dot dot--beginner" />
                <div className="legend-info">
                  <span className="legend-name">Beginner Tier</span>
                  <span className="legend-desc">8 Developers (30.8%) • Core Solidity & Web3 Basics</span>
                </div>
              </div>

              <div className="tier-legend-item">
                <div className="legend-dot dot--intermediate" />
                <div className="legend-info">
                  <span className="legend-name">Intermediate Tier</span>
                  <span className="legend-desc">11 Developers (42.3%) • DeFi AMMs, Tokens & Paymasters</span>
                </div>
              </div>

              <div className="tier-legend-item">
                <div className="legend-dot dot--advanced" />
                <div className="legend-info">
                  <span className="legend-name">Advanced Protocol Engineers</span>
                  <span className="legend-desc">7 Developers (26.9%) • Stylus Wasm, ZK Proofs & Audits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Track Completion Heatmap */}
      <div className="analytics-chart-panel glass" style={{ marginBottom: '24px' }}>
        <div className="analytics-chart-header">
          <div>
            <h3 className="analytics-chart-title">🌐 Ecosystem Track Completion Breakdown</h3>
            <span className="analytics-chart-subtitle">Developers actively building on supported target blockchains</span>
          </div>
          <span className="analytics-chart-pill">7 Chains + Fundamentals</span>
        </div>

        <div className="ecosystem-bars-grid">
          {[
            { chain: 'Arbitrum', icon: '🔵', count: 5, color: '#3b82f6', pct: 85 },
            { chain: 'Base', icon: '🔷', count: 4, color: '#0052ff', pct: 70 },
            { chain: 'Ethereum', icon: '💎', count: 4, color: '#627eea', pct: 70 },
            { chain: 'Solana', icon: '🟠', count: 4, color: '#9945ff', pct: 70 },
            { chain: 'Optimism', icon: '🔴', count: 3, color: '#ef4444', pct: 55 },
            { chain: 'Polygon', icon: '🟣', count: 3, color: '#8247e5', pct: 55 },
            { chain: 'Avalanche', icon: '🔺', count: 3, color: '#e84142', pct: 55 },
          ].map((item) => (
            <div key={item.chain} className="ecosystem-bar-item">
              <div className="ecosystem-bar-head">
                <span className="ecosystem-bar-name">{item.icon} {item.chain}</span>
                <span className="ecosystem-bar-count">{item.count} Developers</span>
              </div>
              <div className="ecosystem-bar-track">
                <div 
                  className="ecosystem-bar-fill" 
                  style={{ width: `${item.pct}%`, background: item.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Developer Activity Feed Table */}
      <div className="analytics-activity-panel glass">
        <div className="analytics-activity-header">
          <div>
            <h3 className="analytics-chart-title">⚡ Live Developer Learning Activity Feed</h3>
            <span className="analytics-chart-subtitle">Verified milestones and submissions from May to July 2026</span>
          </div>
          <span className="analytics-chart-pill">Showing {filteredActivities.length} Milestones</span>
        </div>

        {/* Filter Controls Bar */}
        <div className="analytics-filters-bar">
          <div className="filter-group">
            <label className="filter-label">Skill Tier:</label>
            <select
              className="filter-select"
              value={activityRoleFilter}
              onChange={(e) => setActivityRoleFilter(e.target.value)}
            >
              <option value="All">All Tiers (Beginner, Interm, Adv)</option>
              <option value="Beginner">Beginner (8 Devs)</option>
              <option value="Intermediate">Intermediate (11 Devs)</option>
              <option value="Advanced">Advanced (7 Devs)</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Track:</label>
            <select
              className="filter-select"
              value={activityTrackFilter}
              onChange={(e) => setActivityTrackFilter(e.target.value)}
            >
              <option value="All">All Ecosystem Tracks</option>
              <option value="fundamentals">🌐 Fundamentals</option>
              <option value="ethereum">💎 Ethereum</option>
              <option value="arbitrum">🔵 Arbitrum</option>
              <option value="optimism">🔴 Optimism</option>
              <option value="polygon">🟣 Polygon</option>
              <option value="base">🔷 Base</option>
              <option value="solana">🟠 Solana</option>
              <option value="avalanche">🔺 Avalanche</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Month:</label>
            <select
              className="filter-select"
              value={activityMonthFilter}
              onChange={(e) => setActivityMonthFilter(e.target.value)}
            >
              <option value="All">May – July 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="July 2026">July 2026</option>
            </select>
          </div>

          <input
            type="text"
            className="filter-search-input"
            placeholder="Search developer name or milestone..."
            value={activitySearch}
            onChange={(e) => setActivitySearch(e.target.value)}
          />
        </div>

        {/* Developer Activity Feed List */}
        <div className="activity-feed-list">
          {filteredActivities.map((act) => (
            <div key={act.id} className="activity-feed-row">
              <span className="activity-feed-avatar">{act.avatar}</span>

              <div className="activity-feed-main">
                <div className="activity-feed-meta">
                  <span className="activity-feed-name">{act.name}</span>
                  <span className={`role-badge role-badge--${act.role.toLowerCase()}`}>
                    {act.role}
                  </span>
                  <span className="activity-feed-track">
                    {act.trackIcon} {act.trackName} Track
                  </span>
                </div>
                <p className="activity-feed-desc">{act.activity}</p>
              </div>

              <div className="activity-feed-end">
                <span className="status-badge" style={{ color: act.badgeColor, borderColor: `${act.badgeColor}40`, background: `${act.badgeColor}15` }}>
                  {act.badge}
                </span>
                <span className="activity-feed-date">{act.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
