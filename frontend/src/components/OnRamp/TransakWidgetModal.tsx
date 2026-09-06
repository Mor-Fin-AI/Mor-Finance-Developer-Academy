import React, { useState, useEffect, useMemo } from 'react';
import './TransakWidgetModal.css';

export interface TransakWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultNetwork?: string;
  walletAddress?: string;
  defaultCryptoCurrency?: string;
}

interface NetworkOption {
  id: string;
  name: string;
  transakNetwork: string;
  symbol: string;
  icon: string;
  testnetName: string;
}

const SUPPORTED_ONRAMP_NETWORKS: NetworkOption[] = [
  { id: 'arbitrum', name: 'Arbitrum (Nitro)', transakNetwork: 'arbitrum', symbol: 'ETH', icon: '🌀', testnetName: 'Arbitrum Sepolia' },
  { id: 'base', name: 'Base (Coinbase L2)', transakNetwork: 'base', symbol: 'ETH', icon: '🔵', testnetName: 'Base Sepolia' },
  { id: 'optimism', name: 'Optimism (OP Stack)', transakNetwork: 'optimism', symbol: 'ETH', icon: '🔴', testnetName: 'OP Sepolia' },
  { id: 'ethereum', name: 'Ethereum L1', transakNetwork: 'ethereum', symbol: 'ETH', icon: '🔷', testnetName: 'Sepolia' },
  { id: 'polygon', name: 'Polygon', transakNetwork: 'polygon', symbol: 'POL', icon: '💜', testnetName: 'Polygon Amoy' },
];

export const TransakWidgetModal: React.FC<TransakWidgetModalProps> = ({
  isOpen,
  onClose,
  defaultNetwork = 'arbitrum',
  walletAddress = '',
  defaultCryptoCurrency = 'ETH',
}) => {
  // Map incoming network ID (e.g. 'arbitrum_sepolia' -> 'arbitrum')
  const initialNetwork = useMemo(() => {
    const netId = defaultNetwork.toLowerCase();
    if (netId.includes('arbitrum')) return 'arbitrum';
    if (netId.includes('base')) return 'base';
    if (netId.includes('optimism') || netId.includes('op')) return 'optimism';
    if (netId.includes('polygon')) return 'polygon';
    return 'ethereum';
  }, [defaultNetwork]);

  const [selectedNetwork, setSelectedNetwork] = useState<string>(initialNetwork);
  const [activeTab, setActiveTab] = useState<'live' | 'simulator'>('live');
  const [showInlineIframe, setShowInlineIframe] = useState<boolean>(false);
  const [windowOpened, setWindowOpened] = useState<boolean>(false);

  // Simulator state
  const [simAmount, setSimAmount] = useState<number>(25);
  const [simStatus, setSimStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [simTxHash, setSimTxHash] = useState<string>('');

  // Sync when defaultNetwork changes
  useEffect(() => {
    setSelectedNetwork(initialNetwork);
  }, [initialNetwork]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Clean wallet address
  const cleanWallet = walletAddress.startsWith('wallet-')
    ? walletAddress.replace('wallet-', '')
    : walletAddress;

  const currentNetObj = SUPPORTED_ONRAMP_NETWORKS.find(n => n.transakNetwork === selectedNetwork) || SUPPORTED_ONRAMP_NETWORKS[0];

  // Environment variables
  const apiKey = ((import.meta.env.VITE_TRANSAK_API_KEY as string) || '').trim();
  const environment = ((import.meta.env.VITE_TRANSAK_ENV as string) || 'STAGING').trim().toUpperCase();

  // Build Transak URL
  const queryParams = new URLSearchParams({
    apiKey: apiKey || 'YOUR_TRANSAK_API_KEY',
    environment,
    network: selectedNetwork,
    cryptoCurrencyCode: currentNetObj.symbol || defaultCryptoCurrency,
    themeColor: '3b82f6',
    hideMenu: 'true',
    exchangeScreenTitle: 'Protocol Asset On-Ramp',
  });

  if (cleanWallet && cleanWallet.startsWith('0x') && cleanWallet.length === 42) {
    queryParams.set('walletAddress', cleanWallet);
    queryParams.set('disableWalletAddressForm', 'true');
  }

  const transakHost = environment === 'STAGING' ? 'https://global-stg.transak.com' : 'https://global.transak.com';
  const transakUrl = `${transakHost}/?${queryParams.toString()}`;

  // Direct secure popup launcher (bypasses iframe X-Frame-Options and prevents extension stream crashes)
  const handleOpenSecurePopup = () => {
    if (!apiKey) {
      alert("Transak API Key is not set. Please add VITE_TRANSAK_API_KEY in your frontend/.env file to connect live.");
      return;
    }
    const width = 500;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      transakUrl,
      'TransakGateway',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
    setWindowOpened(true);
  };

  // Run mock simulator funding
  const handleSimulateOnRamp = () => {
    setSimStatus('processing');
    setTimeout(() => {
      const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSimTxHash(mockHash);
      setSimStatus('success');
    }, 1200);
  };

  return (
    <div
      className="transak-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transak-modal-title"
    >
      <div className="transak-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="transak-modal-header">
          <div className="transak-modal-title-area">
            <div className="transak-modal-icon">⚡</div>
            <div>
              <h3 id="transak-modal-title" className="transak-modal-title">
                Protocol Asset On-Ramp
              </h3>
              <p className="transak-modal-subtitle">
                <span>Card &amp; Bank Transfer</span>
                <span>•</span>
                <span>Powered by Transak</span>
              </p>
            </div>
          </div>
          <button
            className="transak-close-btn"
            onClick={onClose}
            aria-label="Close On-Ramp"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector: Live vs Simulator */}
        <div className="transak-tab-bar">
          <button
            className={`transak-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            <span>⚡</span> Transak Live Gateway
          </button>
          <button
            className={`transak-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <span>🧪</span> Sandbox Simulator (Testnet Gas)
          </button>
        </div>

        {/* Toolbar: Network Selector & Destination */}
        <div className="transak-modal-toolbar">
          <div className="transak-network-selector">
            <span>Target Network:</span>
            <select
              className="transak-select"
              value={selectedNetwork}
              onChange={(e) => {
                setSelectedNetwork(e.target.value);
                setSimStatus('idle');
                setWindowOpened(false);
              }}
              title="Select network for protocol assets"
            >
              {SUPPORTED_ONRAMP_NETWORKS.map((net) => (
                <option key={net.id} value={net.transakNetwork}>
                  {net.icon} {net.name}
                </option>
              ))}
            </select>
          </div>

          {cleanWallet && cleanWallet.startsWith('0x') ? (
            <div
              className="transak-wallet-pill"
              title={`Destination Developer Key: ${cleanWallet}`}
            >
              🔑 {cleanWallet.slice(0, 6)}...{cleanWallet.slice(-4)}
            </div>
          ) : (
            <div className="transak-wallet-pill" title="Destination will be entered in Transak widget">
              🔑 Direct to Developer Key
            </div>
          )}
        </div>

        {/* Institutional & Bank Compliance Banner */}
        <div className="transak-compliance-banner">
          <span>🔒 100% External KYC, AML &amp; Fraud Screening Managed by Transak Inc.</span>
          <span>Zero Platform Custody</span>
        </div>

        {/* Content Area */}
        {activeTab === 'live' ? (
          <div className="transak-live-content">
            <div className="transak-gateway-view">
              <div className="gateway-hero-card">
                <div className="gateway-hero-badge">
                  <span className="gateway-status-dot"></span> Regulated Partner Gateway
                </div>
                
                <div className="gateway-hero-title">
                  <span className="gateway-network-icon">{currentNetObj.icon}</span>
                  <div>
                    <h4>Fund Developer Key on {currentNetObj.name}</h4>
                    <p>Acquire {currentNetObj.symbol} protocol gas instantly via debit/credit card or bank transfer.</p>
                  </div>
                </div>

                <div className="gateway-rails-grid">
                  <div className="rail-pill">💳 Visa / Mastercard</div>
                  <div className="rail-pill">🍏 Apple Pay</div>
                  <div className="rail-pill">📱 Google Pay</div>
                  <div className="rail-pill">🏦 Instant SEPA / Wire</div>
                </div>

                <div className="gateway-meta-box">
                  <div className="meta-row">
                    <span>Target Network:</span>
                    <strong>{currentNetObj.name}</strong>
                  </div>
                  <div className="meta-row">
                    <span>Target Asset:</span>
                    <strong>{currentNetObj.symbol}</strong>
                  </div>
                  <div className="meta-row">
                    <span>Destination Key:</span>
                    <code>{cleanWallet ? `${cleanWallet.slice(0, 10)}...${cleanWallet.slice(-6)}` : 'Active Developer Key'}</code>
                  </div>
                  <div className="meta-row">
                    <span>Custody Model:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>100% Non-Custodial (Direct to Key)</span>
                  </div>
                </div>

                {!apiKey && (
                  <div style={{
                    margin: '14px 0',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    fontSize: '0.82rem',
                    color: '#fef08a',
                    lineHeight: '1.5',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span>⚠️</span> Transak Partner API Key Required in .env
                    </div>
                    <p style={{ margin: '0 0 8px 0', color: '#cbd5e1', fontSize: '0.78rem' }}>
                      To open the live Transak checkout, set <code>VITE_TRANSAK_API_KEY</code> in <code>frontend/.env</code>. In the meantime, use the <strong>Simulator</strong> tab to test testnet funding.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('simulator')}
                      style={{
                        background: 'rgba(59, 130, 246, 0.25)',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        color: '#93c5fd',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      🧪 Use Testnet Simulator (Instant Gas)
                    </button>
                  </div>
                )}

                <button
                  className="btn btn--primary gateway-main-cta-btn"
                  onClick={handleOpenSecurePopup}
                >
                  <span>🚀</span> Launch Secure Transak Checkout
                </button>

                {windowOpened && (
                  <div className="gateway-opened-hint">
                    <span>✓ Transak checkout window opened.</span>
                    <button className="reopen-link" onClick={handleOpenSecurePopup}>
                      Click to refocus or re-open
                    </button>
                  </div>
                )}

                <div className="gateway-testing-note">
                  <span>Testing locally? </span>
                  <button
                    className="sim-switch-link"
                    onClick={() => setActiveTab('simulator')}
                  >
                    Switch to 🧪 Testnet Simulator (Instant Free Gas)
                  </button>
                </div>
              </div>

              {/* Advanced inline frame toggle for whitelisted production domains */}
              <div className="transak-advanced-expander">
                <button
                  type="button"
                  className="advanced-toggle-btn"
                  onClick={() => setShowInlineIframe(!showInlineIframe)}
                >
                  <span>{showInlineIframe ? '▼' : '▶'}</span> Advanced: Embed Inline Iframe (Partner Whitelist Only)
                </button>
                {showInlineIframe && (
                  <div className="inline-iframe-box">
                    <p className="inline-iframe-warning">
                      ⚠️ Note: Transak enforces <code>X-Frame-Options: SAMEORIGIN</code>. Direct embedding only works on whitelisted production domains with a backend API session token.
                    </p>
                    <iframe
                      src={transakUrl}
                      title="Transak On-Ramp Widget"
                      className="transak-iframe"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="camera; microphone; payment; clipboard-read; clipboard-write"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Simulator Tab */
          <div className="transak-simulator-container">
            <div className="sim-intro">
              <h4>🧪 Developer Testnet On-Ramp Simulator</h4>
              <p>Simulate instant fiat-to-protocol gas acquisition for local testing without real funds.</p>
            </div>

            <div className="sim-form-group">
              <label>Purchase Amount (USD):</label>
              <div className="sim-amount-pills">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`sim-amt-btn ${simAmount === amt ? 'selected' : ''}`}
                    onClick={() => {
                      setSimAmount(amt);
                      setSimStatus('idle');
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="sim-quote-box">
              <div className="sim-quote-row">
                <span>Target Asset:</span>
                <strong>{currentNetObj.symbol} on {currentNetObj.testnetName}</strong>
              </div>
              <div className="sim-quote-row">
                <span>Estimated Received:</span>
                <span className="sim-crypto-val">
                  {(simAmount / 2800).toFixed(4)} {currentNetObj.symbol}
                </span>
              </div>
              <div className="sim-quote-row">
                <span>Network Execution Fee:</span>
                <span style={{ color: '#10b981' }}>$0.02 (Sponsored Testnet)</span>
              </div>
              <div className="sim-quote-row">
                <span>Destination Key:</span>
                <code>{cleanWallet ? `${cleanWallet.slice(0, 10)}...${cleanWallet.slice(-6)}` : '0xDefaultDevKey'}</code>
              </div>
            </div>

            {simStatus === 'idle' && (
              <button className="btn btn--primary sim-submit-btn" onClick={handleSimulateOnRamp}>
                ⚡ Simulate Instant On-Ramp (${simAmount} USD)
              </button>
            )}

            {simStatus === 'processing' && (
              <div className="sim-status-box processing">
                <div className="spinner" style={{ width: '22px', height: '22px' }} />
                <span>Simulating payment clearance &amp; minting testnet gas...</span>
              </div>
            )}

            {simStatus === 'success' && (
              <div className="sim-status-box success">
                <div className="success-icon">✅</div>
                <div>
                  <strong>Funding Successful!</strong>
                  <p>Dispatched {(simAmount / 2800).toFixed(4)} {currentNetObj.symbol} to your Developer Key.</p>
                  <div className="sim-hash">TX: {simTxHash.slice(0, 18)}...</div>
                </div>
              </div>
            )}

            <div className="sim-footer-note">
              💡 For production live funds, provide your registered partner API key via <code>VITE_TRANSAK_API_KEY</code>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransakWidgetModal;
