// Shared by client upload UIs. Must stay below the server action
// bodySizeLimit in next.config.ts (25mb) — FormData encoding adds overhead,
// and exceeding the body limit fails with an opaque network error instead of
// a readable message, so we validate before sending.
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function uploadSizeError(file: File): string | null {
  if (file.size <= MAX_UPLOAD_BYTES) return null;
  const mb = (file.size / (1024 * 1024)).toFixed(1);
  return `Image is too large (${mb}MB). Maximum is 20MB — please export it smaller and try again.`;
}
