import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  isUmamiConfigured,
  getStats,
  getPageviewsSeries,
  getMetrics,
  getEventMetrics,
  type MetricRow,
} from '@/lib/umami';
import { getProducts } from '@/lib/data-store';
import VisitorsChart, { type DayPoint } from './VisitorsChart';
import { TrackingToggle } from './TrackingToggle';

export const dynamic = 'force-dynamic';

const TIMEZONE = 'Asia/Jerusalem';
const DAY_MS = 24 * 60 * 60 * 1000;

// Referrers treated as owner/internal traffic and hidden from the breakdown —
// e.g. clicks from the repo's "Live at akrastudioz.com" README link.
const IGNORED_REFERRERS = ['github.com'];
function isIgnoredReferrer(host: string | null): boolean {
  if (!host) return false;
  const h = host.toLowerCase();
  return IGNORED_REFERRERS.some((d) => h === d || h.endsWith(`.${d}`));
}
const RANGES = [7, 30, 90] as const;

/** Epoch ms of local midnight in the store's timezone (server may run in UTC). */
function startOfTodayInTz(tz: string): number {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const utcMidnight = new Date(`${ymd}T00:00:00Z`).getTime();
  const inTz = new Date(new Date(utcMidnight).toLocaleString('en-US', { timeZone: tz }));
  const inUtc = new Date(new Date(utcMidnight).toLocaleString('en-US', { timeZone: 'UTC' }));
  return utcMidnight - (inTz.getTime() - inUtc.getTime());
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Ranked list with a proportional wash bar behind each row (values always visible). */
function BarList({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="rounded-md border border-border p-4">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-3 space-y-1.5">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
        {rows.map((row) => (
          <div key={row.label} className="relative h-8 overflow-hidden rounded-[4px]">
            <div
              className="absolute inset-y-0 left-0 rounded-[4px]"
              style={{ width: `${(row.value / max) * 100}%`, backgroundColor: 'rgba(42, 120, 214, 0.14)' }}
            />
            <div className="relative flex h-full items-center justify-between gap-3 px-2.5">
              <span className="truncate text-sm" dir="ltr">
                {row.label}
              </span>
              <span className="text-sm font-medium tabular-nums">{row.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Purchase funnel: each stage's bar is scaled to the first (widest) stage,
 *  with a step-over-step conversion rate next to the count. */
function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
  const top = Math.max(stages[0]?.value ?? 0, 1);
  return (
    <div className="rounded-md border border-border p-4">
      <h2 className="text-sm font-medium">Purchase funnel</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Views &amp; checkout reached come from page visits; add-to-cart &amp; buy attempts are
        tracked events (counted from launch onward).
      </p>
      <div className="mt-3 space-y-1.5">
        {stages.map((stage, i) => {
          const prev = i === 0 ? null : stages[i - 1].value;
          const pct = prev && prev > 0 ? Math.round((stage.value / prev) * 100) : null;
          return (
            <div
              key={stage.label}
              className="relative h-9 overflow-hidden rounded-[4px] border border-border/60"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-[4px]"
                style={{ width: `${(stage.value / top) * 100}%`, backgroundColor: 'rgba(42, 120, 214, 0.14)' }}
              />
              <div className="relative flex h-full items-center justify-between gap-3 px-2.5">
                <span className="text-sm">{stage.label}</span>
                <span className="tabular-nums">
                  <span className="text-sm font-semibold">{stage.value.toLocaleString()}</span>
                  {pct !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">{pct}%</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function referrerLabel(row: MetricRow): string {
  if (!row.x) return 'Direct / none';
  return row.x;
}

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = (RANGES as readonly number[]).includes(Number(rangeParam)) ? Number(rangeParam) : 30;

  const header = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Who visited the store, where they came from, and what they looked at.
      </p>
    </div>
  );

  if (!isUmamiConfigured()) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Analytics is not connected yet.</p>
          <p>
            The statistics page reads from a self-hosted Umami instance. Set it up with
            <code className="mx-1 rounded bg-muted px-1 py-0.5">deploy/vm/umami/README.md</code>
            and add <code className="rounded bg-muted px-1 py-0.5">UMAMI_*</code> variables to the
            server&apos;s .env, then this page will fill in automatically.
          </p>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const todayStart = startOfTodayInTz(TIMEZONE);
  const rangeStart = todayStart - (range - 1) * DAY_MS;

  try {
    const [todayStats, rangeStats, series, referrersRaw, paths, events, products] =
      await Promise.all([
        getStats(todayStart, now),
        getStats(rangeStart, now),
        getPageviewsSeries(rangeStart, now, TIMEZONE),
        // Over-fetch so hiding ignored referrers doesn't leave a short list.
        getMetrics('referrer', rangeStart, now, 15),
        // Pull a deep path list so we can both list top pages and slice out the
        // per-product detail views for the funnel below.
        getMetrics('path', rangeStart, now, 100),
        getEventMetrics(rangeStart, now, 100),
        getProducts(),
      ]);

    // Drop owner/internal referrers (e.g. the GitHub README link), then trim
    // back to the top 8 for display.
    const referrers = referrersRaw.filter((r) => !isIgnoredReferrer(r.x)).slice(0, 8);

    // "Most viewed pages" — human-facing pages only; the noisy per-product
    // detail URLs get their own named breakdown in the funnel section.
    const pages = paths.filter((p) => !p.x?.startsWith('/product/')).slice(0, 8);

    // Purchase funnel. Views and "reached checkout" are read straight from page
    // visits (retroactive); add-to-cart and buy attempts are custom events, so
    // they only accumulate from the deploy that introduced them onward.
    const PRODUCT_PREFIX = '/product/';
    const nameById = new Map(products.map((p) => [p.id, p.name]));
    const itemViewRows = paths
      .filter((p) => p.x?.startsWith(PRODUCT_PREFIX))
      .map((p) => ({
        label: nameById.get(p.x!.slice(PRODUCT_PREFIX.length)) ?? 'Removed / unknown item',
        value: p.y,
      }))
      .sort((a, b) => b.value - a.value);

    const itemViews = itemViewRows.reduce((sum, r) => sum + r.value, 0);
    const reachedCheckout = paths.find((p) => p.x === '/checkout')?.y ?? 0;
    const addToCart = events.find((e) => e.x === 'add-to-cart')?.y ?? 0;
    const triedToBuy = events.find((e) => e.x === 'checkout-submit')?.y ?? 0;

    const funnelStages = [
      { label: 'Viewed an item', value: itemViews },
      { label: 'Added to cart', value: addToCart },
      { label: 'Reached checkout', value: reachedCheckout },
      { label: 'Tried to buy', value: triedToBuy },
    ];

    // Umami omits empty buckets; rebuild a continuous day axis so the chart
    // doesn't silently skip quiet days.
    const sessionsByDay = new Map(series.sessions.map((p) => [p.x.slice(0, 10), p.y]));
    const viewsByDay = new Map(series.pageviews.map((p) => [p.x.slice(0, 10), p.y]));
    const days: DayPoint[] = Array.from({ length: range }, (_, i) => {
      const t = rangeStart + i * DAY_MS;
      const key = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date(t + DAY_MS / 2));
      const label = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIMEZONE, day: 'numeric', month: 'short',
      }).format(new Date(t + DAY_MS / 2));
      return { label, visitors: sessionsByDay.get(key) ?? 0, views: viewsByDay.get(key) ?? 0 };
    });

    const avgDuration =
      rangeStats.visits > 0 ? rangeStats.totaltime / rangeStats.visits : 0;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          {header}
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={r === 30 ? '/admin/statistics' : `/admin/statistics?range=${r}`}
                className={cn(
                  'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors',
                  r === range
                    ? 'bg-muted font-semibold'
                    : 'text-muted-foreground hover:bg-muted/60',
                )}
              >
                {r === range && <Check className="h-4 w-4" strokeWidth={3} />}
                Last {r} days
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Visitors today" value={todayStats.visitors.toLocaleString()} />
          <StatTile label="Page views today" value={todayStats.pageviews.toLocaleString()} />
          <StatTile
            label={`Visitors, last ${range} days`}
            value={rangeStats.visitors.toLocaleString()}
          />
          <StatTile
            label="Average time on site"
            value={formatDuration(avgDuration)}
            hint={`per visit, last ${range} days`}
          />
        </div>

        <div className="rounded-md border border-border p-4">
          <h2 className="text-sm font-medium">Visitors per day</h2>
          <p className="text-xs text-muted-foreground">Unique visitors, last {range} days</p>
          <VisitorsChart days={days} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarList
            title="Where visitors came from"
            rows={referrers.map((r) => ({ label: referrerLabel(r), value: r.y }))}
            empty="No visits recorded in this period yet."
          />
          <BarList
            title="Most viewed pages"
            rows={pages.map((p) => ({ label: p.x || '/', value: p.y }))}
            empty="No page views recorded in this period yet."
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Funnel stages={funnelStages} />
          <BarList
            title="Most viewed items"
            rows={itemViewRows}
            empty="No item views recorded in this period yet."
          />
        </div>

        <TrackingToggle />
      </div>
    );
  } catch (e) {
    console.error('[admin] statistics fetch failed', e);
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-md border border-border p-6 text-sm space-y-1">
          <p className="font-medium">Could not reach the analytics server.</p>
          <p className="text-muted-foreground">
            Check that Umami is running on the VM (see deploy/vm/umami/README.md) and that the
            UMAMI_* environment variables are correct.
          </p>
        </div>
      </div>
    );
  }
}
