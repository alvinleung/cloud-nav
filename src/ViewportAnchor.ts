import {
  MovablePoint,
  createMovablePoint,
  updateMovablePoint,
} from "./cloud/Point";
import { PointerState } from "./pointer";
import { CanvasRenderer } from "./rendering/CanvasRenderer";

export interface ViewportAnchor extends MovablePoint {}
export function createViewportAnchor() {
  let viewportPos = createMovablePoint({});
  return viewportPos;
}

export function updateViewportAnchor(
  pointer: PointerState,
  { canvas }: CanvasRenderer,
  viewportAnchor: ViewportAnchor
) {
  // if (pointer.isPressed) {
  //   viewportAnchor.velX = pointer.velX;
  //   viewportAnchor.velY = pointer.velY;
  //   viewportAnchor.x += viewportAnchor.velX;
  //   viewportAnchor.y += viewportAnchor.velY;
  // } else {
  //   viewportAnchor.velX = 0;
  //   viewportAnchor.velY = 0;
  // }

  const movementXRange = 20;
  const movementYRange = 20;
  viewportAnchor.x =
    (pointer.x / canvas.width) * movementXRange +
    canvas.width / 2 -
    movementXRange / 2;
  viewportAnchor.y =
    (pointer.y / canvas.height) * movementYRange +
    canvas.height / 2 -
    movementYRange / 2;
  updateMovablePoint(viewportAnchor);
}
