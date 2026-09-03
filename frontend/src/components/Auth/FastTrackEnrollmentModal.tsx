import React, { useState } from 'react';
import { enrollUniversityStudent, initiateFrictionlessEnrollment } from '../../api/client';
import './FastTrackEnrollmentModal.css';

interface FastTrackEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  university?: string;
  cohortId?: string;
}

export const FastTrackEnrollmentModal: React.FC<FastTrackEnrollmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  university = 'Kenyatta University',
  cohortId = 'KU_COHORT_2026_01',
}) => {
  const [demoHandle, setDemoHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectGitHub = () => {
    setLoading(true);
    setError(null);
    try {
      initiateFrictionlessEnrollment(
        'YOUR_GITHUB_CLIENT_ID_CONFIG',
        window.location.origin,
        university,
        cohortId
      );
    } catch (err: any) {
      setError(err.message || 'Could not initiate GitHub OAuth');
      setLoading(false);
    }
  };

  const handleInstantDemoEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const handle = demoHandle.trim() || `ku_builder_${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await enrollUniversityStudent({
        github_username: handle,
        oauth_code: `demo_oauth_${Date.now()}`,
        university_affiliate: university,
        cohort_id: cohortId,
      });

      if (res.token) {
        localStorage.setItem('auth_token', res.token);
      }
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Instant enrollment failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fast-track-modal-overlay" onClick={onClose}>
      <div className="fast-track-tablet-frame" onClick={(e) => e.stopPropagation()}>
        <button className="fast-track-close-btn" onClick={onClose} title="Close">
          ✕
        </button>

        {/* Left Interactive Panel */}
        <div className="fast-track-left">
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

            {/* Quick Demo Simulator for instant testing without leaving window */}
            <form className="fast-track-demo-trigger" onSubmit={handleInstantDemoEnrollment}>
              <input
                type="text"
                className="fast-track-demo-input"
                placeholder="Or test with username (e.g. ku_student_99)"
                value={demoHandle}
                onChange={(e) => setDemoHandle(e.target.value)}
              />
              <button type="submit" className="fast-track-demo-btn" disabled={loading}>
                ⚡ 1-Click Fast Enroll
              </button>
            </form>

            {error && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {error}</div>}
          </div>

          {/* Institutional Badges Container */}
          <div className="fast-track-metrics-card">
            <div className="metrics-card-header">Optimized for Institutional Onboarding</div>
            <div className="metrics-badges-row">
              <div className="metric-badge-item">
                <span className="metric-badge-icon">👥</span>
                <div className="metric-badge-text">
                  <strong>500–600</strong>
                  <span>Student Cohorts</span>
                </div>
              </div>
              <div className="metric-badge-item">
                <span className="metric-badge-icon">⚡</span>
                <div className="metric-badge-text">
                  <strong>&lt; 60 Sec</strong>
                  <span>Activation</span>
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
        </div>

        {/* Right Flow Infographic Panel */}
        <div className="fast-track-right">
          <div className="flow-step-card">
            <div className="flow-step-icon-wrap">📱</div>
            <h4 className="flow-step-title">1. Scan QR Code</h4>
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
            🏛️ {university} • Cohort {cohortId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastTrackEnrollmentModal;
