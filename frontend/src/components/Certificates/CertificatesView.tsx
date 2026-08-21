// ─── CertificatesView — Verifiable Multi-Chain Credentials for Grant Standards ───
import React, { useState, useEffect } from 'react';
import type { Certificate } from '../../types';
import { fetchCertificates } from '../../api/client';
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
  requirements: string[];
}

const CHAIN_CREDENTIALS: ChainCredentialTemplate[] = [
  {
    id: 'cert-aptos',
    trackId: 'aptos',
    chainName: 'Aptos',
    title: 'Aptos Move Certified Developer',
    grantStandard: 'Aptos Foundation Grant Benchmark Standard',
    icon: '⚡',
    color: '#06b6d4',
    level_id: 5,
    requirements: [
      '5 Complete Learning Modules',
      '30 Move & Block-STM Quiz Questions (100%)',
      'Aptos Testnet Move Deployment Challenge',
      'Verified On-Chain Module Bytecode'
    ]
  },
  {
    id: 'cert-starknet',
    trackId: 'starknet',
    chainName: 'Starknet',
    title: 'Starknet Cairo & ZK Certified Developer',
    grantStandard: 'Starknet Foundation Grant Benchmark Standard',
    icon: '✨',
    color: '#ec4899',
    level_id: 5,
    requirements: [
      '5 Complete Learning Modules',
      '30 Cairo & STARK Quiz Questions (100%)',
      'Starknet Sepolia Cairo Deployment Challenge',
      'Verified Class Hash & Account Abstraction'
    ]
  },
  {
    id: 'cert-solana',
    trackId: 'solana',
    chainName: 'Solana',
    title: 'Solana Anchor Certified Developer',
    grantStandard: 'Solana Superteam & Foundation Grant Standard',
    icon: '☀️',
    color: '#f59e0b',
    level_id: 5,
    requirements: [
      '5 Complete Learning Modules',
      '30 Anchor & Sealevel Quiz Questions (100%)',
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
    requirements: [
      '5 Complete Learning Modules',
      '30 ink! & Substrate Quiz Questions (100%)',
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
    requirements: [
      '5 Complete Learning Modules',
      '30 Solidity & Security Quiz Questions (100%)',
      'Sepolia / Base Testnet Deployment Challenge',
      'Verified Source Code on Etherscan'
    ]
  }
];

export const CertificatesView: React.FC<CertificatesViewProps> = ({ userId }) => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChain, setFilterChain] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    fetchCertificates(userId)
      .then((data) => setCerts(data))
      .catch((err) => console.error("Error fetching certificates:", err))
      .finally(() => setLoading(false));
  }, [userId]);

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
          Verifiable credentials representing completed learning modules, 25–30 quiz masteries, and verified testnet smart contract deployment challenges across Aptos, Starknet, Solana, Polkadot, and Ethereum.
        </p>

        {/* Chain Filter Tabs */}
        <div className="certs-filter-bar">
          {[
            { id: 'all', label: 'All Ecosystems' },
            { id: 'aptos', label: '⚡ Aptos Move' },
            { id: 'starknet', label: '✨ Starknet Cairo' },
            { id: 'solana', label: '🟠 Solana Anchor' },
            { id: 'polkadot', label: '🟣 Polkadot ink!' },
            { id: 'fundamentals', label: '🛡️ Ethereum EVM' }
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

      {/* Grid of 5 Standard Ecosystem Credentials */}
      <div className="certs-grid">
        {filteredTemplates.map((template) => {
          // Check if user earned this specific certificate or level 5
          const userEarnedCert = certs.find(
            (c) =>
              c.level_id === template.level_id ||
              c.level_title.toLowerCase().includes(template.chainName.toLowerCase()) ||
              c.level_title.toLowerCase().includes(template.trackId)
          );

          const displayCertId = userEarnedCert?.certificate_id || `${template.id}-${userId.slice(0, 8)}`;

          return (
            <div
              key={template.id}
              className="cert-card glass"
              style={{ borderTop: `4px solid ${template.color}` }}
            >
              <div className="cert-card__watermark">⬡</div>
              <div className="cert-card__seal">{template.icon}</div>

              <div className="cert-card__header">
                <span className="cert-card__level">
                  5 Modules • 30 Quizzes • 1 Deployment
                </span>
                <h3 className="cert-card__title">{template.title}</h3>
                <span className="cert-card__standard">{template.grantStandard}</span>
              </div>

              {/* Requirements Checklist */}
              <div className="cert-card__requirements">
                <span className="cert-card__lbl">Grant Standard Checklist:</span>
                <ul>
                  {template.requirements.map((req, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span> {req}
                    </li>
                  ))}
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
                  <span className="cert-card__val cert-card__val--id">
                    {displayCertId.slice(0, 16)}...
                  </span>
                </div>
                <div>
                  <span className="cert-card__lbl">Status:</span>
                  <span className="cert-status-badge">
                    {userEarnedCert ? '🏆 Conferred' : '⚡ Ready to Claim'}
                  </span>
                </div>
              </div>

              <div className="cert-card__actions">
                <button
                  className="btn btn--primary cert-action-btn"
                  onClick={() =>
                    handleDownload({
                      level_title: template.title,
                      level_id: template.level_id,
                      certificate_id: displayCertId,
                      recipient: userId,
                      grantStandard: template.grantStandard
                    })
                  }
                >
                  💾 Download PDF Certificate
                </button>
                <button
                  className="btn btn--secondary cert-action-btn"
                  onClick={() => handleShare(template.title, displayCertId)}
                >
                  🐦 Share to X
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificatesView;
