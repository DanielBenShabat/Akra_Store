import { NextResponse } from 'next/server';

// Placeholder webhook endpoint for a real payment provider (e.g. Grow/Meshulam/Stripe).
// A real implementation verifies the request signature and updates the matching
// order's status. The simulated provider confirms payment inline and does not use this.
export async function POST() {
  return NextResponse.json({ received: true });
}
