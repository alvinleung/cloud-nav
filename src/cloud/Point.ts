export interface Point {
  x: number;
  y: number;
}

export interface MovablePoint extends Point {
  velX: number;
  velY: number;
  prevX: number;
  prevY: number;
}

export function createPoint(point: Partial<Point>): Point {
  return {
    x: point.x || 0,
    y: point.y || 0,
  };
}

export function createMovablePoint(point: Partial<MovablePoint>): MovablePoint {
  return {
    x: point.x || 0,
    y: point.y || 0,
    velX: point.velX || 0,
    velY: point.velY || 0,
    prevX: point.prevX || 0,
    prevY: point.prevY || 0,
  };
}

export function updateMovablePoint(movablePoint: MovablePoint) {
  movablePoint.velX = movablePoint.x - movablePoint.prevX;
  movablePoint.velY = movablePoint.y - movablePoint.prevY;
  movablePoint.prevX = movablePoint.x;
  movablePoint.prevY = movablePoint.y;
}
