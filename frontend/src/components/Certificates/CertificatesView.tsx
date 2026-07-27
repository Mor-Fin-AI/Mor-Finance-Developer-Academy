// ─── CertificatesView — showcases user achievements ──────────────────────────
import React, { useState, useEffect } from 'react';
import type { Certificate } from '../../types';
import { fetchCertificates } from '../../api/client';
import './CertificatesView.css';

interface CertificatesViewProps {
  userId: string;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ userId }) => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCertificates(userId)
      .then((data) => setCerts(data))
      .catch((err) => console.error("Error fetching certificates:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDownload = (cert: Certificate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups to download the certificate PDF.");
      return;
    }

    const recipientName = cert.recipient.startsWith("wallet-")
      ? `${cert.recipient.replace("wallet-", "").slice(0, 10)}...${cert.recipient.replace("wallet-", "").slice(-8)}`
      : `@${cert.recipient.replace("gh-", "")}`;

    const dateStr = new Date(cert.issued_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <html>
        <head>
          <title>Certificate - ${cert.level_title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
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
              width: 800px;
              height: 500px;
              padding: 50px;
              border-radius: 20px;
              background: radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent), #111827;
              border: 3px solid #3b82f6;
              box-shadow: 0 10px 40px rgba(0,0,0,0.5);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              box-sizing: border-box;
            }
            .cert-box::before {
              content: '⬡';
              position: absolute;
              right: 50px;
              bottom: 50px;
              font-size: 150px;
              opacity: 0.03;
              font-weight: 800;
            }
            .header-label {
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.15em;
              color: #ef4444;
              text-transform: uppercase;
            }
            .title {
              font-size: 34px;
              font-weight: 800;
              margin: 8px 0 0 0;
              background: linear-gradient(135deg, #60a5fa, #a855f7);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .recipient-box {
              margin-top: 40px;
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
              font-weight: 600;
              color: #f1f5f9;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-top: auto;
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
              position: absolute;
              top: 50px;
              right: 50px;
              font-size: 40px;
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
            <div class="badge">🛡️</div>
            <div>
              <span class="header-label">Level ${cert.level_id} Complete</span>
              <h2 class="title">${cert.level_title}</h2>
            </div>
            
            <div class="recipient-box">
              <span className="lbl">Awarded to:</span>
              <span className="val">${recipientName}</span>
            </div>

            <div class="meta-row">
              <div class="meta-col">
                <span class="lbl">Issued on:</span>
                <span class="val">${dateStr}</span>
              </div>
              <div class="meta-col">
                <span class="lbl">Credential ID:</span>
                <span class="val val--id">${cert.certificate_id}</span>
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

  const handleShare = (cert: Certificate) => {
    const text = `I just earned my Developer Academy Level ${cert.level_id} Certificate in "${cert.level_title}"! 🚀 Check out my progress. #Web3Dev #DeveloperAcademy`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="certs-loading">
        <div className="spinner" />
        <p>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="certs-container animate-fade-up">
      <div className="certs-header">
        <h2 className="certs-title">Academy Credentials</h2>
        <p className="certs-subtitle">
          Verifiable credentials representing completed levels in the Developer Academy curriculum.
        </p>
      </div>

      {certs.length === 0 ? (
        <div className="certs-empty-state glass">
          <div className="certs-empty-icon">🏆</div>
          <h3>No credentials earned yet</h3>
          <p>
            Complete all lessons inside any roadmap level to claim your verified Web3 developer certificate!
          </p>
        </div>
      ) : (
        <div className="certs-grid">
          {certs.map((cert) => (
            <div key={cert.certificate_id} className="cert-card glass">
              <div className="cert-card__watermark">⬡</div>
              <div className="cert-card__seal">🛡️</div>
              
              <div className="cert-card__header">
                <span className="cert-card__level">Level {cert.level_id} Complete</span>
                <h3 className="cert-card__title">{cert.level_title}</h3>
              </div>

              <div className="cert-card__recipient">
                <span className="cert-card__lbl">Awarded to:</span>
                <span className="cert-card__val" title={cert.recipient}>
                  {cert.recipient.startsWith("wallet-")
                    ? `${cert.recipient.replace("wallet-", "").slice(0, 8)}...${cert.recipient.replace("wallet-", "").slice(-6)}`
                    : `@${cert.recipient.replace("gh-", "")}`}
                </span>
              </div>

              <div className="cert-card__meta">
                <div>
                  <span className="cert-card__lbl">Issued on:</span>
                  <span className="cert-card__val">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="cert-card__lbl">Credential ID:</span>
                  <span className="cert-card__val cert-card__val--id">
                    {cert.certificate_id.slice(0, 14)}...
                  </span>
                </div>
              </div>

              <div className="cert-card__actions">
                <button className="btn btn--primary" onClick={() => handleDownload(cert)}>
                  💾 Download PDF
                </button>
                <button className="btn btn--secondary" onClick={() => handleShare(cert)}>
                  🐦 Share to X
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesView;
