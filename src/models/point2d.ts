export interface Point2d {
    x: number,
    y: number
}

export function getDistanceBetweenPoints(point1: Point2d, point2: Point2d): number {
    const xDiff = point1.x - point2.x;
    const yDiff = point1.y - point2.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

export interface Size2d {
    width: number,
    height: number
}