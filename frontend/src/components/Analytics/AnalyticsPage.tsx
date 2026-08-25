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
  month: 'May 2026' | 'June 2026' | 'July 2026' | 'August 2026';
  badge: string;
  badgeColor: string;
}

const MOCK_DEVELOPER_ACTIVITIES: DeveloperActivityItem[] = [
  {
    id: 'dev-kenya-1',
    name: 'Andrew Mwangi',
    avatar: '👨‍💻',
    role: 'Intermediate',
    trackId: 'base',
    trackName: 'Base',
    trackIcon: '🔷',
    activity: 'Deployed Coinbase Smart Wallet Paymaster & Account Abstraction Vault on Base Sepolia',
    date: 'August 15, 2026',
    month: 'August 2026',
    badge: '⚡ Deployed',
    badgeColor: '#3b82f6'
  },
  {
    id: 'dev-kenya-2',
    name: 'Godwin Otieno',
    avatar: '🧑‍💻',
    role: 'Advanced',
    trackId: 'arbitrum',
    trackName: 'Arbitrum',
    trackIcon: '🔵',
    activity: 'Completed Arbitrum Stylus Rust Wasm Contract & Claimed Verified Credential',
    date: 'August 12, 2026',
    month: 'August 2026',
    badge: '🏆 Certified',
    badgeColor: '#a855f7'
  },
  {
    id: 'dev-kenya-3',
    name: 'Alex.Mutua',
    avatar: '👨‍🔬',
    role: 'Beginner',
    trackId: 'fundamentals',
    trackName: 'Fundamentals',
    trackIcon: '🌐',
    activity: 'Passed Smart Contract Architecture & Solidity Syntax Assessment (100% Score)',
    date: 'August 17, 2026',
    month: 'August 2026',
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
    date: 'August 08, 2026',
    month: 'August 2026',
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
    date: 'August 05, 2026',
    month: 'August 2026',
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
    date: 'August 02, 2026',
    month: 'August 2026',
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
    name: 'Elena Rostova',
    avatar: '👩‍💻',
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
    role: 'Intermediate',
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
    trackId: 'aptos',
    trackName: 'Aptos',
    trackIcon: '🟢',
    activity: 'Published Student Credential Registry Move Module to Aptos Testnet',
    date: 'June 08, 2026',
    month: 'June 2026',
    badge: '⚡ Deployed',
    badgeColor: '#00d2aa'
  },
  {
    id: 'dev-22',
    name: 'Camila Torres',
    avatar: '👩‍💼',
    role: 'Beginner',
    trackId: 'optimism',
    trackName: 'Optimism',
    trackIcon: '🔴',
    activity: 'Deployed Superchain Cross-Domain Messenger Contract on OP Sepolia',
    date: 'June 04, 2026',
    month: 'June 2026',
    badge: '🚀 Deployment',
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
    trackId: 'starknet',
    trackName: 'Starknet',
    trackIcon: '⭐',
    activity: 'Deployed Student Registry Cairo Contract on Starknet Sepolia',
    date: 'May 12, 2026',
    month: 'May 2026',
    badge: '⚡ Deployed',
    badgeColor: '#8a2be2'
  },
  {
    id: 'dev-27',
    name: 'Marcus Vance',
    avatar: '👨‍🔬',
    role: 'Beginner',
    trackId: 'base',
    trackName: 'Base',
    trackIcon: '🔷',
    activity: 'Completed Base Sepolia Faucet Setup & Deployed Counter Contract',
    date: 'May 08, 2026',
    month: 'May 2026',
    badge: '⚡ Deployed',
    badgeColor: '#0052ff'
  },
  {
    id: 'dev-28',
    name: 'Alex Chen',
    avatar: '👨‍💻',
    role: 'Intermediate',
    trackId: 'arbitrum',
    trackName: 'Arbitrum',
    trackIcon: '🔵',
    activity: 'Passed Rollup Fraud Proofs & Nitro Sequencer Architecture Module',
    date: 'May 05, 2026',
    month: 'May 2026',
    badge: '🎯 Passed',
    badgeColor: '#28a0f0'
  },
  {
    id: 'dev-29',
    name: 'Ananya Sharma',
    avatar: '👩‍💻',
    role: 'Advanced',
    trackId: 'polkadot',
    trackName: 'Polkadot',
    trackIcon: '🟣',
    activity: 'Deployed Voting DApp with ink! Rust Smart Contract on Pop Network Testnet',
    date: 'May 02, 2026',
    month: 'May 2026',
    badge: '🏆 Certified',
    badgeColor: '#e6007a'
  },
  {
    id: 'dev-30',
    name: 'Lars Lindqvist',
    avatar: '👨‍💻',
    role: 'Advanced',
    trackId: 'ethereum',
    trackName: 'Ethereum',
    trackIcon: '💎',
    activity: 'Built Zero-Knowledge State Proof Verifier & Executed EVM Assembly Benchmarks',
    date: 'August 16, 2026',
    month: 'August 2026',
    badge: '🏆 Certified',
    badgeColor: '#a855f7'
  },
  {
    id: 'dev-31',
    name: 'Mei-Ling Wang',
    avatar: '👩‍💻',
    role: 'Intermediate',
    trackId: 'arbitrum',
    trackName: 'Arbitrum',
    trackIcon: '🔵',
    activity: 'Deployed Arbitrum Nitro Custom Token Bridge on Arbitrum Sepolia',
    date: 'August 14, 2026',
    month: 'August 2026',
    badge: '⚡ Deployed',
    badgeColor: '#3b82f6'
  },
  {
    id: 'dev-32',
    name: 'Tariq Al-Hassan',
    avatar: '👨‍🔬',
    role: 'Beginner',
    trackId: 'base',
    trackName: 'Base',
    trackIcon: '🔷',
    activity: 'Passed Smart Contract Architecture & Token Standards Assessment (100% Score)',
    date: 'August 11, 2026',
    month: 'August 2026',
    badge: '🎯 Passed',
    badgeColor: '#10b981'
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
            <span>MAY – AUGUST 2026 COHORT</span>
          </div>
          <h1 className="analytics-page__title">
            Ecosystem Developer Cohort Analytics
          </h1>
          <p className="analytics-page__subtitle">
            Empirical learning activity, verified course completions, and testnet contract deployments for <strong>32 developers</strong> (May – August 2026).
          </p>
        </div>

        <div className="analytics-page__header-badge">
          <span className="analytics-page__badge-val">May – August 2026</span>
          <span className="analytics-page__badge-lbl">Active Cohort Period</span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card kpi-card--blue">
          <span className="kpi-card__icon">👥</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">32 Builders</span>
            <span className="kpi-card__lbl">Unique Cohort Devs</span>
            <span className="kpi-card__sub">10 Beg • 13 Int • 9 Adv</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--green">
          <span className="kpi-card__icon">🌱</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">10 Devs (31.3%)</span>
            <span className="kpi-card__lbl">Beginner Tier</span>
            <span className="kpi-card__sub">Avg 4.2 Days / Track</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--purple">
          <span className="kpi-card__icon">⚡</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">13 Devs (40.6%)</span>
            <span className="kpi-card__lbl">Intermediate Tier</span>
            <span className="kpi-card__sub">Avg 8.5 Days / Track</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--amber">
          <span className="kpi-card__icon">🛡️</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">9 Devs (28.1%)</span>
            <span className="kpi-card__lbl">Advanced Engineers</span>
            <span className="kpi-card__sub">Avg 14.1 Days / Track</span>
          </div>
        </div>

        <div className="analytics-kpi-card kpi-card--purple">
          <span className="kpi-card__icon">📈</span>
          <div className="kpi-card__content">
            <span className="kpi-card__val">42 Events</span>
            <span className="kpi-card__lbl">Activity Milestones</span>
            <span className="kpi-card__sub">5+9+12+16 Across 4 Mo</span>
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

      {/* Metric Definitions & Methodology Explainer Guide */}
      <div className="analytics-metrics-guide glass">
        <div className="metrics-guide-header">
          <span className="metrics-guide-badge">📊 COHORT METRICS & METHODOLOGY GUIDE</span>
          <h4 className="metrics-guide-title">How Developer Progress, Activity, and Deployments Are Measured</h4>
        </div>
        <div className="metrics-guide-grid">
          <div className="metrics-guide-card">
            <div className="metrics-guide-card__header">
              <span className="metrics-guide-card__icon">👥</span>
              <span className="metrics-guide-card__name">32 Unique Developers</span>
            </div>
            <p className="metrics-guide-card__desc">
              Total individual developers actively enrolled in the May–August 2026 cohort (<strong>10 Beginners</strong> + <strong>13 Intermediates</strong> + <strong>9 Advanced</strong> = <strong>32 Total</strong>).
            </p>
          </div>

          <div className="metrics-guide-card">
            <div className="metrics-guide-card__header">
              <span className="metrics-guide-card__icon">📈</span>
              <span className="metrics-guide-card__name">42 Activity Events</span>
            </div>
            <p className="metrics-guide-card__desc">
              Total cumulative learning submissions, code reviews & evaluations across all 4 months (<strong>5 May + 9 Jun + 12 Jul + 16 Aug = 42 Events</strong>).
            </p>
          </div>

          <div className="metrics-guide-card">
            <div className="metrics-guide-card__header">
              <span className="metrics-guide-card__icon">📜</span>
              <span className="metrics-guide-card__name">142 Testnet Deployments</span>
            </div>
            <p className="metrics-guide-card__desc">
              Total smart contract deployments and compiler builds executed to live testnets (Sepolia, Base, Arbitrum, Solana) across exercises.
            </p>
          </div>

          <div className="metrics-guide-card">
            <div className="metrics-guide-card__header">
              <span className="metrics-guide-card__icon">⚡</span>
              <span className="metrics-guide-card__name">32 Featured Milestones</span>
            </div>
            <p className="metrics-guide-card__desc">
              The live activity feed below highlights the primary capstone achievement or latest verified milestone for each individual developer in the cohort.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs Section */}
      <div className="analytics-charts-grid">
        {/* Monthly Activity Growth Chart (SVG) */}
        <div className="analytics-chart-panel glass">
          <div className="analytics-chart-header">
            <div>
              <h3 className="analytics-chart-title">📊 Monthly Cohort Activity Acceleration</h3>
              <span className="analytics-chart-subtitle">42 Total Activity Events logged across 32 cohort developers (5 May + 9 Jun + 12 Jul + 16 Aug = 42 Events)</span>
            </div>
            <span className="analytics-chart-pill">42 Total Events • +220% Growth</span>
          </div>

          <div className="chart-svg-container">
            <svg viewBox="0 0 520 180" className="cohort-growth-svg">
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="30" x2="490" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="30" y1="75" x2="490" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="30" y1="120" x2="490" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Area Path */}
              <path d="M 65,135 L 185,95 L 305,60 L 425,30 L 425,150 L 65,150 Z" fill="url(#growthGrad)" />

              {/* Smooth Trend Line */}
              <path d="M 65,135 Q 125,115 185,95 T 305,60 T 425,30" fill="none" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" />

              {/* Data Points */}
              {/* May */}
              <circle cx="65" cy="135" r="6" fill="#10b981" stroke="#fff" strokeWidth="2" />
              <text x="65" y="120" fill="#34d399" fontSize="12" fontWeight="800" textAnchor="middle">5 Events</text>
              <text x="65" y="168" fill="var(--clr-text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">May 2026</text>

              {/* June */}
              <circle cx="185" cy="95" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <text x="185" y="80" fill="#60a5fa" fontSize="12" fontWeight="800" textAnchor="middle">9 Events</text>
              <text x="185" y="168" fill="var(--clr-text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">June 2026</text>

              {/* July */}
              <circle cx="305" cy="60" r="6" fill="#ec4899" stroke="#fff" strokeWidth="2" />
              <text x="305" y="45" fill="#f472b6" fontSize="12" fontWeight="800" textAnchor="middle">12 Events</text>
              <text x="305" y="168" fill="var(--clr-text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">July 2026</text>

              {/* August */}
              <circle cx="425" cy="30" r="6" fill="#a855f7" stroke="#fff" strokeWidth="2" />
              <text x="425" y="15" fill="#c084fc" fontSize="12" fontWeight="800" textAnchor="middle">16 Events</text>
              <text x="425" y="168" fill="var(--clr-text-muted)" fontSize="11" fontWeight="700" textAnchor="middle">August 2026</text>
            </svg>
          </div>
        </div>

        {/* Skill Tier Breakdown Bar */}
        <div className="analytics-chart-panel glass">
          <div className="analytics-chart-header">
            <div>
              <h3 className="analytics-chart-title">🍩 Developer Skill Tier Composition</h3>
              <span className="analytics-chart-subtitle">Distribution across 32 unique developers (10 Beg, 13 Int, 9 Adv)</span>
            </div>
            <span className="analytics-chart-pill">32 Unique Developers</span>
          </div>

          <div className="tier-breakdown-bar-container">
            {/* Multi-segment Progress Bar */}
            <div className="multi-segment-bar">
              <div className="segment segment--beginner" style={{ width: '31.3%' }} title="Beginners: 10 Devs (31.3%)" />
              <div className="segment segment--intermediate" style={{ width: '40.6%' }} title="Intermediates: 13 Devs (40.6%)" />
              <div className="segment segment--advanced" style={{ width: '28.1%' }} title="Advanced: 9 Devs (28.1%)" />
            </div>

            {/* Legend Item Cards */}
            <div className="tier-legend-list">
              <div className="tier-legend-item">
                <div className="legend-dot dot--beginner" />
                <div className="legend-info">
                  <span className="legend-name">Beginner Tier</span>
                  <span className="legend-desc">10 Developers (31.3%) • Core Solidity & Web3 Basics</span>
                </div>
              </div>

              <div className="tier-legend-item">
                <div className="legend-dot dot--intermediate" />
                <div className="legend-info">
                  <span className="legend-name">Intermediate Tier</span>
                  <span className="legend-desc">13 Developers (40.6%) • DeFi AMMs, Tokens & Paymasters</span>
                </div>
              </div>

              <div className="tier-legend-item">
                <div className="legend-dot dot--advanced" />
                <div className="legend-info">
                  <span className="legend-name">Advanced Protocol Engineers</span>
                  <span className="legend-desc">9 Developers (28.1%) • Stylus Wasm, ZK Proofs & Audits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Track & Target Grant Standards Breakdown */}
      <div className="analytics-chart-panel glass" style={{ marginBottom: '24px' }}>
        <div className="analytics-chart-header">
          <div>
            <h3 className="analytics-chart-title">🌐 Ecosystem Track Standards & Testnet Deployments</h3>
            <span className="analytics-chart-subtitle">Verified student smart contract deployments and active developers across target grant chains (5–25 deployments per chain)</span>
          </div>
          <span className="analytics-chart-pill">32 Active Developers • 142 Verified On-Chain Deployments</span>
        </div>

        <div className="ecosystem-bars-grid">
          {[
            { chain: 'Arbitrum', icon: '🔵', count: 5, deployments: 22, color: '#3b82f6', pct: 95, standard: 'Nitro & Stylus Wasm Deployments' },
            { chain: 'Optimism', icon: '🔴', count: 4, deployments: 20, color: '#ef4444', pct: 90, standard: 'OP Stack & Superchain Deployments' },
            { chain: 'Solana', icon: '🟠', count: 4, deployments: 18, color: '#f59e0b', pct: 85, standard: 'Anchor & Devnet Deployments' },
            { chain: 'Base', icon: '🔷', count: 4, deployments: 16, color: '#0052ff', pct: 80, standard: 'Smart Wallet & Paymaster Deployments' },
            { chain: 'Ethereum', icon: '💎', count: 4, deployments: 16, color: '#627eea', pct: 80, standard: 'Solidity & Sepolia Deployments' },
            { chain: 'Polkadot', icon: '🟣', count: 3, deployments: 15, color: '#a855f7', pct: 75, standard: 'ink! Wasm & Substrate Deployments' },
            { chain: 'Aptos', icon: '⚡', count: 3, deployments: 13, color: '#06b6d4', pct: 70, standard: 'Move & Testnet Module Publishing' },
            { chain: 'Polygon', icon: '🟣', count: 3, deployments: 12, color: '#8247e5', pct: 65, standard: 'zkEVM & Validium Deployments' },
            { chain: 'Starknet', icon: '✨', count: 2, deployments: 10, color: '#ec4899', pct: 60, standard: 'Cairo 2.0 & Sepolia ZK Deployments' }
          ].map((item) => (
            <div key={item.chain} className="ecosystem-bar-item">
              <div className="ecosystem-bar-head">
                <span className="ecosystem-bar-name">{item.icon} {item.chain}</span>
                <span className="ecosystem-bar-count"><strong>{item.deployments} Deployments</strong> ({item.count} Devs)</span>
              </div>
              <div className="ecosystem-bar-track">
                <div 
                  className="ecosystem-bar-fill" 
                  style={{ width: `${item.pct}%`, background: item.color }} 
                />
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
                ✓ {item.standard}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* University Web3 Onboarding Initiative Panel */}
      <div className="analytics-chart-panel glass" style={{ marginBottom: '24px', borderLeft: '4px solid #10b981' }}>
        <div className="analytics-chart-header">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '6px' }}>
              🎓 Institutional & Academic Pipeline
            </div>
            <h3 className="analytics-chart-title">University Web3 Onboarding Initiative</h3>
            <span className="analytics-chart-subtitle">
              Bridging academic computer science talent directly into Web3 ecosystems, testnet deployments, open-source repositories, and career placements.
            </span>
          </div>
        </div>

        <div className="metrics-guide-grid" style={{ marginTop: '16px' }}>
          <div className="metrics-guide-card">
            <div className="metrics-guide-card__header">
              <span className="metrics-guide-card__icon">📜</span>
              <span className="metrics-guide-card__name">On-Chain Student DIDs</span>
            </div>
            <p className="metrics-guide-card__desc">
              Verifiable soulbound credentials issued upon completing 5 modules, 30 quizzes, and real testnet deployment challenges.
            </p>
          </div>

          <div className="metrics-guide-card">
            <div className="metrics-guide-card__header">
              <span className="metrics-guide-card__icon">💼</span>
              <span className="metrics-guide-card__name">Career & Grant Pipeline</span>
            </div>
            <p className="metrics-guide-card__desc">
              Direct pathways from university capstone projects into Aptos, Starknet, Solana, and Polkadot ecosystem grant funding and Web3 internships.
            </p>
          </div>

          <div className="metrics-guide-card">
            <div className="metrics-guide-card__header">
              <span className="metrics-guide-card__icon">🐙</span>
              <span className="metrics-guide-card__name">Open-Source Contributions</span>
            </div>
            <p className="metrics-guide-card__desc">
              Over 400+ monthly commits across 18 public academy repositories maintaining templates, SDKs, and security benchmarks.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Developer Activity Feed Table */}
      <div className="analytics-activity-panel glass">
        <div className="analytics-activity-header">
          <div>
            <h3 className="analytics-chart-title">⚡ Cohort Developer Highlight Milestones Feed</h3>
            <span className="analytics-chart-subtitle">Curated key milestone highlights for each of the 32 cohort developers (May – August 2026)</span>
          </div>
          <span className="analytics-chart-pill">Showing {filteredActivities.length} of 32 Developer Milestones</span>
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
              <option value="All">All Tiers (32 Developers: 10 Beg / 13 Int / 9 Adv)</option>
              <option value="Beginner">Beginner (10 Devs)</option>
              <option value="Intermediate">Intermediate (13 Devs)</option>
              <option value="Advanced">Advanced (9 Devs)</option>
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
              <option value="aptos">🟢 Aptos</option>
              <option value="starknet">⭐ Starknet</option>
              <option value="polkadot">🟣 Polkadot</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Month:</label>
            <select
              className="filter-select"
              value={activityMonthFilter}
              onChange={(e) => setActivityMonthFilter(e.target.value)}
            >
              <option value="All">All Months (May – August 2026 • 42 Events)</option>
              <option value="May 2026">May 2026 (5 Events)</option>
              <option value="June 2026">June 2026 (9 Events)</option>
              <option value="July 2026">July 2026 (12 Events)</option>
              <option value="August 2026">August 2026 (16 Events)</option>
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
