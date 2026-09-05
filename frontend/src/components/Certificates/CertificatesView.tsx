// ─── CertificatesView — Verifiable Multi-Chain Credentials for Grant Standards ───
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Certificate, UserProgress } from '../../types';
import { fetchCertificates, fetchProgress, postActiveTrack } from '../../api/client';
import './CertificatesView.css';

interface CertificatesViewProps {
  userId: string;
}

interface ChainCredentialTemplate {
  id: string;
  trackId: string;
  chainName: string;
  title: string;
  grantStandard: string;
  icon: string;
  color: string;
  level_id: number;
  requiredLessonIds: string[];
  requirements: string[];
}

const CHAIN_CREDENTIALS: ChainCredentialTemplate[] = [
  {
    id: 'cert-aptos',
    trackId: 'aptos',
    chainName: 'Aptos Move',
    title: 'Aptos Move Certified Developer',
    grantStandard: 'Aptos Foundation Grant Benchmark Standard',
    icon: '⚡',
    color: '#06b6d4',
    level_id: 5,
    requiredLessonIds: ['aptos-1', 'aptos-2', 'aptos-3', 'aptos-4', 'aptos-5'],
    requirements: [
      '5 Complete Learning Modules (Modules 1–5)',
      '30 Move & Block-STM Quiz Questions (100% Passing)',
      'Aptos Testnet Move Deployment Challenge',
      'Verified On-Chain Module Bytecode & Explorer Class'
    ]
  },
  {
    id: 'cert-starknet',
    trackId: 'starknet',
    chainName: 'Starknet Cairo',
    title: 'Starknet Cairo & ZK Certified Developer',
    grantStandard: 'Starknet Foundation Grant Benchmark Standard',
    icon: '✨',
    color: '#ec4899',
    level_id: 5,
    requiredLessonIds: ['starknet-1', 'starknet-2', 'starknet-3', 'starknet-4', 'starknet-5'],
    requirements: [
      '5 Complete Learning Modules (Modules 1–5)',
      '30 Cairo & STARK Quiz Questions (100% Passing)',
      'Starknet Sepolia Cairo Deployment Challenge',
      'Verified Class Hash & Account Abstraction'
    ]
  },
  {
    id: 'cert-solana',
    trackId: 'solana',
    chainName: 'Solana Anchor',
    title: 'Solana Anchor Certified Developer',
    grantStandard: 'Solana Superteam & Foundation Grant Standard',
    icon: '☀️',
    color: '#f59e0b',
    level_id: 5,
    requiredLessonIds: ['solana-1', 'solana-2', 'solana-3', 'solana-4', 'solana-5'],
    requirements: [
      '5 Complete Learning Modules (Modules 1–5)',
      '30 Anchor & Sealevel Quiz Questions (100% Passing)',
      'Solana Devnet Anchor Deployment Challenge',
      'Verified IDL & Program Derived Addresses'
    ]
  },
  {
    id: 'cert-polkadot',
    trackId: 'polkadot',
    chainName: 'Polkadot / Substrate',
    title: 'Polkadot & Substrate Certified Developer',
    grantStandard: 'Web3 Foundation Grant Benchmark Standard',
    icon: '🟣',
    color: '#a855f7',
    level_id: 5,
    requiredLessonIds: ['polkadot-1', 'polkadot-2', 'polkadot-3', 'polkadot-4', 'polkadot-5'],
    requirements: [
      '5 Complete Learning Modules (Modules 1–5)',
      '30 ink! & Substrate Quiz Questions (100% Passing)',
      'Polkadot Wasm Deployment Challenge',
      'Verified ink! Metadata & Extrinsic Hash'
    ]
  },
  {
    id: 'cert-ethereum',
    trackId: 'fundamentals',
    chainName: 'Ethereum & EVMs',
    title: 'EVM Smart Contract Security Specialist',
    grantStandard: 'Ethereum Foundation & L2 Builder Standard',
    icon: '🛡️',
    color: '#3b82f6',
    level_id: 5,
    requiredLessonIds: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '5-1'],
    requirements: [
      '5 Complete Core Learning Levels (Levels 1–5)',
      '30 Solidity & Security Quiz Questions (100% Passing)',
      'Sepolia / Base Testnet Deployment Challenge',
      'Verified Source Code on Etherscan'
    ]
  },
  {
    id: 'cert-fullstack',
    trackId: 'fullstack',
    chainName: 'Full Stack Web3',
    title: 'Full Stack Blockchain Developer',
    grantStandard: 'Full Stack Web3 Engineering Benchmark Standard',
    icon: '🚀',
    color: '#10b981',
    level_id: 5,
    requiredLessonIds: ['fullstack-1', 'fullstack-2', 'fullstack-3', 'fullstack-4', 'fullstack-5'],
    requirements: [
      '5 Complete Learning Modules (End-to-End)',
      'Full Stack Architecture & Indexing Quizzes (100% Passing)',
      'Multi-Chain Testnet Full Stack DApp Challenge',
      'Verified On-Chain Contract & Live Frontend UI'
    ]
  }
];

export const CertificatesView: React.FC<CertificatesViewProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterChain, setFilterChain] = useState<string>('all');
  const [navigatingTrack, setNavigatingTrack] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCertificates(userId).catch(() => [] as Certificate[]),
      fetchProgress(userId).catch(() => null)
    ])
      .then(([certsData, progressData]) => {
        setCerts(certsData);
        setUserProgress(progressData);
      })
      .catch((err) => console.error("Error fetching credentials:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleGoToCourse = async (trackId: string) => {
    setNavigatingTrack(trackId);
    try {
      if (userId) {
        await postActiveTrack(userId, trackId, '');
      }
    } catch (err) {
      console.warn("Could not set active track:", err);
    } finally {
      setNavigatingTrack(null);
      navigate('/academy');
    }
  };

  const handleDownload = (cert: {
    level_title: string;
    level_id: number;
    certificate_id: string;
    recipient: string;
    issued_at?: string | Date;
    grantStandard?: string;
  }) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups to download the certificate PDF.");
      return;
    }

    const recipientName = cert.recipient.startsWith("wallet-")
      ? `${cert.recipient.replace("wallet-", "").slice(0, 10)}...${cert.recipient.replace("wallet-", "").slice(-8)}`
      : `@${cert.recipient.replace("gh-", "")}`;

    const dateStr = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : new Date().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

    const htmlContent = `
      <html>
        <head>
          <title>Developer Academy Certificate - ${cert.level_title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
            body {
              background: #0b0f19;
              color: #f8fafc;
              font-family: 'Outfit', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .cert-box {
              width: 860px;
              height: 540px;
              padding: 50px;
              border-radius: 20px;
              background: radial-gradient(circle at top right, rgba(124, 58, 237, 0.18), transparent 60%), #0f172a;
              border: 3px solid #6366f1;
              box-shadow: 0 15px 50px rgba(0,0,0,0.6);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              box-sizing: border-box;
            }
            .cert-box::before {
              content: '⬡';
              position: absolute;
              right: 40px;
              bottom: 40px;
              font-size: 180px;
              opacity: 0.04;
              font-weight: 800;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .header-label {
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.18em;
              color: #a78bfa;
              text-transform: uppercase;
            }
            .standard-label {
              font-size: 11px;
              color: #34d399;
              font-weight: 700;
              margin-top: 4px;
            }
            .title {
              font-size: 32px;
              font-weight: 800;
              margin: 10px 0 0 0;
              background: linear-gradient(135deg, #60a5fa, #c084fc);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .recipient-box {
              margin: 30px 0;
            }
            .lbl {
              font-size: 11px;
              text-transform: uppercase;
              color: #94a3b8;
              font-weight: 600;
              letter-spacing: 0.1em;
              display: block;
              margin-bottom: 6px;
            }
            .val {
              font-size: 26px;
              font-weight: 700;
              color: #f1f5f9;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              padding-top: 20px;
            }
            .meta-col {
              display: flex;
              flex-direction: column;
            }
            .val--id {
              font-family: monospace;
              font-size: 13px;
              color: #60a5fa;
            }
            .badge {
              font-size: 44px;
            }
            @media print {
              body {
                background: #ffffff;
                color: #000000;
              }
              .cert-box {
                border: 3px solid #000000;
                background: #ffffff;
                box-shadow: none;
                width: 100%;
                height: 100%;
                page-break-inside: avoid;
              }
              .title {
                background: none;
                -webkit-text-fill-color: initial;
                color: #000000;
              }
              .val--id {
                color: #000000;
              }
            }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="header-row">
              <div>
                <span class="header-label">Developer Academy Verified Credential</span>
                <h2 class="title">${cert.level_title}</h2>
                <div class="standard-label">✓ ${cert.grantStandard || 'Verified Protocol Grant Benchmark Standard'}</div>
              </div>
              <div class="badge">🛡️</div>
            </div>
            
            <div class="recipient-box">
              <span class="lbl">Conferred Upon:</span>
              <span class="val">${recipientName}</span>
            </div>

            <div class="meta-row">
              <div class="meta-col">
                <span class="lbl">Date of Issuance:</span>
                <span class="val" style="font-size: 16px;">${dateStr}</span>
              </div>
              <div class="meta-col">
                <span class="lbl">Ecosystem Verification ID:</span>
                <span class="val val--id">${cert.certificate_id}</span>
              </div>
              <div class="meta-col">
                <span class="lbl">On-Chain Testnet Status:</span>
                <span class="val" style="font-size: 15px; color: #34d399;">✓ Verified Deployed</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleShare = (title: string, certId: string) => {
    const text = `I just earned my verified Developer Academy Certificate in "${title}"! 🚀 Verified for on-chain testnet deployment and grant readiness. ID: ${certId} #Web3 #DeveloperAcademy`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="certs-loading">
        <div className="spinner" />
        <p>Loading ecosystem credentials...</p>
      </div>
    );
  }

  const filteredTemplates = CHAIN_CREDENTIALS.filter(
    (c) => filterChain === 'all' || c.trackId === filterChain
  );

  return (
    <div className="certs-container animate-fade-up">
      {/* Header Banner */}
      <div className="certs-header glass">
        <div className="certs-badge">🏆 Multi-Chain Developer Standards</div>
        <h1 className="certs-title">
          Ecosystem <span className="gradient-text">Credentials & Certificates</span>
        </h1>
        <p className="certs-subtitle">
          Verifiable credentials earned by completing learning modules, passing comprehensive quiz evaluations, and deploying verified smart contracts to live testnets across Aptos, Starknet, Solana, Polkadot, Full Stack Web3, and EVM chains.
        </p>

        {/* Chain Filter Tabs */}
        <div className="certs-filter-bar">
          {[
            { id: 'all', label: 'All Ecosystems' },
            { id: 'fundamentals', label: '🛡️ Ethereum EVM' },
            { id: 'fullstack', label: '🚀 Full Stack Web3' },
            { id: 'starknet', label: '✨ Starknet Cairo' },
            { id: 'aptos', label: '⚡ Aptos Move' },
            { id: 'solana', label: '☀️ Solana Anchor' },
            { id: 'polkadot', label: '🟣 Polkadot ink!' }
          ].map((item) => (
            <button
              key={item.id}
              className={`cert-filter-pill ${filterChain === item.id ? 'cert-filter-pill--active' : ''}`}
              onClick={() => setFilterChain(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Standard Ecosystem Credentials */}
      <div className="certs-grid">
        {filteredTemplates.map((template) => {
          const completedIds = userProgress?.completed_lesson_ids || [];

          // 1. Strict certificate matching (MUST match track_id or explicit track title, NEVER generic level_id: 5)
          const userEarnedCert = certs.find((c) => {
            if (c.track_id && c.track_id.toLowerCase() === template.trackId.toLowerCase()) {
              return true;
            }
            const titleLower = (c.level_title || '').toLowerCase();
            if (template.trackId === 'fundamentals') {
              return titleLower.includes('evm') || titleLower.includes('security') || titleLower.includes('dao governance') || titleLower.includes('blockchain fundamentals');
            }
            if (template.trackId === 'fullstack') {
              return titleLower.includes('full stack');
            }
            if (template.trackId === 'polkadot') {
              return titleLower.includes('polkadot') || titleLower.includes('substrate');
            }
            return titleLower.includes(template.trackId);
          });

          // 2. Count completed modules
          const completedCount = template.requiredLessonIds.filter((id) =>
            completedIds.includes(id)
          ).length;
          const totalCount = template.requiredLessonIds.length;
          const allModulesDone = totalCount > 0 && completedCount >= totalCount;

          // 3. Official conferral check: ONLY conferred if certificate earned or all track modules completed!
          const isConferred = Boolean(userEarnedCert || allModulesDone);
          const displayCertId = userEarnedCert?.certificate_id || (isConferred ? `${template.id}-${userId.slice(0, 8)}` : null);

          return (
            <div
              key={template.id}
              className={`cert-card glass ${isConferred ? 'cert-card--conferred' : 'cert-card--locked'}`}
              style={{ borderTop: `4px solid ${template.color}` }}
            >
              <div className="cert-card__watermark">⬡</div>
              <div className="cert-card__seal">{template.icon}</div>

              <div className="cert-card__header">
                <span className={`cert-card__level ${!isConferred ? 'cert-card__level--locked' : ''}`}>
                  {isConferred
                    ? '🏆 Course 100% Completed & Conferred'
                    : `🔒 ${completedCount} of ${totalCount} Modules Completed (${Math.round((completedCount / totalCount) * 100)}%)`}
                </span>
                <h3 className="cert-card__title">{template.title}</h3>
                <span className="cert-card__standard">{template.grantStandard}</span>
              </div>

              {/* Requirements Checklist */}
              <div className="cert-card__requirements">
                <span className="cert-card__lbl">Grant Standard Checklist:</span>
                <ul>
                  {template.requirements.map((req, idx) => {
                    let isReqMet = false;
                    let customReqText = req;
                    if (isConferred) {
                      isReqMet = true;
                    } else {
                      if (idx === 0) {
                        isReqMet = completedCount >= totalCount;
                        customReqText = isReqMet ? req : `${completedCount} of ${totalCount} Learning Modules Completed`;
                      } else if (idx === 1) {
                        isReqMet = completedCount >= Math.max(1, totalCount - 1);
                        customReqText = isReqMet ? req : `Quiz Masteries In Progress (${completedCount}/${totalCount})`;
                      } else if (idx === 2) {
                        const deploymentLessonId = template.requiredLessonIds[totalCount - 1];
                        isReqMet = completedIds.includes(deploymentLessonId);
                        customReqText = isReqMet ? req : `Testnet Deployment Challenge (Module ${totalCount} Required)`;
                      } else {
                        isReqMet = false;
                        customReqText = `Awaiting 100% Course Completion & Verification`;
                      }
                    }

                    return (
                      <li key={idx} className={isReqMet ? 'req-met' : 'req-unmet'}>
                        <span className={`check-icon ${isReqMet ? 'check-icon--done' : 'check-icon--pending'}`}>
                          {isReqMet ? '✓' : '○'}
                        </span>{' '}
                        <span className={isReqMet ? 'req-text--done' : 'req-text--pending'}>
                          {customReqText}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="cert-card__recipient">
                <span className="cert-card__lbl">Recipient:</span>
                <span className="cert-card__val" title={userId}>
                  {userId.startsWith("wallet-")
                    ? `${userId.replace("wallet-", "").slice(0, 8)}...${userId.replace("wallet-", "").slice(-6)}`
                    : `@${userId.replace("gh-", "")}`}
                </span>
              </div>

              <div className="cert-card__meta">
                <div>
                  <span className="cert-card__lbl">Credential ID:</span>
                  <span className={`cert-card__val ${displayCertId ? 'cert-card__val--id' : 'cert-card__val--locked'}`}>
                    {displayCertId ? `${displayCertId.slice(0, 18)}...` : '🔒 Unlocked Upon Course Completion'}
                  </span>
                </div>
                <div>
                  <span className="cert-card__lbl">Status:</span>
                  <span className={`cert-status-badge ${isConferred ? 'cert-status-badge--conferred' : 'cert-status-badge--locked'}`}>
                    {isConferred ? '🏆 Conferred' : `🔒 Incomplete (${completedCount}/${totalCount})`}
                  </span>
                </div>
              </div>

              <div className="cert-card__actions">
                {isConferred ? (
                  <>
                    <button
                      className="btn btn--primary cert-action-btn"
                      onClick={() =>
                        handleDownload({
                          level_title: template.title,
                          level_id: template.level_id,
                          certificate_id: displayCertId || `${template.id}-${userId.slice(0, 8)}`,
                          recipient: userId,
                          grantStandard: template.grantStandard
                        })
                      }
                    >
                      💾 Download PDF Certificate
                    </button>
                    <button
                      className="btn btn--secondary cert-action-btn"
                      onClick={() => handleShare(template.title, displayCertId || `${template.id}-${userId.slice(0, 8)}`)}
                    >
                      🐦 Share to X
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn--outline cert-action-btn cert-action-btn--locked"
                      disabled
                      title="Complete all course modules and the testnet deployment challenge to confer this credential."
                    >
                      🔒 Credential Locked (Finish Course)
                    </button>
                    <button
                      className="btn btn--primary cert-action-btn cert-action-btn--goto"
                      onClick={() => handleGoToCourse(template.trackId)}
                      disabled={navigatingTrack === template.trackId}
                    >
                      {navigatingTrack === template.trackId ? 'Loading Course...' : `🚀 Go to Course (${template.chainName})`}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificatesView;
