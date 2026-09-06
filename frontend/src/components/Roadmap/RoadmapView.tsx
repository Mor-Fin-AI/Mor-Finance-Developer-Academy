// ─── RoadmapView — 7-level learning roadmap with ecosystem tracks ───────────────
import React, { useState } from 'react';
import type { UserProgress } from '../../types';
import { LevelCard } from './LevelCard';
import { postActiveTrack } from '../../api/client';
import { SYLLABUS_COMPLIANCE_MAP, sanitizeComplianceText } from '../../utils/complianceMask';
import './RoadmapView.css';

interface RoadmapViewProps {
  progress: UserProgress | null;
  loading: boolean;
  onSelectLevel: (levelId: number) => void;
  userId: string;
  token: string;
  onProgressUpdate: (updatedProgress: UserProgress) => void;
  isLoggedIn?: boolean;
}

const CHAIN_LOGOS: Record<string, React.ReactNode> = {
  fundamentals: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  ),
  ethereum: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M11.999 2L4.5 14.373L11.999 18.75L19.5 14.373L11.999 2Z" fill="#627EEA"/>
      <path d="M11.999 2L4.5 14.373L11.999 18.75V2Z" fill="#8C9EFF"/>
      <path d="M11.999 20.08L4.5 15.656L11.999 22L19.5 15.657L11.999 20.08Z" fill="#627EEA"/>
      <path d="M11.999 20.08L4.5 15.656L11.999 22V20.08Z" fill="#8C9EFF"/>
    </svg>
  ),
  arbitrum: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 19.5H22L12 2Z" fill="#28A0F0"/>
      <path d="M12 7L6 17.5H18L12 7Z" fill="#96BEDC"/>
    </svg>
  ),
  optimism: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FF0420"/>
      <path d="M7 9C7 7.89543 7.89543 7 9 7H15C16.1046 7 17 7.89543 17 9V15C17 16.1046 16.1046 17 15 17H9C7.89543 17 7 16.1046 7 15V9Z" fill="#FFFFFF"/>
    </svg>
  ),
  polygon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M16.5 4L7.5 9V15L16.5 20V14L12 11.5L16.5 9V4Z" fill="#8247E5"/>
      <path d="M7.5 4L16.5 9V15L7.5 20V14L12 11.5L7.5 9V4Z" fill="#A855F7" opacity="0.7"/>
    </svg>
  ),
  base: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0052FF"/>
      <rect x="7" y="11" width="10" height="2" rx="1" fill="#FFFFFF"/>
    </svg>
  ),
  solana: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4.5 17.5L8.5 13.5H19.5L15.5 17.5H4.5Z" fill="#9945FF"/>
      <path d="M4.5 6.5L8.5 10.5H19.5L15.5 6.5H4.5Z" fill="#14F195"/>
      <path d="M8.5 12L4.5 12H15.5L19.5 12H8.5Z" fill="#00C2FF"/>
    </svg>
  ),
  avalanche: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#E84142"/>
      <path d="M12 6L6 17H10L12 13.5L14 17H18L12 6Z" fill="#FFFFFF"/>
    </svg>
  ),
  starknet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0C0C4F"/>
      <path d="M12 4L14.5 9.5L20 12L14.5 14.5L12 20L9.5 14.5L4 12L9.5 9.5L12 4Z" fill="#8B5CF6"/>
      <path d="M12 8L13.2 10.8L16 12L13.2 13.2L12 16L10.8 13.2L8 12L10.8 10.8L12 8Z" fill="#FFFFFF"/>
    </svg>
  ),
  aptos: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#00D2AA"/>
      <path d="M7 16L12 7L17 16H14L12 11.5L10 16H7Z" fill="#0A0B17"/>
    </svg>
  ),
  polkadot: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#E6007A"/>
      <circle cx="12" cy="7.5" r="2" fill="#FFFFFF"/>
      <circle cx="12" cy="16.5" r="2" fill="#FFFFFF"/>
      <circle cx="7.5" cy="12" r="2" fill="#FFFFFF"/>
      <circle cx="16.5" cy="12" r="2" fill="#FFFFFF"/>
    </svg>
  ),
  fullstack: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  )
};

const ECOSYSTEMS = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    badge: 'Universal Distributed Systems Foundation',
    desc: 'Core Distributed Systems Principles: P2P Network Topologies, Cryptographic Hashing, Transactions, Consensus Models, System Logic Engines & Distributed Architecture.',
    architecture: 'P2P Networks, Hashing (SHA256, Keccak256), Key Pairs, Consensus Mechanisms (PoW, PoS)',
    tooling: 'Solidity, Rust, Software SDKs, Testing Frameworks, Foundry, and MOR Developer Toolkits',
    p1_name: 'OpenZeppelin Core System Architectures',
    p1_repo: 'https://github.com/OpenZeppelin/openzeppelin-contracts',
    p2_name: 'Distributed Systems Full-Stack Kit',
    p2_repo: 'https://github.com/scaffold-eth/scaffold-eth-2'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    badge: 'Layer 1 Settlement & Execution Engine Standard',
    desc: 'Dedicated Distributed Architecture Developer Onboarding Path: Gas Execution Model, Object-Oriented Syntax Engines, Testing Frameworks, and Account Abstraction.',
    architecture: 'Ethereum Virtual Machine (EVM), Gasper Proof-of-Stake Consensus, Execution & Consensus Client Specs',
    tooling: 'Solidity (^0.8.20), Hardhat, Foundry, Ethers.js, Viem, and OpenZeppelin Contracts',
    p1_name: 'OpenZeppelin Architecture Library',
    p1_repo: 'https://github.com/OpenZeppelin/openzeppelin-contracts',
    p2_name: 'Full-Stack Architecture Starter Kit',
    p2_repo: 'https://github.com/scaffold-eth/scaffold-eth-2'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    badge: 'High-Scale Execution Engine & Stylus Rust',
    desc: 'Dedicated Arbitrum Developer Onboarding Path: Arbitrum Nitro Execution Engine, Stylus Wasm (Rust & C++), Arbitrum Orbit L3 Chains, and Offchain Labs Developer Tooling.',
    architecture: 'Nitro Execution Engine, Arbitrum Virtual Machine (AVM), Orbit L3 Configs, and Stylus Wasm Host I/O',
    tooling: 'Rust (Stylus SDK), Solidity, Arbitrum Nitro Testnet RPCs, Foundry, and Offchain Labs CLI',
    p1_name: 'Stylus Rust Hello World Repo',
    p1_repo: 'https://github.com/OffchainLabs/stylus-hello-world',
    p2_name: 'Arbitrum Tutorials Codebase',
    p2_repo: 'https://github.com/OffchainLabs/arbitrum-tutorials'
  },
  {
    id: 'optimism',
    name: 'Optimism',
    badge: 'Modular Superchain & Cross-Domain Rollup',
    desc: 'Dedicated Optimism Developer Onboarding Path: OP Stack Modular Infrastructure, Bedrock Execution Layer, Superchain Inter-Process Messaging, and Public Goods Funding.',
    architecture: 'OP Stack Rollup Spec, Bedrock Sequencer Architecture, Cross-Domain Messenger (L1 <-> L2)',
    tooling: 'Solidity, OP Stack Devnet CLI, Foundry, Wagmi, and Optimism Ecosystem SDKs',
    p1_name: 'OP Cross-Domain Messenger Tutorial',
    p1_repo: 'https://github.com/ethereum-optimism/optimism-tutorial',
    p2_name: 'OP Superchain Ecosystem Templates',
    p2_repo: 'https://github.com/ethereum-optimism/ecosystem-contributions'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    badge: 'Modular PoS & Validity-Proof Systems',
    desc: 'Dedicated Polygon Developer Onboarding Path: Polygon PoS Architecture, Polygon CDK (Chain Development Kit), Plonky2 zero-knowledge proofs, and validium integration.',
    architecture: 'Polygon PoS Architecture, Polygon CDK Validium & ZK-Rollup Spec, Plonky2 Verifiers',
    tooling: 'Solidity, Polygon CDK CLI, Kurtosis CDK Package, Hardhat, and Foundry',
    p1_name: 'Polygon CDK Core Node Repository',
    p1_repo: 'https://github.com/0xPolygon/cdk',
    p2_name: 'Polygon Kurtosis CDK Devnet Package',
    p2_repo: 'https://github.com/0xPolygon/kurtosis-cdk'
  },
  {
    id: 'base',
    name: 'Base',
    badge: 'High-Performance L2 & Modern App Standard',
    desc: 'Dedicated Base Developer Onboarding Path: Base Layer-2 OP Stack Node, Developer Key SDK, OnchainKit React Components, and Gasless Paymasters.',
    architecture: 'Base OP Stack Layer-2 Execution Layer, Account Abstraction & Session Logic',
    tooling: 'Solidity (^0.8.20), Component Libraries, Starter Kits, Foundry, and MOR Finance APIs',
    p1_name: 'Client React & TS SDK',
    p1_repo: 'https://github.com/coinbase/onchainkit',
    p2_name: 'Modern Web Architecture Starter Kit',
    p2_repo: 'https://github.com/coinbase/build-onchain-apps'
  },
  {
    id: 'solana',
    name: 'Solana',
    badge: 'High-Throughput Parallel Systems Engine',
    desc: 'Dedicated Solana Developer Onboarding Path: Sealevel Parallel Processing Logic, Proof-of-Sequence Validation, Structured Compilation Frameworks, and Programmatically Derived Storage Addresses.',
    architecture: 'Sealevel Parallel Execution Runtime, Proof-of-History (PoH) Consensus, Accounts & PDA Model',
    tooling: 'Rust, Anchor Framework, Solana CLI, Token Standards, and Protocol SDKs',
    p1_name: 'Coral XYZ Anchor Framework Rust Kit',
    p1_repo: 'https://github.com/coral-xyz/anchor',
    p2_name: 'Next.js Distributed Application Scaffold',
    p2_repo: 'https://github.com/solana-developers/solana-dapp-next'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    badge: 'Multi-Subnet Architecture & Teleporter Messaging',
    desc: 'Dedicated Avalanche Developer Onboarding Path: Avalanche Snow Consensus Engine, Primary Network Subnets, Custom Virtual Machines, and Teleporter Warp Messaging.',
    architecture: 'Snow Consensus Protocol, Primary Network Subnets, Avalanche Warp Messaging (AWM) Teleporter',
    tooling: 'Solidity, Avalanche CLI, Teleporter SDK, Hardhat, and Ethers.js',
    p1_name: 'Ava Labs Starter Kit',
    p1_repo: 'https://github.com/ava-labs/avalanche-starter-kit',
    p2_name: 'Teleporter Cross-Subnet Kit',
    p2_repo: 'https://github.com/ava-labs/teleporter'
  },
  {
    id: 'starknet',
    name: 'Starknet',
    badge: 'Validity-Proof Scaling & Cairo Systems',
    desc: 'Dedicated Starknet Developer Onboarding Path: Starknet Fundamentals, Cairo Programming, Account Abstraction, Testing & Concurrency, and Sandbox Deployment.',
    architecture: 'STARK Prover & Verifier, Cairo VM Architecture, Native Account Abstraction, L1-L2 Messaging',
    tooling: 'Cairo (^2.6.0), Scarb, Starkli, Snforge, OpenZeppelin Cairo, and Starknet.js',
    p1_name: 'Starknet Cairo Core Repo',
    p1_repo: 'https://github.com/starkware-libs/cairo',
    p2_name: 'OpenZeppelin Cairo System Components',
    p2_repo: 'https://github.com/OpenZeppelin/cairo-contracts'
  },
  {
    id: 'aptos',
    name: 'Aptos',
    badge: 'Safe Memory VM & High-Throughput Layer 1',
    desc: 'Dedicated Aptos Developer Onboarding Path: Aptos Fundamentals, Move Programming Language, Resource Storage, Testing & Concurrency, and Sandbox Deployment.',
    architecture: 'Move Virtual Machine (MoveVM), Block-STM Parallel Execution Engine, AptosBFT Consensus',
    tooling: 'Move CLI, Aptos CLI, Aptos TS SDK, Aptos Framework, and Client Keys',
    p1_name: 'Aptos Core Repository',
    p1_repo: 'https://github.com/aptos-labs/aptos-core',
    p2_name: 'Aptos Developer Documentation & Examples',
    p2_repo: 'https://github.com/aptos-labs/aptos-developer-docs'
  },
  {
    id: 'polkadot',
    name: 'Polkadot / Substrate',
    badge: 'Modular Relay Frameworks & ink! Rust',
    desc: 'Dedicated Polkadot & Substrate Developer Onboarding Path: Relay Frameworks & App Chains, Substrate Framework, ink! Rust Logic Engines, and Multi-Runtime Deployment.',
    architecture: 'Relay Chain & Parachain Shared Security, Substrate FRAME Architecture, XCM Interoperability',
    tooling: 'Rust, Substrate Framework, cargo-contract, ink! SDK, Polkadot-JS API, and Chopsticks',
    p1_name: 'Parity Substrate Framework',
    p1_repo: 'https://github.com/paritytech/substrate',
    p2_name: 'use-ink ink! Software Logic Engine',
    p2_repo: 'https://github.com/use-ink/ink'
  },
  {
    id: 'fullstack',
    name: 'Full Stack Distributed Systems',
    badge: 'Full-Stack Distributed Systems Architect Track',
    desc: 'Dedicated Full Stack Architecture Path: Next.js 14, Viem, Reactive Hooks, Indexing Pipelines, Distributed Storage, and Multi-Runtime Sandbox Verification.',
    architecture: 'Frontend Client (React/Next.js), Reactive Hooks, Indexing Pipelines, Distributed Storage, and Software Logic Protocols',
    tooling: 'Next.js 14, TypeScript, Viem, Wagmi v2, Ethers.js, Indexing Tools, and Foundry',
    p1_name: 'Full-Stack Distributed Starter Kit',
    p1_repo: 'https://github.com/scaffold-eth/scaffold-eth-2',
    p2_name: 'Reactive Data Hooks Kit',
    p2_repo: 'https://github.com/wevm/wagmi'
  }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  progress,
  loading,
  onSelectLevel,
  userId,
  token,
  onProgressUpdate,
  isLoggedIn = false,
}) => {
  const [switching, setSwitching] = useState(false);

  if (loading) {
    return (
      <div className="roadmap-loading">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="roadmap-skeleton" />
        ))}
      </div>
    );
  }

  const guestProgress: UserProgress = {
    user_id: 'guest',
    streak_days: 0,
    xp: 0,
    current_level: 1,
    overall_pct: 0,
    last_active: null,
    active_track: 'fundamentals',
    levels: [
      { level_id: 1, title: 'Distributed Systems Fundamentals', total_lessons: 5, completed_lessons: 0, is_unlocked: true, completed_at: null },
      { level_id: 2, title: 'Cryptographic Key & Session Management', total_lessons: 5, completed_lessons: 0, is_unlocked: false, completed_at: null },
      { level_id: 3, title: 'System Architecture & Logic Engines', total_lessons: 5, completed_lessons: 0, is_unlocked: false, completed_at: null },
      { level_id: 4, title: 'Automated Financial Systems Architecture', total_lessons: 5, completed_lessons: 0, is_unlocked: false, completed_at: null },
      { level_id: 5, title: 'Decentralized Governance & Protocol Design', total_lessons: 5, completed_lessons: 0, is_unlocked: false, completed_at: null },
      { level_id: 6, title: 'Enterprise FinTech Architecture', total_lessons: 5, completed_lessons: 0, is_unlocked: false, completed_at: null },
      { level_id: 7, title: 'High-Throughput Distributed Runtimes', total_lessons: 5, completed_lessons: 0, is_unlocked: false, completed_at: null },
    ],
    quiz_attempts: [],
    exercises_submitted: [],
    certificates: [],
  };

  const effectiveProgress = progress || (!isLoggedIn ? guestProgress : null);

  if (!effectiveProgress) {
    return <div className="roadmap-error">Failed to load roadmap. Is the backend running?</div>;
  }

  const activeTrackId = effectiveProgress.active_track || 'ethereum';
  const selectedEco = ECOSYSTEMS.find(e => e.id === activeTrackId) || ECOSYSTEMS[0];

  const totalLessonsInTrack = effectiveProgress.levels.reduce((acc, l) => acc + (l.total_lessons || 0), 0);
  const completedLessonsInTrack = effectiveProgress.levels.reduce((acc, l) => acc + (l.completed_lessons || 0), 0);
  const levelsCompleteInTrack = effectiveProgress.levels.filter(l => l.completed_lessons >= l.total_lessons && l.total_lessons > 0).length;
  const currentOverallPct = totalLessonsInTrack > 0 ? Math.round((completedLessonsInTrack / totalLessonsInTrack) * 100) : 0;
  const trackLevelCount = effectiveProgress.levels.length || 5;

  const activeTrackDisplayName = isLoggedIn
    ? activeTrackId
    : activeTrackId === 'solana'
    ? 'High-Performance Engine'
    : (SYLLABUS_COMPLIANCE_MAP[activeTrackId] || activeTrackId);

  return (
    <div className="roadmap">
      {/* Hero */}
      <div className="roadmap__hero">
        <h2 className="roadmap__hero-title">
          {isLoggedIn ? 'Your Web3' : 'Your Distributed Systems'} <span className="gradient-text">Learning Journey</span>
        </h2>
        <p className="roadmap__hero-desc">
          {trackLevelCount} progressive {trackLevelCount === 1 ? 'module' : 'modules'} covering {isLoggedIn ? selectedEco.name : (SYLLABUS_COMPLIANCE_MAP[selectedEco.id] || selectedEco.name)} fundamentals, architecture, logic protocols, testing, and verified deployment.
        </p>
        <div className="roadmap__hero-stats">
          <div className="roadmap__hero-stat">
            <span className="roadmap__hero-stat-val">{currentOverallPct}%</span>
            <span className="roadmap__hero-stat-lbl">Overall Progress</span>
          </div>
          <div className="roadmap__hero-stat">
            <span className="roadmap__hero-stat-val">
              {levelsCompleteInTrack}
            </span>
            <span className="roadmap__hero-stat-lbl">Levels Complete</span>
          </div>
          <div className="roadmap__hero-stat">
            <span className="roadmap__hero-stat-val">
              {completedLessonsInTrack}
            </span>
            <span className="roadmap__hero-stat-lbl">Lessons Done</span>
          </div>
        </div>
      </div>

      {/* Ecosystem Track Switcher */}
      <div className="roadmap__track-switcher glass animate-fade-up">
        <div className="track-switcher__header">
          <div>
            <h3 className="track-switcher__title">
              {isLoggedIn ? 'Active Ecosystem Learning Track' : 'Active Architecture Learning Track'}
            </h3>
            <p className="track-switcher__subtitle">
              Select an architecture track to customize your curriculum. Currently active: <strong style={{ color: 'var(--clr-primary-light)', textTransform: 'capitalize' }}>{activeTrackDisplayName}</strong>
            </p>
          </div>
        </div>

        <div className="track-switcher__grid">
          {ECOSYSTEMS.map((eco) => {
            const isActive = eco.id === activeTrackId;
            const cardLabel = isLoggedIn ? eco.name : (SYLLABUS_COMPLIANCE_MAP[eco.id] || eco.name);

            return (
              <button
                key={eco.id}
                className={`track-btn ${isActive ? 'track-btn--active' : ''}`}
                disabled={switching}
                onClick={async () => {
                  if (isActive || switching) return;
                  try {
                    setSwitching(true);
                    const updated = await postActiveTrack(userId, eco.id, token);
                    onProgressUpdate(updated);
                  } catch (err) {
                    console.error("Error switching ecosystem track:", err);
                  } finally {
                    setSwitching(false);
                  }
                }}
              >
                <span className="track-btn__icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                  {CHAIN_LOGOS[eco.id]}
                </span>
                <span className="track-btn__name">{cardLabel}</span>
                {isActive && <span className="track-btn__badge">Active</span>}
              </button>
            );
          })}
        </div>

        {selectedEco && (
          <div className="track-overview animate-fade-in" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
            <div className="track-overview__header" style={{ marginBottom: '12px' }}>
              <div className="track-overview__title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 800, color: '#fff', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{CHAIN_LOGOS[selectedEco.id]}</span>
                <span>
                  {isLoggedIn
                    ? `Dedicated ${selectedEco.name} Learning Path`
                    : selectedEco.id === 'solana'
                    ? 'Dedicated High-Performance Learning Path'
                    : `Dedicated ${SYLLABUS_COMPLIANCE_MAP[selectedEco.id] || selectedEco.name} Learning Path`}
                </span>
                <span className="badge badge--primary" style={{ fontSize: '0.65rem', padding: '3px 8px', marginLeft: 'auto' }}>
                  {isLoggedIn
                    ? selectedEco.badge
                    : selectedEco.id === 'solana'
                    ? 'High-Throughput Parallel Systems Engine'
                    : selectedEco.badge}
                </span>
              </div>
            </div>
            
            <p className="track-overview__desc" style={{ fontSize: '0.88rem', color: 'var(--clr-text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              {isLoggedIn
                ? selectedEco.desc
                : selectedEco.id === 'solana'
                ? 'Dedicated Systems Developer Onboarding Path: Sealevel Parallel Processing Logic, Proof-of-Sequence Validation, Structured Compilation Frameworks, and Programmatically Derived Storage Addresses.'
                : selectedEco.desc}
            </p>

            {/* Dedicated Chain Learning Details Block */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>⚙️ Dedicated Architecture & Consensus</span>
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                  {isLoggedIn
                    ? selectedEco.architecture
                    : sanitizeComplianceText(selectedEco.architecture, false)}
                </span>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#c084fc', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>🛠️ Dedicated Developer Tooling Chain</span>
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                  {isLoggedIn
                    ? selectedEco.tooling
                    : sanitizeComplianceText(selectedEco.tooling, false)}
                </span>
              </div>
            </div>
            
            <div className="multichain-grid">
              <div className="multichain-card">
                <span className="multichain-card__icon">📖</span>
                <div>
                  <h5 className="multichain-card__title">5 Dedicated Learning Modules</h5>
                  <p className="multichain-card__sub">
                    {isLoggedIn
                      ? `${selectedEco.name} Architecture, Tooling, Smart Contracts, Full-Stack SDK & Testnet Deployment`
                      : `${activeTrackDisplayName} Architecture, Tooling, System Logic Protocols, Cloud SDK & Deployment`}
                  </p>
                </div>
              </div>
              <div className="multichain-card">
                <span className="multichain-card__icon">❓</span>
                <div>
                  <h5 className="multichain-card__title">30 Interactive Quiz Questions</h5>
                  <p className="multichain-card__sub">6 Rigorous Concept Checks & Architectural Evaluations per Module (30 Total)</p>
                </div>
              </div>
              <div className="multichain-card">
                <span className="multichain-card__icon">💻</span>
                <div>
                  <h5 className="multichain-card__title">5 Live Coding & Deployment Challenges</h5>
                  <p className="multichain-card__sub">
                    {isLoggedIn
                      ? `${selectedEco.name} Smart Contract Execution, Verification & Live Testnet Deployment`
                      : `${activeTrackDisplayName} System Logic Execution, Verification & Sandbox Deployment`}
                  </p>
                </div>
              </div>
              <div className="multichain-card">
                <span className="multichain-card__icon">🏆</span>
                <div>
                  <h5 className="multichain-card__title">1 Verified Ecosystem Certificate</h5>
                  <p className="multichain-card__sub">
                    {isLoggedIn
                      ? `Verifiable Credential matching official ${selectedEco.name} Grant Benchmark Standards`
                      : `Verifiable Credential matching official ${activeTrackDisplayName} Benchmark Standards`}
                  </p>
                </div>
              </div>
              <div className="multichain-card">
                <span className="multichain-card__icon">🛠️</span>
                <div>
                  <h5 className="multichain-card__title">Official Starter Projects & GitHub Repos</h5>
                  <p className="multichain-card__sub">Bespoke starter codebases for {isLoggedIn ? selectedEco.name : activeTrackDisplayName}:</p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <a href={isLoggedIn ? selectedEco.p1_repo : 'https://github.com'} target="_blank" rel="noopener noreferrer" className="multichain-repo-btn">
                      🐱 {selectedEco.p1_name} ↗
                    </a>
                    <a href={isLoggedIn ? selectedEco.p2_repo : 'https://github.com'} target="_blank" rel="noopener noreferrer" className="multichain-repo-btn">
                      🐱 {selectedEco.p2_name} ↗
                    </a>
                  </div>
                </div>
              </div>
              <div className="multichain-card">
                <span className="multichain-card__icon">🤖</span>
                <div>
                  <h5 className="multichain-card__title">24/7 AI Mentor Support</h5>
                  <p className="multichain-card__sub">OpenClaw (Education Guidance) & Hermes (Engineering Code Review)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level cards */}
      <div className="roadmap__levels">
        {effectiveProgress.levels.map((level, idx) => (
          <LevelCard
            key={level.level_id}
            level={level}
            isLast={idx === effectiveProgress.levels.length - 1}
            onSelect={() => onSelectLevel(level.level_id)}
          />
        ))}
      </div>

      {/* Build With MOR Section */}
      <div className="roadmap__build-mor glass">
        <h3 className="build-mor__title">Build With MOR</h3>
        <p className="build-mor__desc">
          Explore practical build targets and application blueprints using the MOR Finance developer toolkits.
        </p>
        <div className="build-mor__grid">
          {[
            { title: isLoggedIn ? 'Smart Contracts' : 'Logic Architectures', icon: '📝' },
            { title: isLoggedIn ? 'dApps Frameworks' : 'Application Frameworks', icon: '🌐' },
            { title: 'Developer Toolkits', icon: '🛠️' },
          ].map((item) => (
            <div key={item.title} className="build-mor__card">
              <span className="build-mor__card-icon">{item.icon}</span>
              <h4 className="build-mor__card-title">{item.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
