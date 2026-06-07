import { chromium } from 'playwright';

const MOBILE = {
  userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  viewport: { width: 412, height: 915 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext(MOBILE);
const page = await ctx.newPage();

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));

await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

const btn = page.locator('button[aria-label="Open navigation menu"]');
console.log('Hamburger found:', await btn.count());

await btn.tap();
await page.waitForTimeout(600);

const drawerAfter = await page.locator('[role="dialog"]').count();
const archiveLink = await page.locator('a[href="/archive"]').count();

console.log('Drawer after tap:', drawerAfter);
console.log('Archive link in DOM:', archiveLink);
console.log('JS errors:', errors.length ? errors : 'none');

const passed = drawerAfter > 0 && archiveLink > 0;
console.log('\nVERDICT:', passed ? 'PASS' : 'FAIL');

await browser.close();
process.exit(passed ? 0 : 1);
