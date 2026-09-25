// ─── Regional payment routing — Paystack / Flutterwave inline checkout ───────
// React port of the tested regional-gateway-router POC (public/checkout in moracademy-careers-leaderboard-wiring).
// Only PUBLIC keys ever reach the browser. A browser success callback is not proof of payment: production
// fulfilment must verify the transaction server-side (provider verify API / webhooks).

export type CountryCode = 'NG' | 'KE' | 'TZ' | 'BW' | 'ZA' | 'GH' | 'RW';
type Provider = 'paystack' | 'flutterwave';

export interface PaymentRoute {
  country: CountryCode;
  countryName: string;
  provider: Provider;
  currency: string;
  methods: string[];   // Paystack `channels` / Flutterwave `payment_options`
  label: string;
}

export const PAYMENT_ROUTES: PaymentRoute[] = [
  { country: 'NG', countryName: 'Nigeria',      provider: 'paystack',    currency: 'NGN', methods: ['bank_transfer'],       label: 'Paystack Bank Transfer' },
  { country: 'KE', countryName: 'Kenya',        provider: 'flutterwave', currency: 'KES', methods: ['mpesa'],               label: 'Flutterwave M-Pesa' },
  { country: 'TZ', countryName: 'Tanzania',     provider: 'flutterwave', currency: 'TZS', methods: ['mobilemoneytanzania'], label: 'Flutterwave Mobile Money' },
  { country: 'BW', countryName: 'Botswana',     provider: 'flutterwave', currency: 'BWP', methods: ['card'],                label: 'Flutterwave Card' },
  { country: 'ZA', countryName: 'South Africa', provider: 'paystack',    currency: 'ZAR', methods: ['eft', 'card'],         label: 'Paystack Instant EFT & Card' },
  { country: 'GH', countryName: 'Ghana',        provider: 'paystack',    currency: 'GHS', methods: ['card'],                label: 'Paystack Card' },
  { country: 'RW', countryName: 'Rwanda',       provider: 'flutterwave', currency: 'RWF', methods: ['mobilemoneyrwanda'],   label: 'Flutterwave MTN MoMo' },
];

// Plan prices are set in USD; each route charges its local currency.
// INDICATIVE rates (open.er-api.com, 2026-09-25) — the business must confirm or replace these before going live.
export const USD_TO_LOCAL: Record<string, number> = {
  NGN: 1328, KES: 129.5, TZS: 2644, BWP: 13.86, ZAR: 16.43, GHS: 11.57, RWF: 1478,
};

/** Local-currency amount for a USD price, rounded to whole units. */
export function localAmount(usd: number, route: PaymentRoute): number {
  return Math.round(usd * USD_TO_LOCAL[route.currency]);
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

// Same rule as the backend: 5-32 letters/digits/underscores, starting with a letter.
const HANDLE_RE = /^[a-z][a-z0-9_]{4,31}$/;
export function normaliseTelegram(raw: string): string | null {
  const handle = raw.trim().replace(/^@/, '').toLowerCase();
  return HANDLE_RE.test(handle) ? handle : null;
}

export function generateReference(country: CountryCode): string {
  const words = new Uint32Array(2);
  crypto.getRandomValues(words);
  return `mor-${country}-${Date.now()}-${words[0].toString(16)}${words[1].toString(16)}`;
}

const PAYSTACK_PUBLIC_KEY = ((import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || '').trim();
const FLUTTERWAVE_PUBLIC_KEY = ((import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string) || '').trim();

const SCRIPTS: Record<Provider, string> = {
  paystack: 'https://js.paystack.co/v2/inline.js',
  flutterwave: 'https://checkout.flutterwave.com/v3.js',
};

/** Simulated success, for trying the flow without provider keys. Only on localhost with ?simulate=1. */
export function isSimulation(): boolean {
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return local && new URLSearchParams(window.location.search).get('simulate') === '1';
}

export function isProviderConfigured(provider: Provider): boolean {
  return Boolean(provider === 'paystack' ? PAYSTACK_PUBLIC_KEY : FLUTTERWAVE_PUBLIC_KEY);
}

const scriptLoads: Partial<Record<Provider, Promise<void>>> = {};
function loadProviderScript(provider: Provider): Promise<void> {
  scriptLoads[provider] ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPTS[provider];
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      delete scriptLoads[provider];
      script.remove();
      reject(new Error(`Could not load the ${provider === 'paystack' ? 'Paystack' : 'Flutterwave'} checkout. Check your connection and try again.`));
    };
    document.head.appendChild(script);
  });
  return scriptLoads[provider]!;
}

export interface CheckoutAttempt {
  route: PaymentRoute;
  telegramHandle: string;
  email: string;
  amount: number;      // major units of route.currency
  reference: string;
  description: string;
}

export type CheckoutOutcome = 'success' | 'cancelled';

/** Opens the provider's inline checkout. Resolves on success/cancel; rejects on errors. */
export async function openCheckout(attempt: CheckoutAttempt): Promise<CheckoutOutcome> {
  if (isSimulation()) {
    await new Promise((r) => setTimeout(r, 400));
    return 'success';
  }
  const { provider } = attempt.route;
  if (!isProviderConfigured(provider)) {
    throw new Error(`${provider === 'paystack' ? 'Paystack' : 'Flutterwave'} payments are not configured yet. Please try again later.`);
  }
  await loadProviderScript(provider);
  return provider === 'paystack' ? payWithPaystack(attempt) : payWithFlutterwave(attempt);
}

function payWithPaystack(attempt: CheckoutAttempt): Promise<CheckoutOutcome> {
  const PaystackPop = (window as any).PaystackPop;
  if (typeof PaystackPop !== 'function') throw new Error('Paystack checkout is unavailable. Please try again.');
  return new Promise((resolve, reject) => {
    new PaystackPop().newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email: attempt.email,
      amount: Math.round(attempt.amount * 100),   // Paystack takes the currency's subunit (kobo, pesewas, cents)
      currency: attempt.route.currency,
      channels: attempt.route.methods,
      reference: attempt.reference,
      metadata: { telegramHandle: attempt.telegramHandle, chosenCountryNode: attempt.route.country, plan: attempt.description },
      onSuccess: (tx: any) => {
        const ref = tx?.reference || tx?.trxref;
        if (ref && ref !== attempt.reference) reject(new Error('Paystack returned an unexpected transaction reference.'));
        else resolve('success');
      },
      onCancel: () => resolve('cancelled'),
      onError: (err: any) => reject(new Error(err?.message || 'Unable to open Paystack checkout.')),
    });
  });
}

function payWithFlutterwave(attempt: CheckoutAttempt): Promise<CheckoutOutcome> {
  const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;
  if (typeof FlutterwaveCheckout !== 'function') throw new Error('Flutterwave checkout is unavailable. Please try again.');
  return new Promise((resolve, reject) => {
    let settled = false;
    const modal = FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: attempt.reference,
      amount: attempt.amount,
      currency: attempt.route.currency,
      payment_options: attempt.route.methods.join(','),
      customer: { email: attempt.email },
      meta: { telegramHandle: attempt.telegramHandle, chosenCountryNode: attempt.route.country },
      customizations: { title: 'MOR Developer Academy', description: attempt.description },
      callback: (payment: any) => {
        settled = true;
        if (payment?.status !== 'successful') reject(new Error('Flutterwave did not report a successful payment.'));
        else if (payment?.tx_ref && payment.tx_ref !== attempt.reference) reject(new Error('Flutterwave returned an unexpected transaction reference.'));
        else resolve('success');
        modal?.close?.();
      },
      onclose: () => {
        if (!settled) resolve('cancelled');
      },
    });
  });
}
