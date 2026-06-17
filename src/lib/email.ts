import 'server-only';
import { siteConfig } from '@/config/site';
import { formatPrice } from '@/lib/utils';

export interface OrderReceiptItem {
  name: string;
  size: string;
  price: number;
}

export interface OrderReceipt {
  orderId: string;
  email: string;
  firstName: string;
  total: number;
  items: OrderReceiptItem[];
}

/**
 * Send the order confirmation receipt via Resend (https://resend.com).
 *
 * Uses a thin fetch wrapper rather than the SDK to avoid an extra dependency.
 * If RESEND_API_KEY / EMAIL_FROM are not configured (e.g. local dev), it logs
 * and no-ops so the confirmation flow is never blocked. Callers invoke this
 * exactly once per order — on the pending→confirmed transition.
 */
export async function sendOrderConfirmationEmail(receipt: OrderReceipt): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn('[email] RESEND_API_KEY/EMAIL_FROM not set — skipping confirmation email');
    return;
  }

  const symbol = siteConfig.currency.symbol;
  const shortId = receipt.orderId.slice(0, 8);
  const itemLines = receipt.items
    .map((i) => `${i.name} — Size ${i.size} — ${formatPrice(i.price, symbol)}`)
    .join('\n');

  const subject = `Your akra order #${shortId} is confirmed`;
  const text = [
    `Hi ${receipt.firstName},`,
    '',
    'Thanks for your order — your payment has been confirmed.',
    '',
    `Order #${shortId}`,
    itemLines,
    '',
    `Total paid: ${formatPrice(receipt.total, symbol)}`,
    '',
    '— akra',
  ].join('\n');

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#111">
      <p>Hi ${receipt.firstName},</p>
      <p>Thanks for your order — your payment has been confirmed.</p>
      <p style="font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Order #${shortId}</p>
      <ul style="padding-left:18px">
        ${receipt.items
          .map(
            (i) =>
              `<li>${i.name} — Size ${i.size} — ${formatPrice(i.price, symbol)}</li>`,
          )
          .join('')}
      </ul>
      <p style="font-weight:700">Total paid: ${formatPrice(receipt.total, symbol)}</p>
      <p>— akra</p>
    </div>
  `.trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: receipt.email, subject, text, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API responded ${res.status}: ${body}`);
  }
}
