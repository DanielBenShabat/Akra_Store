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

// Umami has returned both `{ value, prev }` and `{ value, change }` shapes
// across versions; read `value` and tolerate the rest.
type StatValue = { value: number };

export type UmamiStats = {
  pageviews: StatValue;
  visitors: StatValue;
  visits: StatValue;
  bounces: StatValue;
  totaltime: StatValue;
};

export async function getStats(startAt: number, endAt: number): Promise<UmamiStats> {
  return apiGet<UmamiStats>('/stats', { startAt, endAt });
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

export async function getMetrics(
  type: 'url' | 'referrer' | 'browser' | 'device' | 'country',
  startAt: number,
  endAt: number,
  limit = 10,
): Promise<MetricRow[]> {
  return apiGet<MetricRow[]>('/metrics', { type, startAt, endAt, limit });
}
