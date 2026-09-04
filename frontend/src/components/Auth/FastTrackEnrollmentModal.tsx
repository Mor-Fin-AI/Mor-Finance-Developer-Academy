import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { initiateFrictionlessEnrollment } from '../../api/client';
import './FastTrackEnrollmentModal.css';

interface FastTrackEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  university?: string;
  cohortId?: string;
}

export const FastTrackEnrollmentModal: React.FC<FastTrackEnrollmentModalProps> = ({
  isOpen,
  onClose,
  university,
  cohortId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'sso' | 'qr'>('sso');

  // Dynamic environment variables with production fallback
  const envEnrollUrl = (import.meta as any).env?.VITE_ENROLL_URL;
  const envAppUrl = (import.meta as any).env?.VITE_APP_URL;
  const defaultCohort = (import.meta as any).env?.VITE_COHORT_ID || 'KU_COHORT_2026_01';
  const defaultUniversity = (import.meta as any).env?.VITE_UNIVERSITY_NAME || 'Kenyatta University';

  const activeCohort = cohortId || defaultCohort;
  const activeUniversity = university || defaultUniversity;

  const baseOrigin = envAppUrl?.trim() || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
  const enrollUrl = envEnrollUrl?.trim()
    ? envEnrollUrl.trim()
    : `${baseOrigin.replace(/\/$/, '')}/enroll?cohort=${activeCohort}&university=${encodeURIComponent(activeUniversity)}`;

  useEffect(() => {
    if (enrollUrl) {
      QRCode.toDataURL(enrollUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(setQrDataUrl)
        .catch((err) => console.warn('Could not generate QR code:', err));
    }
  }, [enrollUrl]);

  if (!isOpen) return null;

  const handleConnectGitHub = async () => {
    setLoading(true);
    setError(null);

    const timeoutTimer = setTimeout(() => {
      setLoading(false);
      setError('GitHub connection timed out after 8s. Please check your network and try again.');
    }, 8000);

    try {
      await initiateFrictionlessEnrollment(
        undefined,
        baseOrigin,
        activeUniversity,
        activeCohort,
        5000
      );
      clearTimeout(timeoutTimer);
    } catch (err: any) {
      clearTimeout(timeoutTimer);
      setError(err.message || 'Could not initiate GitHub OAuth');
      setLoading(false);
    }
  };

  return (
    <div className="fast-track-modal-overlay" onClick={onClose}>
      <div className="fast-track-tablet-frame" onClick={(e) => e.stopPropagation()}>
        <button className="fast-track-close-btn" onClick={onClose} title="Close" aria-label="Close modal">
          ✕
        </button>

        {/* Mobile Segmented Switcher (Visible on <= 860px) */}
        <div className="fast-track-mobile-nav">
          <button
            type="button"
            className={`fast-track-mobile-tab ${mobileTab === 'sso' ? 'fast-track-mobile-tab--active' : ''}`}
            onClick={() => setMobileTab('sso')}
          >
            ⚡ 1-Click Access
          </button>
          <button
            type="button"
            className={`fast-track-mobile-tab ${mobileTab === 'qr' ? 'fast-track-mobile-tab--active' : ''}`}
            onClick={() => setMobileTab('qr')}
          >
            📱 QR Code & Link
          </button>
        </div>

        {/* Left Interactive Panel */}
        <div className={`fast-track-left ${mobileTab === 'sso' ? 'fast-track-panel--active-mobile' : 'fast-track-panel--hidden-mobile'}`}>
          <div className="fast-track-brand-tag">
            MOR Developer Academy • Fast Track Enrollment
          </div>

          <div className="fast-track-hero">
            <h2 className="fast-track-title">
              Instant Access:<br />
              Web3 Dev Environment
            </h2>
            <p className="fast-track-subtitle">
              No forms. No passwords. Use your existing GitHub to join the MOR Academy Beta.
            </p>
          </div>

          <div className="fast-track-cta-container">
            {/* Primary GitHub SSO Button */}
            <button
              className="fast-track-github-btn"
              onClick={handleConnectGitHub}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Connect with GitHub'}</span>
            </button>

            {error && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {error}</div>}
          </div>

          {/* Institutional Badges Container */}
          <div className="fast-track-metrics-card">
            <div className="metrics-card-header">Optimized for Institutional Onboarding</div>
            <div className="metrics-badges-row">
              <div className="metric-badge-item">
                <span className="metric-badge-icon">👥</span>
                <div className="metric-badge-text">
                  <strong>University</strong>
                  <span>Cohort Routing</span>
                </div>
              </div>
              <div className="metric-badge-item">
                <span className="metric-badge-icon">⚡</span>
                <div className="metric-badge-text">
                  <strong>Instant</strong>
                  <span>Fast-Track Access</span>
                </div>
              </div>
              <div className="metric-badge-item">
                <span className="metric-badge-icon">📊</span>
                <div className="metric-badge-text">
                  <strong>Real-Time</strong>
                  <span>Progress Telemetry</span>
                </div>
              </div>
            </div>
          </div>

          {/* Switch to QR Link for Mobile */}
          <button
            type="button"
            className="fast-track-mobile-switch-link"
            onClick={() => setMobileTab('qr')}
          >
            📱 Need QR Code for another device or direct link? View here →
          </button>
        </div>

        {/* Right Flow Infographic Panel */}
        <div className={`fast-track-right ${mobileTab === 'qr' ? 'fast-track-panel--active-mobile' : 'fast-track-panel--hidden-mobile'}`}>
          <div className="flow-step-card flow-step-card--qr">
            <div className="qr-code-box">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Scan QR Code to Enroll" className="qr-code-img" />
              ) : (
                <div className="flow-step-icon-wrap">📱</div>
              )}
            </div>
            <h4 className="flow-step-title">1. Scan QR Code</h4>
            <span className="flow-step-hint">Point phone camera to join cohort</span>
            <button
              type="button"
              className="copy-enroll-url-btn"
              onClick={() => {
                if (navigator.clipboard && enrollUrl) {
                  navigator.clipboard.writeText(enrollUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }
              }}
            >
              {copied ? '✅ Link Copied!' : '🔗 Copy Direct Link'}
            </button>
          </div>

          <div className="flow-step-arrow">↓</div>

          <div className="flow-step-card">
            <div className="flow-step-icon-wrap">🛡️</div>
            <h4 className="flow-step-title">2. GitHub SSO Authorization</h4>
          </div>

          <div className="flow-step-arrow">↓</div>

          <div className="flow-step-card">
            <div className="flow-step-icon-wrap">💻</div>
            <h4 className="flow-step-title">3. Launch Sandbox Compiler</h4>
          </div>

          <div className="fast-track-university-pill">
            🏛️ {activeUniversity} • Cohort {activeCohort}
          </div>

          {/* Switch back to SSO for Mobile */}
          <button
            type="button"
            className="fast-track-mobile-switch-link fast-track-mobile-switch-link--dark"
            onClick={() => setMobileTab('sso')}
          >
            ← Back to 1-Click GitHub SSO
          </button>
        </div>
      </div>
    </div>
  );
};

export default FastTrackEnrollmentModal;
