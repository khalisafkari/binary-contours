
export type Point = { readonly x: number; readonly y: number };

export type Rect = {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
};

export type ContourResult = {
    readonly points: Point[];
    readonly approxPoints: Point[];
    readonly unclippedPoints: Point[] | null;
    readonly area: number;
    readonly perimeter: number;
    readonly boundingRect: Rect;
    /** Bounding rect dari unclipped polygon (null jika unclip_ratio = 0) */
    readonly unclippedBoundingRect: Rect | null;
};

export type ContoursOptions = {
    readonly width: number;
    readonly height: number;
    readonly threshold?: number;
    readonly unclip_ratio?: number;
    readonly min_area?: number;
    readonly max_area?: number;
    readonly min_size?: number;
    readonly min_width?: number;
    readonly min_height?: number;
    readonly epsilon_factor?: number;
    readonly approximation?: boolean;
    readonly min_vertices?: number;
};