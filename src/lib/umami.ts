import 'server-only';

// Thin client for a self-hosted Umami v2 instance (deploy/vm/umami).
// The Next.js server talks to Umami over localhost; visitors only ever load
// the public tracking script. All functions throw on failure — the admin
// statistics page catches and shows a friendly error.

const APP_URL = process.env.UMAMI_APP_URL; // e.g. http://127.0.0.1:3001
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;
const USERNAME = process.env.UMAMI_USERNAME;
const PASSWORD = process.env.UMAMI_PASSWORD;

export function isUmamiConfigured(): boolean {
  return Boolean(APP_URL && WEBSITE_ID && USERNAME && PASSWORD);
}

let cachedToken: string | null = null;

async function login(): Promise<string> {
  const res = await fetch(`${APP_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Umami login failed (${res.status})`);
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error('Umami login returned no token');
  cachedToken = data.token;
  return data.token;
}

async function apiGet<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${APP_URL}/api/websites/${WEBSITE_ID}${path}?${query}`;

  const attempt = async (token: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });

  let res = await attempt(cachedToken ?? (await login()));
  if (res.status === 401) {
    // Token expired — re-login once.
    res = await attempt(await login());
  }
  if (!res.ok) throw new Error(`Umami API ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

// `/stats` shape has drifted across Umami versions: older builds wrapped each
// metric in `{ value, prev }` / `{ value, change }`, the current build returns
// flat numbers plus a `comparison` object. Normalise everything to plain
// numbers so callers don't care which version is deployed.
type RawStat = number | { value?: number } | null | undefined;

function statValue(v: RawStat): number {
  if (typeof v === 'number') return v;
  return v?.value ?? 0;
}

export type UmamiStats = {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
};

export async function getStats(startAt: number, endAt: number): Promise<UmamiStats> {
  const raw = await apiGet<Record<keyof UmamiStats, RawStat>>('/stats', { startAt, endAt });
  return {
    pageviews: statValue(raw.pageviews),
    visitors: statValue(raw.visitors),
    visits: statValue(raw.visits),
    bounces: statValue(raw.bounces),
    totaltime: statValue(raw.totaltime),
  };
}

export type SeriesPoint = { x: string; y: number };

export async function getPageviewsSeries(
  startAt: number,
  endAt: number,
  timezone: string,
  unit: 'hour' | 'day' = 'day',
): Promise<{ pageviews: SeriesPoint[]; sessions: SeriesPoint[] }> {
  return apiGet('/pageviews', { startAt, endAt, unit, timezone });
}

export type MetricRow = { x: string | null; y: number };

// Note: this Umami version names the page-path metric `path` (older builds used
// `url`). Pass the current name straight through.
export async function getMetrics(
  type: 'path' | 'referrer' | 'browser' | 'device' | 'country',
  startAt: number,
  endAt: number,
  limit = 10,
): Promise<MetricRow[]> {
  return apiGet<MetricRow[]>('/metrics', { type, startAt, endAt, limit });
}

// Counts per custom event name (e.g. the funnel's `add-to-cart` and
// `checkout-submit` events fired from lib/track). `x` is the event name.
export async function getEventMetrics(
  startAt: number,
  endAt: number,
  limit = 100,
): Promise<MetricRow[]> {
  return apiGet<MetricRow[]>('/metrics', { type: 'event', startAt, endAt, limit });
}
