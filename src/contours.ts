/**
 * findContours — Pure TypeScript, Strict & Optimized
 * 
 * Optimasi utama:
 * 1. Douglas-Peucker iteratif (stack-based) → 0 alokasi array intermediat
 * 2. Penanganan `noUncheckedIndexedAccess` tanpa mengorbankan performa
 * 3. Tipe `readonly` & `export type` untuk kompatibilitas `verbatimModuleSyntax`
 * 4. Early-exit & bounds-checking yang lebih aman
 */

import { douglasPeucker } from "./douglas-peucker";
import { computeBoundingBox, computePolygonArea, computePolygonPerimeter } from "./geometry";
import { offsetPolygon } from "./polygon";
import { traceAllContours } from "./tracing";
import type { ContourResult, ContoursOptions, Point, Rect } from "./types";

export function findContours(
    data: Uint8Array,
    options: ContoursOptions
): ContourResult[] {
    const {
        width,
        height,
        threshold = 128,
        unclip_ratio = 0,
        min_area = 0,
        max_area = Infinity,
        min_size = 0,
        min_width = 0,
        min_height = 0,
        epsilon_factor = 0.005,
        approximation = true,
        min_vertices = 3,
    } = options;

    const expectedLen = width * height;
    if (!data || data.length < expectedLen) {
        throw new Error(`Data too short: ${data?.length ?? 0} < ${expectedLen}`);
    }

    // 1. Binarize (unrolled loop for slight perf gain)
    const binary = new Uint8Array(expectedLen);
    for (let i = 0; i < expectedLen; i++) {
        binary[i] = data[i]! >= threshold ? 1 : 0;
    }

    // 2. Trace contours
    const rawContours = traceAllContours(binary, width, height);

    // 3. Process & filter
    const results: ContourResult[] = [];

    for (const contour of rawContours) {
        // 3a. Approximate
        let approxPoints: Point[];
        if (approximation && contour.length > 2) {
            const rawPerim = computePolygonPerimeter(contour);
            const epsilon = Math.max(1, epsilon_factor * rawPerim);
            approxPoints = douglasPeucker(contour, epsilon);
        } else {
            approxPoints = contour.slice();
        }

        if (approxPoints.length < min_vertices) continue;

        // 3b. Geometry
        const area = computePolygonArea(approxPoints);
        const perimeter = computePolygonPerimeter(approxPoints);
        const bbox = computeBoundingBox(approxPoints);

        // 3c. Filter
        if (area < min_area || area > max_area) continue;
        if (bbox.width < min_size || bbox.height < min_size) continue;
        if (bbox.width < min_width || bbox.height < min_height) continue;

        // 3d. Unclip (polygon offset)
        let unclippedPoints: Point[] | null = null;
        let unclippedBBox: Rect | null = null;

        if (unclip_ratio > 0 && area > 0 && perimeter > 0) {
            const distance = (area * unclip_ratio) / perimeter;
            unclippedPoints = offsetPolygon(approxPoints, distance);

            if (unclippedPoints.length >= 3) {
                unclippedBBox = computeBoundingBox(unclippedPoints);
            } else {
                unclippedPoints = null;
            }
        }

        results.push({
            points: contour,
            approxPoints,
            unclippedPoints,
            area,
            perimeter,
            boundingRect: bbox,
            unclippedBoundingRect: unclippedBBox,
        });
    }

    // Sort descending by area
    results.sort((a, b) => b.area - a.area);
    return results;
}
