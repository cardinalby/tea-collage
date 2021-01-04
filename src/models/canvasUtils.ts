import {Point2d} from "./point2d";

export function getCanvasPointAlpha(ctx: CanvasRenderingContext2D, point: Point2d): number {
    return ctx.getImageData(point.x, point.y, 1, 1).data[3];
}