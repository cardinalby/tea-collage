import {Point2d} from "./point2d";

export function isTransparentCanvasPoint(ctx: CanvasRenderingContext2D, point: Point2d) {
    return ctx.getImageData(point.x, point.y, 1, 1).data[3] === 0;
}