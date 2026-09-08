// ─── HeadLayoutMeta component — manages document head title and meta tags ───
import React, { useEffect } from 'react';
import type { NavPage } from '../../types';

export interface HeadLayoutMetaProps {
  isLoggedIn: boolean;
  activePage?: NavPage;
}

const PAGE_TITLES: Record<NavPage, string> = {
  academy: 'Web3 Curriculum & Roadmap',
  roadmap: 'Web3 Curriculum & Roadmap',
  dashboard: 'Developer Dashboard',
  analytics: 'Cohort Analytics',
  sandbox: 'Multi-Chain Web3 Sandbox IDE',
  forum: 'Developer Forum',
  hackathons: 'Web3 Hackathons & Grants',
  careers: 'Web3 Career Portal',
  mentor: 'AI Mentor Workspace',
  certificates: 'Web3 Developer Credentials',
  subscriptions: 'Subscription Plans',
  about: 'About MOR Academy',
};

export const HeadLayoutMeta: React.FC<HeadLayoutMetaProps> = ({ isLoggedIn, activePage }) => {
  useEffect(() => {
    // 1. Update document title
    const baseTitle = 'MOR Developer Academy';
    if (activePage && PAGE_TITLES[activePage]) {
      document.title = `${PAGE_TITLES[activePage]} — ${baseTitle}`;
    } else {
      document.title = `${baseTitle} — Master Web3 Engineering & Multi-Chain Smart Contracts`;
    }

    // Helper to safely set or create meta tags
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Update meta description
    const descContent = 'Master Web3 Engineering & Multi-Chain Smart Contract Architecture. Learn Solidity, Rust, Cairo, Move, and ink! on Ethereum, Arbitrum, Base, Optimism, Solana, Starknet, Aptos, and Polkadot.';
    setMetaTag('name', 'description', descContent);

    // 3. Update meta keywords
    const keywordsContent = 'Web3 Developer Academy, Smart Contracts, Solidity, Rust, Cairo, Move, ink!, Ethereum, Arbitrum, Optimism, Base, Solana, Starknet, Aptos, Polkadot, DeFi, dApps';
    setMetaTag('name', 'keywords', keywordsContent);

    // 4. Update OpenGraph tags
    const ogTitleContent = activePage && PAGE_TITLES[activePage]
      ? `${PAGE_TITLES[activePage]} — ${baseTitle}`
      : `${baseTitle} — Master Web3 Engineering & Multi-Chain Smart Contracts`;
    setMetaTag('property', 'og:title', ogTitleContent);
    setMetaTag('property', 'og:description', descContent);

  }, [isLoggedIn, activePage]);

  return null;
};

export default HeadLayoutMeta;
