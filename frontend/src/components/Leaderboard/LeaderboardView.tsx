// ─── LeaderboardView — testnet activity submissions ranked by distinct transactions ───
import React, { useCallback, useEffect, useState } from 'react';
import {
  fetchLeaderboard,
  fetchLeaderboardChains,
  submitLeaderboardTx,
  ApiError,
  type LeaderboardEntry,
} from '../../api/client';
import './LeaderboardView.css';

const CHAIN_LABELS: Record<string, string> = {
  'sepolia': 'Ethereum Sepolia',
  'base-sepolia': 'Base Sepolia',
  'arbitrum-sepolia': 'Arbitrum Sepolia',
  'optimism-sepolia': 'Optimism Sepolia',
};

const MEDALS = ['🥇', '🥈', '🥉'];

// Mirrors the backend rules so obvious mistakes are caught before the request.
const HANDLE_RE = /^[a-z][a-z0-9_]{4,31}$/;
const TX_HASH_RE = /^0x[0-9a-f]{64}$/;

type FieldErrors = Partial<Record<'telegram' | 'chain' | 'txHash', string>>;

export const LeaderboardView: React.FC = () => {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [chains, setChains] = useState<string[]>([]);
  const [verifyOnchain, setVerifyOnchain] = useState(false);

  const [telegram, setTelegram] = useState('');
  const [chain, setChain] = useState('');
  const [txHash, setTxHash] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    try {
      setBoard(await fetchLeaderboard());
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load the leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
    fetchLeaderboardChains()
      .then(({ chains, verifyOnchain }) => {
        setChains(chains);
        setVerifyOnchain(verifyOnchain);
        setChain((current) => current || chains[0] || '');
      })
      .catch(() => setChains(Object.keys(CHAIN_LABELS)));
  }, [loadBoard]);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const handle = telegram.trim().replace(/^@/, '').toLowerCase();
    if (!HANDLE_RE.test(handle)) errors.telegram = 'Use your Telegram username: 5–32 letters, digits or underscores, starting with a letter.';
    if (!chain) errors.chain = 'Choose the testnet the transaction is on.';
    if (!TX_HASH_RE.test(txHash.trim().toLowerCase())) errors.txHash = 'Paste the full transaction hash: 0x followed by 64 hex characters.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      const result = await submitLeaderboardTx({ telegram: telegram.trim(), chain, txHash: txHash.trim() });
      setStatus({
        kind: 'success',
        text: `Transaction recorded for @${result.telegram}. You're now #${result.rank} with ${result.txCount} transaction${result.txCount === 1 ? '' : 's'}.`,
      });
      setHighlight(result.telegram);
      setTxHash('');
      await loadBoard();
    } catch (err: any) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        setFieldErrors(err.fields as FieldErrors);
      }
      setStatus({ kind: 'error', text: err?.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalTxs = board.reduce((sum, r) => sum + r.txCount, 0);

  return (
    <div className="leaderboard animate-fade-in">
      <section className="leaderboard__intro glass">
        <span className="leaderboard__badge">🥇 Testnet Activity</span>
        <h2 className="leaderboard__title">Builder Leaderboard</h2>
        <p className="leaderboard__lead">
          Deploy, bridge and transact on testnets, then submit each transaction hash here. Builders are ranked by
          distinct transactions; ties go to whoever has used more chains, then to whoever submitted first.
        </p>
        <div className="leaderboard__stats">
          <div><strong>{board.length}</strong><span>Builders</span></div>
          <div><strong>{totalTxs}</strong><span>Transactions</span></div>
          <div><strong>{chains.length || '—'}</strong><span>Testnets</span></div>
        </div>
      </section>

      <div className="leaderboard__grid">
        <section className="leaderboard__panel glass" aria-labelledby="lb-submit-title">
          <h3 id="lb-submit-title" className="leaderboard__panel-title">Submit a transaction</h3>
          <form className="leaderboard__form" onSubmit={handleSubmit} noValidate>
            <label className="leaderboard__field">
              <span>Telegram handle</span>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@your_handle"
                autoComplete="off"
                maxLength={33}
                aria-invalid={Boolean(fieldErrors.telegram)}
              />
              {fieldErrors.telegram && <em className="leaderboard__field-error">{fieldErrors.telegram}</em>}
            </label>

            <label className="leaderboard__field">
              <span>Testnet</span>
              <select value={chain} onChange={(e) => setChain(e.target.value)} aria-invalid={Boolean(fieldErrors.chain)}>
                {chains.map((c) => (
                  <option key={c} value={c}>{CHAIN_LABELS[c] || c}</option>
                ))}
              </select>
              {fieldErrors.chain && <em className="leaderboard__field-error">{fieldErrors.chain}</em>}
            </label>

            <label className="leaderboard__field">
              <span>Transaction hash</span>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x…"
                autoComplete="off"
                spellCheck={false}
                className="leaderboard__mono"
                aria-invalid={Boolean(fieldErrors.txHash)}
              />
              {fieldErrors.txHash && <em className="leaderboard__field-error">{fieldErrors.txHash}</em>}
            </label>

            <button type="submit" className="btn btn--primary leaderboard__submit" disabled={submitting}>
              {submitting ? (verifyOnchain ? 'Verifying on-chain…' : 'Submitting…') : 'Submit transaction'}
            </button>

            {status && (
              <p className={`leaderboard__status leaderboard__status--${status.kind}`} role="status">{status.text}</p>
            )}

            <p className="leaderboard__note">
              {verifyOnchain
                ? 'Each transaction is checked on-chain: it must exist on the chosen testnet and have succeeded.'
                : 'Each transaction hash can only be counted once, for whoever submits it first.'}
            </p>
          </form>
        </section>

        <section className="leaderboard__panel glass" aria-labelledby="lb-table-title">
          <div className="leaderboard__panel-head">
            <h3 id="lb-table-title" className="leaderboard__panel-title">Rankings</h3>
            <button type="button" className="btn btn--ghost leaderboard__refresh" onClick={loadBoard} disabled={loading}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="leaderboard__empty"><div className="spinner" /></div>
          ) : loadError ? (
            <div className="leaderboard__empty leaderboard__empty--error">{loadError}</div>
          ) : board.length === 0 ? (
            <div className="leaderboard__empty">No submissions yet. Be the first builder on the board.</div>
          ) : (
            <div className="leaderboard__table-wrap">
              <table className="leaderboard__table">
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Builder</th>
                    <th scope="col" className="num">Transactions</th>
                    <th scope="col" className="num">Chains</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((row) => (
                    <tr key={row.telegram} className={row.telegram === highlight ? 'is-you' : undefined}>
                      <td className="leaderboard__rank">{MEDALS[row.rank - 1] || `#${row.rank}`}</td>
                      <td className="leaderboard__handle">@{row.telegram}</td>
                      <td className="num">{row.txCount}</td>
                      <td className="num">{row.chainCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LeaderboardView;
