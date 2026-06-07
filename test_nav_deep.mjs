import { chromium } from 'playwright';

// Exact Samsung A51 specs
const SAMSUNG_A51 = {
  userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-A515F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  viewport: { width: 412, height: 892 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
};

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext(SAMSUNG_A51);
const page = await ctx.newPage();

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));

await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

// 1. Button presence + bounding box
const btn = page.locator('button[aria-label="Open navigation menu"]');
const box = await btn.boundingBox();
console.log('1. Button bounding box:', JSON.stringify(box));

// 2. Check if anything sits on top of the button's center point
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
const topElement = await page.evaluate(({x, y}) => {
  const el = document.elementFromPoint(x, y);
  return el ? `${el.tagName}.${el.className} | aria-label: ${el.getAttribute('aria-label')}` : 'null';
}, { x: cx, y: cy });
console.log('2. Element at button center:', topElement);

// 3. Check touch-action on button
const touchAction = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="Open navigation menu"]');
  return window.getComputedStyle(btn).touchAction;
});
console.log('3. Computed touch-action on button:', touchAction);

// 4. Check pointer-events on button
const ptrEvents = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="Open navigation menu"]');
  return window.getComputedStyle(btn).pointerEvents;
});
console.log('4. Computed pointer-events on button:', ptrEvents);

// 5. Test with tap()
await btn.tap();
await page.waitForTimeout(400);
const drawerAfterTap = await page.locator('[role="dialog"]').count();
console.log('5. Drawer after .tap():', drawerAfterTap > 0 ? 'OPEN' : 'CLOSED');

// 6. Close and retest with click()
if (drawerAfterTap > 0) {
  const overlay = page.locator('.fixed.inset-0').first();
  await overlay.click();
  await page.waitForTimeout(300);
}
await btn.click();
await page.waitForTimeout(400);
const drawerAfterClick = await page.locator('[role="dialog"]').count();
console.log('6. Drawer after .click():', drawerAfterClick > 0 ? 'OPEN' : 'CLOSED');

// 7. Check nav links
const links = await page.locator('[role="dialog"] a').allTextContents();
console.log('7. Nav links visible:', links);

// 8. Close by tapping backdrop + verify it closes
if (drawerAfterClick > 0) {
  await page.locator('.fixed.inset-0').first().tap();
  await page.waitForTimeout(300);
  const drawerClosed = await page.locator('[role="dialog"]').count();
  console.log('8. Drawer closed after backdrop tap:', drawerClosed === 0 ? 'YES' : 'NO');
}

console.log('\nJS errors:', errors.length ? errors : 'none');

const passed = drawerAfterTap > 0 && drawerAfterClick > 0 && links.length >= 6;
console.log('\n=== VERDICT:', passed ? 'PASS — hamburger works on Samsung A51 simulation' : 'FAIL', '===');

await browser.close();
await Bun?.exit?.(0); 
process.exit(passed ? 0 : 1);
