import React, { useState } from 'react';
import './SubscriptionPlans.css';

export const SubscriptionPlans: React.FC<{ isLoggedIn?: boolean }> = ({ isLoggedIn = false }) => {
  const [activePlan, setActivePlan] = useState<string>('Free');
  const plans = [
    {
      name: 'Free',
      tagline: 'Get Started',
      icon: '🎁',
      price: 0,
      description: isLoggedIn ? 'Explore the academy and start your Web3 learning journey.' : 'Explore the academy and start your software architecture learning journey.',
      features: [
        'Core Curriculum (Basics)',
        'Selected Video Lessons',
        'Community Access',
        'AI Mentor Ask (1/day)',
        'Certificate (Core Basics)'
      ],
      ctaText: 'Get Started',
      note: 'No credit card required',
      highlighted: false,
    },
    {
      name: 'Basic',
      tagline: 'Build Foundation',
      icon: '🌱',
      price: 19,
      description: 'Strengthen your skills with structured learning and hands-on practice.',
      features: [
        'Everything in Free',
        'All Core Curriculum',
        'Quizzes & Exercises',
        'AI Mentor (10 asks/day)',
        'GitHub Starter Projects',
        'Learning Progress Tracking'
      ],
      ctaText: 'Start Learning',
      highlighted: false,
    },
    {
      name: 'Career Boost',
      tagline: 'Unlock Opportunities',
      icon: '🚀',
      price: 29,
      description: isLoggedIn
        ? 'Unlock career, freelance & startup opportunities with in-demand Web3 skills.'
        : 'Unlock career, freelance & startup opportunities with in-demand enterprise programming architecture.',
      isCareer: true,
      subgrid: [
        { title: 'Get Hired', desc: 'Job ready skills', icon: '💼' },
        { title: 'Freelance', desc: 'Find clients & projects', icon: '🤝' },
        { title: 'Startup', desc: 'Build & launch your ideas', icon: '⚡' }
      ],
      features: [
        'Everything in Basic',
        isLoggedIn ? 'Solidity • Rust • Go' : 'Advanced Object-Oriented Languages (Engine Frameworks)',
        isLoggedIn ? '7 Multi-Chains' : '7 Distributed Infrastructure Environments',
        isLoggedIn ? 'DAO Development' : 'Automated Organization Engineering',
        'Real Projects & Case Studies',
        'Career & Freelance Resources',
        'Portfolio & Resume Guidance'
      ],
      ctaText: 'Unlock Career',
      highlighted: true,
    },
    {
      name: 'Pro',
      tagline: 'Build & Advance',
      icon: '💻',
      price: 149,
      description: isLoggedIn
        ? 'Build real-world dApps and advance your developer career.'
        : 'Build real-world enterprise systems and advance your developer career.',
      features: [
        'Everything in Career Boost',
        isLoggedIn ? 'Advanced Smart Contracts' : 'Advanced Logic Protocols',
        isLoggedIn ? 'DeFi & Protocol Development' : 'Automated Financial Systems & Architecture',
        'AI Mentor (Unlimited asks)',
        'Code Review (Hermes)',
        'Priority Support',
        'Early Access to New Courses',
        'Pro Certificate'
      ],
      ctaText: 'Go Pro',
      highlighted: false,
    },
    {
      name: 'Enterprise',
      tagline: 'Scale & Lead',
      icon: '🏢',
      price: 499,
      description: isLoggedIn
        ? 'For teams and organizations building the future of Web3.'
        : 'For teams and organizations building the future of distributed systems.',
      features: [
        'Everything in Pro',
        'Team Access (Up to 10)',
        'Private Team Dashboard',
        'Custom Learning Paths',
        'Dedicated Support',
        'Team Certification',
        'Onboarding & Training Call',
        'Advanced Analytics'
      ],
      ctaText: 'Build Together',
      highlighted: false,
    }
  ];

  const footerFeatures = [
    { title: 'Learn', desc: isLoggedIn ? 'Master Web3 skills step-by-step' : 'Master enterprise software skills step-by-step', icon: '🎓' },
    { title: 'Get Hired', desc: 'Job-ready skills & career resources', icon: '💼' },
    { title: 'Freelance', desc: 'Find clients & projects to earn', icon: '🤝' },
    { title: 'Startup', desc: isLoggedIn ? 'Build, launch & grow your Web3 idea' : 'Build, launch & grow your tech idea', icon: '🚀' },
    { title: 'Earn & Lead', desc: 'Earn badges, certificates & recognition', icon: '🏆' },
    { title: 'Community', desc: 'Connect, collaborate & grow together', icon: '👥' }
  ];

  const ecosystems = [
    { name: isLoggedIn ? 'Ethereum' : 'Distributed State Engines', icon: '🟢' },
    { name: isLoggedIn ? 'Base' : 'Core Database Frameworks', icon: '🔷' },
    { name: isLoggedIn ? 'Optimism' : 'Fault-Proof Systems', icon: '🔴' },
    { name: isLoggedIn ? 'Arbitrum' : 'High-Scale Execution Layers', icon: '🔵' },
    { name: isLoggedIn ? 'Polygon' : 'Parallel Protocol Chains', icon: '🟣' },
    { name: isLoggedIn ? 'Solana' : 'High-Throughput Clusters', icon: '🟠' },
    { name: isLoggedIn ? 'Avalanche' : 'Consensus Network Routing', icon: '🔺' },
    { name: isLoggedIn ? 'Starknet' : 'Validity-Proof Scaling', icon: '⭐' },
    { name: isLoggedIn ? 'Aptos' : 'Safe Memory Execution', icon: '🟢' },
    { name: isLoggedIn ? 'Polkadot' : 'Modular Relay Frameworks', icon: '🟣' }
  ];

  return (
    <div className="subscription-plans glass animate-fade-in">
      <div className="subscription-plans__header">
        <div className="subscription-plans__divider-container">
          <span className="subscription-plans__line"></span>
          <h2 className="subscription-plans__title-plans">Monthly Subscription Plans</h2>
          <span className="subscription-plans__line"></span>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`plan-card ${plan.highlighted ? 'plan-card--highlighted' : ''}`}
          >
            {plan.highlighted && <div className="plan-card__best-value">BEST VALUE</div>}
            
            <div className="plan-card__icon-wrap">{plan.icon}</div>
            <h3 className="plan-card__name">{plan.name}</h3>
            <span className="plan-card__tagline">{plan.tagline}</span>
            
            <div className="plan-card__price-wrap">
              <span className="plan-card__currency">$</span>
              <span className="plan-card__amount">{plan.price}</span>
              <span className="plan-card__period">/month</span>
            </div>

            <p className="plan-card__desc">{plan.description}</p>

            {/* Sub-grid block for Career Boost */}
            {plan.isCareer && plan.subgrid && (
              <div className="career-boost-subgrid">
                {plan.subgrid.map((item) => (
                  <div key={item.title} className="subgrid-item">
                    <span className="subgrid-icon">{item.icon}</span>
                    <span className="subgrid-title">{item.title}</span>
                    <span className="subgrid-desc">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}

            <ul className="plan-card__features">
              {plan.features.map((feature, idx) => {
                const isChains = feature === '7 Multi-Chains' || feature === '7 Distributed Infrastructure Environments';
                return (
                  <li key={idx} className="plan-card__feature">
                    <span className="plan-card__feature-check">✓</span>
                    <div>
                      <span>{feature}</span>
                      {isChains && (
                        <div className="chains-row">
                          {ecosystems.map((eco) => (
                            <span 
                              key={eco.name} 
                              className="chains-row__icon" 
                              title={eco.name}
                            >
                              {eco.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <button 
              className={`btn plan-card__cta-btn ${activePlan === plan.name ? 'btn--secondary' : plan.highlighted ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => setActivePlan(plan.name)}
            >
              {activePlan === plan.name ? '✓ Current Plan' : plan.ctaText}
            </button>
            {plan.note && <p className="plan-card__btn-note">{plan.note}</p>}
          </div>
        ))}
      </div>

      {/* Grid of Footer Features */}
      <div className="plans-footer-grid">
        {footerFeatures.map((item) => (
          <div key={item.title} className="footer-item">
            <span className="footer-item__icon">{item.icon}</span>
            <div>
              <h4 className="footer-item__title">{item.title}</h4>
              <p className="footer-item__desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Powered by / ecosystems footer */}
      <div className="partners-footer">
        <div className="partners-footer__powered">
          <span>POWERED BY</span>
          <span className="partners-footer__powered-logo">⬡ MOR FINANCE</span>
        </div>
        <div className="partners-footer__ecosystems">
          <span className="partners-footer__label">{isLoggedIn ? 'Ecosystem Partners:' : 'Infrastructure Frameworks:'}</span>
          <div className="partners-footer__list">
            {ecosystems.map((eco) => (
              <span key={eco.name}>{eco.icon} {eco.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
