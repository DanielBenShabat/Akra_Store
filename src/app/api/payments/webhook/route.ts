import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { confirmPaidOrder, cancelPendingOrder } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

/**
 * Server-to-server payment webhook (Grow/Meshulam).
 *
 * Trust model: this endpoint — NOT the browser return URL — is the authoritative
 * source of payment outcomes. Every request is HMAC-verified against
 * GROW_WEBHOOK_SECRET over the RAW body before we touch any order.
 *
 * Idempotent by design: `confirmPaidOrder` delegates to the `confirm_order` RPC,
 * which returns 'already' on repeat deliveries and never double-decrements stock.
 *
 * NOTE: the signature header name and the body field names below follow a
 * sensible default for Grow's callback. Confirm them against your merchant
 * integration guide; only the parsing/verification details change here.
 */

function parseBody(raw: string): Record<string, string> {
  // Grow posts form-encoded; tolerate JSON too.
  try {
    const json = JSON.parse(raw);
    if (json && typeof json === 'object') {
      return Object.fromEntries(
        Object.entries(json).map(([k, v]) => [k, String(v)]),
      );
    }
  } catch {
    // not JSON → fall through to form parsing
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

function signatureValid(raw: string, header: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Map Grow's status field to our two terminal outcomes. */
function isPaid(status: string | undefined): boolean {
  return status === '1' || status === 'approved' || status === 'success';
}

export async function POST(req: NextRequest) {
  const secret = process.env.GROW_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const raw = await req.text();
  const signature = req.headers.get('x-grow-signature') ?? '';
  if (!signatureValid(raw, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const body = parseBody(raw);
  // `cField` is the order id we passed to Grow and it echoes back.
  const orderId = body.cField ?? body.orderId;
  if (!orderId) {
    // Nothing actionable; acknowledge so Grow stops retrying.
    return NextResponse.json({ received: true });
  }

  try {
    if (isPaid(body.status)) {
      await confirmPaidOrder(orderId);
    } else {
      await cancelPendingOrder(orderId);
    }
  } catch (e) {
    // Surface a 500 so the gateway retries; our confirm path is idempotent.
    const message = e instanceof Error ? e.message : 'Webhook processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
