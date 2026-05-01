// ═══════════════════════════════════════════════════════════
// POLYGON OFFSET — EDGE INTERSECTION METHOD
// ═══════════════════════════════════════════════════════════


import { signedArea } from "./geometry";
import type { Point } from "./types";

function offsetPolygon(pts: readonly Point[], distance: number): Point[] {
    const n = pts.length;
    if (n < 3 || distance === 0) return pts.slice();

    // Normalisasi ke CW (image coords: y-down → signedArea > 0 = CW)
    const sa = signedArea(pts);
    const poly = sa > 0 ? pts : [...pts].reverse();

    const offsetLines: Array<{ a: Point; b: Point }> = [];

    for (let i = 0; i < n; i++) {
        const curr = poly[i]!;
        const next = poly[(i + 1) % n]!;

        const dx = next.x - curr.x;
        const dy = next.y - curr.y;
        const len = Math.hypot(dx, dy);

        if (len < 1e-10) continue;

        // Right normal = outward untuk CW di image coords
        const nx = dy / len;
        const ny = -dx / len;

        offsetLines.push({
            a: { x: curr.x + nx * distance, y: curr.y + ny * distance },
            b: { x: next.x + nx * distance, y: next.y + ny * distance },
        });
    }

    if (offsetLines.length < 3) return pts.slice();

    const result: Point[] = [];
    const m = offsetLines.length;

    for (let i = 0; i < m; i++) {
        const currLine = offsetLines[i]!;
        const nextLine = offsetLines[(i + 1) % m]!;

        const inter = lineIntersection(currLine.a, currLine.b, nextLine.a, nextLine.b);

        if (inter) {
            result.push(inter);
        } else {
            // Parallel edges: gunakan midpoint
            result.push({
                x: (currLine.b.x + nextLine.a.x) / 2,
                y: (currLine.b.y + nextLine.a.y) / 2,
            });
        }
    }

    return result;
}

function lineIntersection(
    a1: Point, a2: Point,
    b1: Point, b2: Point
): Point | null {
    const d1x = a2.x - a1.x;
    const d1y = a2.y - a1.y;
    const d2x = b2.x - b1.x;
    const d2y = b2.y - b1.y;

    const denom = d1x * d2y - d1y * d2x;
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((b1.x - a1.x) * d2y - (b1.y - a1.y) * d2x) / denom;

    return {
        x: a1.x + t * d1x,
        y: a1.y + t * d1y,
    };
}

export {
    lineIntersection,
    offsetPolygon,
}