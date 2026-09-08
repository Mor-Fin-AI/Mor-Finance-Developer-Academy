// ─── CertificatesView — Verifiable Multi-Chain Credentials for Grant Standards ───
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Certificate, UserProgress } from '../../types';
import { fetchCertificates, fetchProgress, postActiveTrack } from '../../api/client';
import './CertificatesView.css';

interface CertificatesViewProps {
  userId: string;
  isLoggedIn?: boolean;
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

export const CertificatesView: React.FC<CertificatesViewProps> = ({ userId, isLoggedIn: _isLoggedIn = true }) => {
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
      ? `${cert.recipient.replace("wallet-", "").slice(0, 6)}...${cert.recipient.slice(-4)}`
      : `@${cert.recipient.replace("gh-", "")}`;

    const issueDate = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cert.level_title} - MOR Developer Academy</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Cinzel:wght@700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #030307;
            color: #fff;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          .certificate-container {
            width: 900px;
            height: 620px;
            background: radial-gradient(circle at center, #0f172a 0%, #030307 100%);
            border: 8px solid #1e293b;
            border-image: linear-gradient(135deg, #3b82f6, #ec4899, #f59e0b) 1;
            padding: 40px 60px;
            text-align: center;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .cert-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          .cert-logo-text {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #fff;
          }
          .cert-title {
            font-family: 'Cinzel', serif;
            font-size: 32px;
            color: #f8fafc;
            letter-spacing: 3px;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          .cert-subtitle {
            font-size: 13px;
            color: #94a3b8;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 24px;
          }
          .cert-body-intro {
            font-size: 14px;
            color: #cbd5e1;
            margin-bottom: 12px;
          }
          .cert-recipient {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #60a5fa 0%, #c084fc 50%, #f472b6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
          }
          .cert-desc {
            font-size: 14px;
            color: #94a3b8;
            max-width: 680px;
            margin: 0 auto 24px auto;
            line-height: 1.6;
          }
          .cert-course-name {
            font-weight: 700;
            color: #e2e8f0;
          }
          .cert-standard-badge {
            display: inline-block;
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.4);
            color: #93c5fd;
            font-size: 12px;
            font-weight: 700;
            padding: 6px 16px;
            border-radius: 9999px;
            margin-bottom: 24px;
          }
          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 20px;
          }
          .footer-item {
            text-align: left;
          }
          .footer-item.right {
            text-align: right;
          }
          .footer-lbl {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .footer-val {
            font-size: 12px;
            color: #cbd5e1;
            font-family: monospace;
          }
          .cert-seal {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: radial-gradient(circle, #f59e0b 0%, #b45309 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
          }
          @media print {
            body { background: none; padding: 0; }
            .certificate-container { box-shadow: none; width: 100%; height: 100vh; border-width: 4px; }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <div>
            <div class="cert-header">
              <span style="font-size: 24px;">🏛️</span>
              <span class="cert-logo-text">MOR DEVELOPER ACADEMY</span>
            </div>
            <h1 class="cert-title">Certificate of Achievement</h1>
            <p class="cert-subtitle">Official Verifiable Multi-Chain Credential</p>
          </div>

          <div>
            <p class="cert-body-intro">This is to officially certify that</p>
            <div class="cert-recipient">${recipientName}</div>
            <p class="cert-desc">
              has successfully mastered all rigorous learning modules, verified interactive smart contract coding challenges, and passed comprehensive architectural evaluations in
              <span class="cert-course-name">${cert.level_title}</span>.
            </p>
            <div class="cert-standard-badge">
              ⭐ Benchmark Standard: ${cert.grantStandard || 'Ecosystem Foundation Grant Benchmark'}
            </div>
          </div>

          <div class="cert-footer">
            <div class="footer-item">
              <div class="footer-lbl">Issued On</div>
              <div class="footer-val">${issueDate}</div>
              <div class="footer-lbl" style="margin-top: 8px;">Credential ID</div>
              <div class="footer-val">${cert.certificate_id}</div>
            </div>

            <div class="cert-seal">
              🏆
            </div>

            <div class="footer-item right">
              <div class="footer-lbl">Verification Authority</div>
              <div class="footer-val">MOR Platform Governance</div>
              <div class="footer-lbl" style="margin-top: 8px;">Network Verification</div>
              <div class="footer-val">Cryptographically Signed</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredCredentials = CHAIN_CREDENTIALS.filter((template) => {
    if (filterChain === 'all') return true;
    return template.trackId === filterChain;
  });

  return (
    <div className="credentials-view animate-fade-in">
      {/* Header */}
      <div className="credentials-header glass">
        <div className="credentials-header__text">
          <span className="credentials-badge">VERIFIED ON-CHAIN CREDENTIALS</span>
          <h2 className="credentials-title">Multi-Chain Developer Certifications</h2>
          <p className="credentials-subtitle">
            Earn verifiable developer credentials built to match official foundation grant standards. Complete 5 modules, pass 30 quiz questions, and deploy live testnet challenges to unlock your certificate.
          </p>
        </div>

        <div className="credentials-filter-bar">
          <span className="filter-label">Filter Track:</span>
          <div className="filter-pills">
            {['all', 'aptos', 'starknet', 'solana', 'polkadot', 'fundamentals', 'fullstack'].map((t) => (
              <button
                key={t}
                className={`filter-pill ${filterChain === t ? 'filter-pill--active' : ''}`}
                onClick={() => setFilterChain(t)}
              >
                {t === 'all' ? '🌐 All Tracks' : t === 'fundamentals' ? '🔷 Ethereum' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="credentials-loading">
          <div className="spinner" />
          <p>Loading multi-chain credentials...</p>
        </div>
      ) : (
        <div className="credentials-grid">
          {filteredCredentials.map((template) => {
            const issuedCert = certs.find((c) => c.level_id === template.level_id);
            const isCompleted = Boolean(issuedCert);
            const activeTrack = userProgress?.active_track || 'fundamentals';
            const isCurrentTrack = activeTrack === template.trackId || (template.trackId === 'fundamentals' && activeTrack === 'ethereum');

            const completedLessons = userProgress?.levels.find(l => l.level_id === template.level_id)?.completed_lessons || 0;
            const progressPct = isCompleted ? 100 : Math.min(90, Math.round((completedLessons / 5) * 100));

            return (
              <div
                key={template.id}
                className={`credential-card glass ${isCompleted ? 'credential-card--unlocked' : ''}`}
                style={{ '--card-accent': template.color } as React.CSSProperties}
              >
                <div className="credential-card__header">
                  <div className="credential-icon-wrap" style={{ borderColor: template.color }}>
                    <span className="credential-icon">{template.icon}</span>
                  </div>
                  <div>
                    <span className="credential-chain-name">{template.chainName}</span>
                    <h3 className="credential-title">{template.title}</h3>
                  </div>
                  <span className={`status-pill ${isCompleted ? 'status-pill--unlocked' : 'status-pill--locked'}`}>
                    {isCompleted ? '✓ Certified' : '🔒 In Progress'}
                  </span>
                </div>

                <div className="grant-standard-box">
                  <span className="standard-lbl">Foundation Grant Benchmark:</span>
                  <span className="standard-val">⭐ {template.grantStandard}</span>
                </div>

                <div className="credential-requirements">
                  <span className="req-title">Certification Criteria:</span>
                  <ul className="req-list">
                    {template.requirements.map((req, idx) => (
                      <li key={idx}>
                        <span className="check-icon">{isCompleted ? '✅' : '○'}</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progress bar */}
                <div className="credential-progress-container">
                  <div className="progress-bar-wrap">
                    <div className="progress-fill" style={{ width: `${progressPct}%`, backgroundColor: template.color }} />
                  </div>
                  <div className="progress-labels">
                    <span>{isCompleted ? 'Criteria 100% Fulfilled' : `${progressPct}% Complete`}</span>
                    <span>{isCompleted ? 'Ready to Download' : 'Modules in progress'}</span>
                  </div>
                </div>

                <div className="credential-card__footer">
                  {isCompleted ? (
                    <button
                      className="btn btn--primary download-btn"
                      onClick={() => handleDownload({
                        level_title: template.title,
                        level_id: template.level_id,
                        certificate_id: issuedCert?.certificate_id || `MOR-${template.trackId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
                        recipient: issuedCert?.recipient || userId || 'MOR Developer',
                        issued_at: issuedCert?.issued_at,
                        grantStandard: template.grantStandard
                      })}
                    >
                      <span>📥</span> Download Certificate (PDF)
                    </button>
                  ) : (
                    <button
                      className={`btn ${isCurrentTrack ? 'btn--primary' : 'btn--secondary'} continue-btn`}
                      onClick={() => handleGoToCourse(template.trackId)}
                      disabled={navigatingTrack === template.trackId}
                    >
                      {navigatingTrack === template.trackId ? (
                        'Opening...'
                      ) : isCurrentTrack ? (
                        '⚡ Continue Learning Track →'
                      ) : (
                        `Switch to ${template.chainName} Track ↗`
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CertificatesView;
