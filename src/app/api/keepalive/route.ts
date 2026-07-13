import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Supabase free-tier projects are paused after ~1 week without API activity.
// This endpoint issues a real DB query so a scheduled ping
// (.github/workflows/supabase-keepalive.yml) counts as activity.
export const dynamic = 'force-dynamic';

export async function GET() {
  const { error } = await supabase.from('site_settings').select('key').limit(1);

  if (error) {
    console.error('[keepalive] supabase query failed', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
