
// ═══════════════════════════════════════════════════════════
// GEOMETRY
// ═══════════════════════════════════════════════════════════


import type { Point, Rect } from "./types";

function signedArea(pts: readonly Point[]): number {
    let a = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
        const p1 = pts[i]!;
        const p2 = pts[(i + 1) % n]!;
        a += p1.x * p2.y - p2.x * p1.y;
    }
    return a / 2;
}

function computePolygonArea(pts: readonly Point[]): number {
    return Math.abs(signedArea(pts));
}

function computePolygonPerimeter(pts: readonly Point[]): number {
    let p = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
        const p1 = pts[i]!;
        const p2 = pts[(i + 1) % n]!;
        p += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
    return p;
}

function computeBoundingBox(pts: readonly Point[]): Rect {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of pts) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export {
    computeBoundingBox,
    computePolygonPerimeter,
    computePolygonArea,
    signedArea
}