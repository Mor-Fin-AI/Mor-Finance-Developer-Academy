// ─── CheckoutModal — pays for a subscription plan via Paystack / Flutterwave ───
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { postPaymentCallback } from '../../api/client';
import {
  PAYMENT_ROUTES,
  formatMoney,
  generateReference,
  isSimulation,
  localAmount,
  normaliseTelegram,
  openCheckout,
  type CountryCode,
} from './checkout/paymentGateways';
import './CheckoutModal.css';

export interface CheckoutPlan {
  name: string;
  price: number; // USD per month
  icon: string;
}

interface CheckoutModalProps {
  plan: CheckoutPlan;
  onClose: () => void;
  onSubscribed: (planName: string) => void;
}

type Phase =
  | { step: 'form' }
  | { step: 'paying' }
  | { step: 'confirming' }
  | { step: 'subscribed'; handle: string; reference: string }
  | { step: 'pending'; reference: string };

type FieldErrors = Partial<Record<'country' | 'telegram' | 'email', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, onClose, onSubscribed }) => {
  const [country, setCountry] = useState<CountryCode | ''>('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);
  const [phase, setPhase] = useState<Phase>({ step: 'form' });
  const simulation = isSimulation();

  const route = useMemo(() => PAYMENT_ROUTES.find((r) => r.country === country), [country]);
  const amount = route ? localAmount(plan.price, route) : 0;
  const busy = phase.step === 'paying' || phase.step === 'confirming';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const handle = normaliseTelegram(telegram);
    const next: FieldErrors = {};
    if (!route) next.country = 'Select the country you are paying from.';
    if (!handle) next.telegram = 'Use your Telegram username: 5–32 letters, digits or underscores, starting with a letter.';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter the email address for your payment receipt.';
    setErrors(next);
    if (!route || !handle || Object.keys(next).length) return;

    const reference = generateReference(route.country);
    setPhase({ step: 'paying' });
    let outcome;
    try {
      outcome = await openCheckout({
        route,
        telegramHandle: handle,
        email: email.trim(),
        amount,
        reference,
        description: `${plan.name} plan — monthly`,
      });
    } catch (err: any) {
      setPhase({ step: 'form' });
      setNotice({ kind: 'error', text: err?.message || 'Unable to start the payment. Please try again.' });
      return;
    }
    if (outcome === 'cancelled') {
      setPhase({ step: 'form' });
      setNotice({ kind: 'info', text: 'Checkout was closed before the payment completed. You have not been charged.' });
      return;
    }

    setPhase({ step: 'confirming' });
    const result = await postPaymentCallback({
      telegramHandle: handle,
      chosenCountryNode: route.country,
      paymentAmount: amount,
      transactionReference: reference,
      plan: plan.name,
    });
    if (result.ok) {
      setPhase({ step: 'subscribed', handle, reference });
      onSubscribed(plan.name);
    } else {
      console.warn('[checkout] payment succeeded but the subscription callback was refused:', result.status, result.code, result.message);
      setPhase({ step: 'pending', reference });
    }
  };

  const edit = (field: keyof FieldErrors, apply: () => void) => {
    apply();
    if (errors[field]) setErrors(({ [field]: _cleared, ...rest }) => rest);
  };

  // Portal to <body>: the plans page sits inside a transformed/blurred container, which would
  // otherwise trap this fixed overlay inside it instead of covering the viewport.
  return createPortal(
    <div className="checkout-overlay" onClick={() => !busy && onClose()}>
      <div
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="checkout-modal__header">
          <div className="checkout-modal__plan">
            <span className="checkout-modal__icon">{plan.icon}</span>
            <div>
              <h3 id="checkout-title">Subscribe to {plan.name}</h3>
              <p>${plan.price} / month</p>
            </div>
          </div>
          <button type="button" className="checkout-modal__close" onClick={onClose} disabled={busy} aria-label="Close checkout">
            ✕
          </button>
        </div>

        {phase.step === 'subscribed' ? (
          <div className="checkout-modal__result">
            <div className="checkout-modal__result-icon">✓</div>
            <h4>You're subscribed to {plan.name}</h4>
            <p>
              Your subscription is active for <strong>@{phase.handle}</strong>.
            </p>
            <p className="checkout-modal__ref">Reference: {phase.reference}</p>
            <button type="button" className="btn btn--primary" onClick={onClose}>Done</button>
          </div>
        ) : phase.step === 'pending' ? (
          <div className="checkout-modal__result">
            <div className="checkout-modal__result-icon checkout-modal__result-icon--pending">⏳</div>
            <h4>Payment received — activation pending</h4>
            <p>
              The payment provider confirmed your payment. Your {plan.name} subscription will be activated once the
              payment is verified. Keep this reference in case you need to contact support.
            </p>
            <p className="checkout-modal__ref">Reference: {phase.reference}</p>
            <button type="button" className="btn btn--secondary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="checkout-modal__form" onSubmit={handlePay} noValidate>
            {simulation && (
              <p className="checkout-modal__notice checkout-modal__notice--info">
                Simulation mode: no payment widget opens and a successful payment is simulated.
              </p>
            )}

            <label className="checkout-modal__field">
              <span>Country</span>
              <select
                value={country}
                onChange={(e) => edit('country', () => setCountry(e.target.value as CountryCode | ''))}
                disabled={busy}
                aria-invalid={Boolean(errors.country)}
              >
                <option value="">Select your country</option>
                {PAYMENT_ROUTES.map((r) => (
                  <option key={r.country} value={r.country}>{r.countryName} — {r.label}</option>
                ))}
              </select>
              {errors.country && <em>{errors.country}</em>}
            </label>

            <label className="checkout-modal__field">
              <span>Telegram handle</span>
              <input
                type="text"
                value={telegram}
                onChange={(e) => edit('telegram', () => setTelegram(e.target.value))}
                placeholder="@your_handle"
                autoComplete="off"
                maxLength={33}
                disabled={busy}
                aria-invalid={Boolean(errors.telegram)}
              />
              {errors.telegram && <em>{errors.telegram}</em>}
            </label>

            <label className="checkout-modal__field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => edit('email', () => setEmail(e.target.value))}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={busy}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <em>{errors.email}</em>}
            </label>

            <div className="checkout-modal__summary" aria-live="polite">
              {route ? (
                <>
                  <span>{route.countryName} · {route.label}</span>
                  <strong>{formatMoney(amount, route.currency)} <small>/ month</small></strong>
                  <span className="checkout-modal__summary-note">≈ ${plan.price} USD at an indicative exchange rate</span>
                </>
              ) : (
                <span>Select a country to see your local price and payment method.</span>
              )}
            </div>

            <button type="submit" className="btn btn--primary checkout-modal__pay" disabled={busy}>
              {phase.step === 'paying'
                ? 'Complete the payment in the checkout window…'
                : phase.step === 'confirming'
                  ? 'Activating your subscription…'
                  : route
                    ? `Pay ${formatMoney(amount, route.currency)}`
                    : 'Continue to payment'}
            </button>

            {notice && (
              <p className={`checkout-modal__notice checkout-modal__notice--${notice.kind}`} role="status">{notice.text}</p>
            )}

            <p className="checkout-modal__secure">
              Payments are processed by Paystack or Flutterwave. Your card and mobile-money details never touch our servers.
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CheckoutModal;
