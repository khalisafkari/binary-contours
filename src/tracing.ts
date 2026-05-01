
// ═══════════════════════════════════════════════════════════
// MOORE NEIGHBORHOOD TRACING
// ═══════════════════════════════════════════════════════════

import type { Point } from "./types";

const DX = [1, 1, 0, -1, -1, -1, 0, 1] as const;
const DY = [0, 1, 1, 1, 0, -1, -1, -1] as const;

function traceAllContours(
    binary: Uint8Array,
    width: number,
    height: number
): Point[][] {
    const contours: Point[][] = [];
    const visited = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
        const rowOffset = y * width;
        for (let x = 0; x < width; x++) {
            const idx = rowOffset + x;
            if (binary[idx] !== 1 || visited[idx] === 1) continue;
            // Hanya mulai di transisi 0→1 dari kiri
            if (x > 0 && binary[rowOffset + x - 1] === 1) continue;

            const contour = mooreTrace(binary, width, height, x, y, visited);
            if (contour.length >= 3) contours.push(contour);
        }
    }

    return contours;
}

function mooreTrace(
    binary: Uint8Array,
    width: number,
    height: number,
    startX: number,
    startY: number,
    visited: Uint8Array
): Point[] {
    const contour: Point[] = [];
    let cx = startX;
    let cy = startY;
    let backtrackDir = 4;
    let startDir = -1;

    // Safety limit: contour tidak mungkin lebih panjang dari total piksel
    const limit = width * height;

    for (let step = 0; step < limit; step++) {
        contour.push({ x: cx, y: cy });
        visited[cy * width + cx] = 1;

        const startSearch = (backtrackDir + 1) % 8;
        let found = false;

        for (let i = 0; i < 8; i++) {
            const dir = (startSearch + i) % 8;
            const nx = cx + DX[dir]!;
            const ny = cy + DY[dir]!;

            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            if (binary[ny * width + nx] === 1) {
                if (step === 0) startDir = dir;
                backtrackDir = (dir + 4) % 8;
                cx = nx;
                cy = ny;
                found = true;
                break;
            }
        }

        if (!found) break;

        // Jacob's stopping criterion
        if (step > 0 && cx === startX && cy === startY) {
            if (backtrackDir === ((startDir + 4) % 8) || contour.length > 4) break;
        }
    }

    return contour;
}


export {
    mooreTrace,
    traceAllContours,
}