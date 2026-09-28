/**
 * Serve uploaded (Supabase Storage) images through Vercel Image Optimization.
 *
 * Supabase's free plan counts every image download — even CDN cache hits —
 * against a 5 GB/month bandwidth quota, and puja photos are uploaded as 2 MB
 * PNGs. When the quota ran out the whole project was blocked and the site
 * showed "No pujas available". `/_vercel/image` fetches each original from
 * Supabase once per width, then serves a resized WebP/AVIF from Vercel's CDN
 * for a year, so Supabase bandwidth stays near zero.
 *
 * Widths and qualities must match the `images` block in vercel.json.
 */

export const IMAGE_WIDTHS = [64, 128, 256, 384, 640, 828, 1200] as const;
const QUALITY = 75;

const STORAGE_PATH = "/storage/v1/object/public/";

export const isStorageImage = (url: string | null | undefined): url is string =>
  !!url && /^https:\/\/[a-z0-9]+\.supabase\.co\//.test(url) && url.includes(STORAGE_PATH);

/** Smallest allowed width that is at least `w` (largest if none). */
export const allowedWidth = (w: number): number =>
  IMAGE_WIDTHS.find((a) => a >= w) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];

/** `/_vercel/image` exists only on Vercel deployments, not in `vite dev`. */
const optimizerEnabled = (): boolean => import.meta.env.PROD && import.meta.env.MODE !== "test";

export function optimizedImage(url: string, width: number, enabled = optimizerEnabled()): string {
  if (!enabled || !isStorageImage(url)) return url;
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${allowedWidth(width)}&q=${QUALITY}`;
}

/** `srcset` for an image shown at about `displayWidth` CSS px (covers 1x–3x screens). */
export function imageSrcSet(url: string, displayWidth: number, enabled = optimizerEnabled()): string | undefined {
  if (!enabled || !isStorageImage(url)) return undefined;
  const widths = [...new Set([1, 2, 3].map((dpr) => allowedWidth(displayWidth * dpr)))];
  return widths.map((w) => `${optimizedImage(url, w, true)} ${w}w`).join(", ");
}
