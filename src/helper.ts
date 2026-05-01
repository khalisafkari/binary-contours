
// ═══════════════════════════════════════════════════════════
// CROP HELPER
// ═══════════════════════════════════════════════════════════

import type { ContourResult, Rect } from "./types";

/**
 * Mengembalikan rect yang aman untuk cropping gambar.
 * Otomatis clamp ke boundary gambar & menggunakan unclipped rect jika tersedia.
 */
function getCropRect(
  contour: ContourResult,
  imgWidth: number,
  imgHeight: number
): Rect {
  const r = contour.unclippedBoundingRect ?? contour.boundingRect;

  const x = Math.max(0, Math.floor(r.x));
  const y = Math.max(0, Math.floor(r.y));
  const x2 = Math.min(imgWidth, Math.ceil(r.x + r.width));
  const y2 = Math.min(imgHeight, Math.ceil(r.y + r.height));

  return { x, y, width: Math.max(0, x2 - x), height: Math.max(0, y2 - y) };
}

export {
    getCropRect,
}