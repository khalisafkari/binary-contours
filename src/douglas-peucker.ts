
// ═══════════════════════════════════════════════════════════
// DOUGLAS-PEUCKER (ITERATIVE STACK-BASED)
// ═══════════════════════════════════════════════════════════


import type { Point } from "./types";

/**
 * Versi iteratif: menghindari `.slice()` rekursif yang mahal.
 * Kompleksitas: O(N log N) worst-case, O(N) best-case.
 * Memory: O(N) untuk stack & keep-array.
 */
function douglasPeucker(pts: readonly Point[], epsilon: number): Point[] {
    const n = pts.length;
    if (n <= 2) return pts.slice();

    const keep = new Uint8Array(n);
    keep[0] = 1;
    keep[n - 1] = 1;

    const stack: [number, number][] = [[0, n - 1]];

    while (stack.length > 0) {
        const range = stack.pop()!;
        const start = range[0];
        const end = range[1];

        if (end - start <= 1) continue;

        let maxDist = 0;
        let maxIdx = start;

        const p1 = pts[start]!;
        const p2 = pts[end]!;

        for (let i = start + 1; i < end; i++) {
            const d = perpDist(pts[i]!, p1, p2);
            if (d > maxDist) {
                maxDist = d;
                maxIdx = i;
            }
        }

        if (maxDist > epsilon) {
            keep[maxIdx] = 1;
            stack.push([start, maxIdx], [maxIdx, end]);
        }
    }

    // Filter hanya titik yang ditandai
    const result: Point[] = [];
    for (let i = 0; i < n; i++) {
        if (keep[i] === 1) result.push(pts[i]!);
    }
    return result;
}

function perpDist(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);

    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export {
    douglasPeucker,
    perpDist,
}