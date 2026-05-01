# binary-contours

[![npm version](https://img.shields.io/npm/v/binary-contours)](https://www.npmjs.com/package/binary-contours)
[![npm downloads](https://img.shields.io/npm/dm/binary-contours)](https://www.npmjs.com/package/binary-contours)
[![license](https://img.shields.io/npm/l/binary-contours)](./LICENSE)

**binary-contours** is a lightweight, zero-dependency pure TypeScript library for detecting contours in binary images. It implements **Moore Neighborhood Tracing** for contour tracing and an **iterative stack-based Douglas-Peucker** algorithm for polygon simplification — with no external dependencies.

---

## ✨ Features

- 🔍 Contour detection using Moore Neighborhood Tracing
- 📐 Polygon simplification with iterative Douglas-Peucker (no recursion, no stack overflow)
- 📦 Polygon offset (unclipping) — useful for scene text detection pipelines like DBNet
- 📊 Automatic computation of area, perimeter, and bounding rect
- 🧹 Filter contours by area, bounding box size, and vertex count
- 🎯 Zero external dependencies
- ✅ Full TypeScript support (`strict`-compatible, `readonly` types, `verbatimModuleSyntax`-friendly)

---

## 📦 Installation

```bash
# npm
npm install binary-contours

# yarn
yarn add binary-contours

# bun
bun add binary-contours
```

---

## 🚀 Basic Usage

```typescript
import { findContours } from 'binary-contours';

// Prepare pixel data as a Uint8Array (grayscale)
// Each value is 0–255, laid out in row-major order: data[y * width + x]
const width = 100;
const height = 100;
const imageData = new Uint8Array(width * height); // fill with your image data

const contours = findContours(imageData, { width, height });

for (const contour of contours) {
  console.log('Area:', contour.area);
  console.log('Perimeter:', contour.perimeter);
  console.log('Bounding Rect:', contour.boundingRect);
  console.log('Points:', contour.points);
  console.log('Approx Points:', contour.approxPoints);
}
```

---

## 📖 API Reference

### `findContours(data, options)`

The main function for detecting contours in binary image data.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Uint8Array` | Grayscale pixel data in row-major order (`data[y * width + x]`) |
| `options` | `ContoursOptions` | Configuration options (see table below) |

**Returns:** `ContourResult[]` — an array of detected contours sorted by area in descending order.

**Throws:** `Error` if `data.length < width * height`.

---

### `ContoursOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | _(required)_ | Image width in pixels |
| `height` | `number` | _(required)_ | Image height in pixels |
| `threshold` | `number` | `128` | Binarization threshold. Pixels ≥ threshold are treated as foreground |
| `approximation` | `boolean` | `true` | Enable polygon simplification via Douglas-Peucker |
| `epsilon_factor` | `number` | `0.005` | Epsilon factor for Douglas-Peucker. Higher value = more aggressive simplification |
| `unclip_ratio` | `number` | `0` | Polygon expansion ratio. Values > 0 expand the contour outward (useful for text detection) |
| `min_area` | `number` | `0` | Minimum contour area in pixels² — contours below this are discarded |
| `max_area` | `number` | `Infinity` | Maximum contour area in pixels² — contours above this are discarded |
| `min_size` | `number` | `0` | Minimum bounding box width **and** height — contours smaller than this are discarded |
| `min_width` | `number` | `0` | Minimum bounding box width |
| `min_height` | `number` | `0` | Minimum bounding box height |
| `min_vertices` | `number` | `3` | Minimum number of vertices after approximation |

---

### `ContourResult`

Each detected contour is returned as an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `points` | `Point[]` | Raw contour points from the tracing algorithm |
| `approxPoints` | `Point[]` | Simplified points after Douglas-Peucker approximation |
| `area` | `number` | Contour area in pixels² (computed from `approxPoints`) |
| `perimeter` | `number` | Contour perimeter in pixels (computed from `approxPoints`) |
| `boundingRect` | `Rect` | Axis-aligned bounding box of `approxPoints` |
| `unclippedPoints` | `Point[] \| null` | Polygon-offset points. `null` if `unclip_ratio` is `0` |
| `unclippedBoundingRect` | `Rect \| null` | Bounding box of `unclippedPoints`. `null` if not available |

---

### `getCropRect(contour, imgWidth, imgHeight)`

A helper that returns a safe crop rectangle clamped to the image boundaries. It automatically uses `unclippedBoundingRect` when available, falling back to `boundingRect`.

```typescript
import { findContours, getCropRect } from 'binary-contours';

const contours = findContours(data, { width, height, unclip_ratio: 1.5 });

for (const contour of contours) {
  const cropRect = getCropRect(contour, width, height);
  console.log(cropRect); // { x, y, width, height } — safely clamped to image bounds
}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `contour` | `ContourResult` | A contour result from `findContours` |
| `imgWidth` | `number` | Image width used for clamping |
| `imgHeight` | `number` | Image height used for clamping |

**Returns:** `Rect` — `{ x, y, width, height }` safe for cropping.

---

## 🔷 Types

```typescript
type Point = {
  readonly x: number;
  readonly y: number;
};

type Rect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};
```

---

## 🧪 Advanced Examples

### Filter contours by area and size

```typescript
import { findContours } from 'binary-contours';

const contours = findContours(imageData, {
  width,
  height,
  threshold: 128,
  min_area: 100,       // Ignore contours smaller than 100px²
  max_area: 50000,     // Ignore contours larger than 50,000px²
  min_width: 10,       // Minimum bounding box width
  min_height: 5,       // Minimum bounding box height
});
```

### Unclip for text detection (DBNet-style)

```typescript
import { findContours, getCropRect } from 'binary-contours';

const contours = findContours(probabilityMap, {
  width,
  height,
  threshold: Math.round(0.3 * 255),  // 30% threshold
  unclip_ratio: 1.5,                 // Expand polygon outward by 1.5x
  min_area: 16,
  epsilon_factor: 0.002,
});

const crops = contours.map(c => getCropRect(c, width, height));
```

### Disable polygon approximation

```typescript
import { findContours } from 'binary-contours';

// Get all raw contour points without simplification
const contours = findContours(imageData, {
  width,
  height,
  approximation: false, // points and approxPoints will be identical
});
```

### Browser — Canvas API integration

```typescript
import { findContours } from 'binary-contours';

const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const { width, height } = canvas;

// Get pixel data from canvas
const imageData = ctx.getImageData(0, 0, width, height);

// Convert RGBA → grayscale
const gray = new Uint8Array(width * height);
for (let i = 0; i < gray.length; i++) {
  const r = imageData.data[i * 4]!;
  const g = imageData.data[i * 4 + 1]!;
  const b = imageData.data[i * 4 + 2]!;
  gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

const contours = findContours(gray, { width, height, min_area: 50 });

// Draw contours onto the canvas
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;
for (const contour of contours) {
  const pts = contour.approxPoints;
  if (pts.length === 0) continue;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.closePath();
  ctx.stroke();
}
```

### Node.js — Integration with `sharp`

```typescript
import sharp from 'sharp';
import { findContours } from 'binary-contours';

const { data, info } = await sharp('input.png')
  .grayscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const contours = findContours(new Uint8Array(data.buffer), {
  width: info.width,
  height: info.height,
  threshold: 128,
  min_area: 100,
});

console.log(`Found ${contours.length} contours`);
```

---

## ⚙️ How It Works

The library processes images through a multi-stage pipeline:

```
Uint8Array (grayscale)
        │
        ▼
   Binarization
  (threshold → 0/1)
        │
        ▼
  Moore Neighborhood
     Tracing
  (traceAllContours)
        │
        ▼
  Douglas-Peucker
   Simplification
  (if approximation = true)
        │
        ▼
  Geometry & Filtering
  (area, perimeter, bbox,
   min/max filters)
        │
        ▼
  Polygon Offset
  (if unclip_ratio > 0)
        │
        ▼
  ContourResult[]
  (sorted by area ↓)
```

**Moore Neighborhood Tracing** — A boundary-following algorithm using 8-connectivity. Tracing only starts at a `0→1` left-edge transition, ensuring each contour is traced exactly once. A safety limit of `width × height` steps prevents infinite loops.

**Iterative Douglas-Peucker** — A stack-based (non-recursive) implementation that avoids stack overflows on very long contours and eliminates intermediate array allocations. Complexity: O(N log N) worst-case, O(N) best-case.

**Polygon Offset** — Expands a polygon outward by computing edge-parallel lines and their intersections. Expansion distance is calculated as `distance = (area × unclip_ratio) / perimeter`, consistent with the DBNet post-processing approach.

---

## 🏗️ Project Structure

```
binary-contours/
├── index.ts                  # Package entry point (re-exports from src/)
├── src/
│   ├── index.ts              # Public exports
│   ├── types.ts              # Types: Point, Rect, ContourResult, ContoursOptions
│   ├── contours.ts           # findContours() — main function & pipeline
│   ├── tracing.ts            # Moore Neighborhood Tracing
│   ├── douglas-peucker.ts    # Iterative polygon simplification
│   ├── polygon.ts            # Polygon offset (unclipping)
│   ├── geometry.ts           # area, perimeter, bounding box utilities
│   └── helper.ts             # getCropRect() helper
├── package.json
└── tsconfig.json
```

---

## 📄 License

[MIT](./LICENSE) © [khalisafkari](https://github.com/khalisafkari)