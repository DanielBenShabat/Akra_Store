import 'server-only';
import sharp from 'sharp';
import convert from 'heic-convert';

// iPhone photos default to HEIC, which the prebuilt sharp binaries cannot
// decode (HEVC patent licensing). Detect the ISO-BMFF `ftyp` brand and
// convert HEIC/HEIF inputs to JPEG with heic-convert before handing the
// buffer to sharp. AVIF shares the container but sharp decodes it natively,
// so its brands are deliberately not listed here.
const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1']);

export function isHeic(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer.toString('ascii', 4, 8) !== 'ftyp') return false;
  return HEIC_BRANDS.has(buffer.toString('ascii', 8, 12));
}

export async function toSharpCompatible(buffer: Buffer): Promise<Buffer> {
  if (!isHeic(buffer)) return buffer;
  const jpeg = await convert({ buffer, format: 'JPEG', quality: 0.9 });
  return Buffer.from(jpeg);
}

export type ProcessedImage = { buffer: Buffer; contentType: string; ext: string };

/**
 * Normalize an uploaded settings image.
 * - `background`: photos (hero / page backgrounds) — downscale to a sane web
 *   size and encode as WebP so multi-MB camera shots don't bloat storage and
 *   page loads.
 * - `graphic`: logos/icons — trim surrounding whitespace, keep transparency
 *   as PNG.
 */
export async function processSettingImage(
  input: Buffer,
  kind: 'background' | 'graphic',
): Promise<ProcessedImage> {
  const source = await toSharpCompatible(input);

  if (kind === 'background') {
    const buffer = await sharp(source)
      .rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    return { buffer, contentType: 'image/webp', ext: 'webp' };
  }

  const buffer = await sharp(source).rotate().trim({ threshold: 10 }).png().toBuffer();
  return { buffer, contentType: 'image/png', ext: 'png' };
}

/**
 * Prepare a product/archive image for storage. Non-HEIC files pass through
 * untouched (existing behavior); HEIC is converted to JPEG so it renders in
 * every browser, not just Safari.
 */
export async function prepareUploadImage(
  file: File,
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const raw = Buffer.from(await file.arrayBuffer());
  if (isHeic(raw)) {
    const jpeg = await convert({ buffer: raw, format: 'JPEG', quality: 0.9 });
    return { buffer: Buffer.from(jpeg), contentType: 'image/jpeg', ext: 'jpg' };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  return { buffer: raw, contentType: file.type || 'application/octet-stream', ext };
}
