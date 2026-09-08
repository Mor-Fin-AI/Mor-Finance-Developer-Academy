import React from 'react';
import './Login.css';

interface LoginProps {
  onLoginGitHub: () => void;
  onLoginWallet: () => void;
  error: string | null;
  loading: boolean;
}

export const Login: React.FC<LoginProps> = ({
  onLoginGitHub,
  onLoginWallet,
  error,
  loading,
}) => {
  return (
    <div className="login-page" style={{ background: 'radial-gradient(circle at 50% 50%, #0c102b 0%, #030307 100%)' }}>
      {/* Background gradients */}
      <div className="login-bg-glow login-bg-glow--1" style={{ filter: 'blur(160px)', opacity: 0.15 }} />
      <div className="login-bg-glow login-bg-glow--2" style={{ filter: 'blur(160px)', opacity: 0.15 }} />

      <div className="login-container glass animate-fade-up" style={{ maxWidth: '420px', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(10, 11, 23, 0.55)', backdropFilter: 'blur(20px)' }}>
        {/* Logo */}
        <div className="login-logo" style={{ marginBottom: '32px' }}>
          <div className="login-logo__icon" style={{ color: '#3b82f6', fontSize: '2rem' }}>⬡</div>
          <h1 className="login-logo__title" style={{ fontSize: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>
            MOR <span className="gradient-text" style={{ color: '#3b82f6' }}>FINANCE</span>
          </h1>
        </div>

        <h2 className="login-heading" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: '1.3', marginBottom: '12px' }}>
          Continue your Software Architecture journey.
        </h2>

        <p className="login-subtitle" style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', textAlign: 'center', lineHeight: '1.6', marginBottom: '32px' }}>
          Sign in to access your learning progress, AI mentors, GitHub contributions, and engineering workspace.
        </p>

        {loading ? (
          <div className="login-loading" style={{ textAlign: 'center', padding: '24px 0' }}>
            <div className="spinner" style={{ border: '3px solid rgba(255, 255, 255, 0.1)', borderTop: '3px solid #3b82f6', width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)' }}>Verifying authentication credentials...</p>
          </div>
        ) : (
          <div className="login-methods" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn login-btn"
              onClick={onLoginGitHub}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                justifyContent: 'flex-start',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🐱</span> Continue with GitHub
            </button>
            
            <button
              className="btn login-btn"
              onClick={onLoginWallet}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                justifyContent: 'flex-start',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🦊</span> Connect Web3 Wallet
            </button>

            {error && (
              <div className="login-error-banner animate-fade-up" style={{ marginTop: '12px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="login-error-banner__icon">⚠️</span>
                <span className="login-error-banner__text" style={{ fontSize: '0.8rem', color: '#fca5a5' }}>{error}</span>
              </div>
            )}
          </div>
        )}

        <div className="login-divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '32px 0 24px 0', gap: '12px', width: '100%' }}>
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', flex: 1 }} />
          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>PROTECTED BY MOR IDENTITY</span>
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', flex: 1 }} />
        </div>

        <div className="login-footer" style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
          New here? <span style={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>Create your developer account</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
