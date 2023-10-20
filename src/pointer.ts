export interface PointerState {
  x: number;
  y: number;
  velX: number;
  velY: number;
  prevX: number;
  prevY: number;
  isPressed: boolean;
  _isPressedPrev: boolean;
  hasPointerUp: boolean;
  hasPointerDown: boolean;
  hasClicked: boolean;
  isDragging: boolean;
  cleanup: () => void;
}

export function createPointerStateProvider(): PointerState {
  const pointerState: PointerState = {
    x: 0,
    y: 0,
    velX: 0,
    velY: 0,
    prevX: 0,
    prevY: 0,
    isPressed: false,
    _isPressedPrev: false,
    hasPointerUp: false,
    hasPointerDown: false,
    isDragging: false,
    cleanup,
    hasClicked: false,
  };

  function handlePointerMove(e: PointerEvent) {
    pointerState.x = e.clientX;
    pointerState.y = e.clientY;
  }
  function handlePointerDown(e: PointerEvent) {
    pointerState.isPressed = true;
  }
  function handlePointerUp(e: PointerEvent) {
    pointerState.isPressed = false;
  }
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointerup", handlePointerUp);

  function cleanup() {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  return pointerState;
}

export function updatePointerState(pointerState: PointerState) {
  updatePressedStates(pointerState);

  pointerState.velX = pointerState.x - pointerState.prevX;
  pointerState.velY = pointerState.y - pointerState.prevY;
  pointerState.prevX = pointerState.x;
  pointerState.prevY = pointerState.y;
}

function updatePressedStates(pointerState: PointerState) {
  // update drag states first because they should be one tick behind the pressed state
  if (pointerState.isPressed && isPointerMoving(pointerState, 5)) {
    pointerState.isDragging = true;
  }
  if (pointerState.hasPointerUp) {
    pointerState.isDragging = false;
  }

  pointerState.hasPointerUp =
    pointerState._isPressedPrev && !pointerState.isPressed;
  pointerState.hasPointerDown =
    !pointerState._isPressedPrev && pointerState.isPressed;
  pointerState.hasClicked =
    !pointerState.isDragging && pointerState.hasPointerUp;

  pointerState._isPressedPrev = pointerState.isPressed;
}

function isPointerMoving(pointerState: PointerState, threshold: number) {
  return (
    Math.abs(pointerState.velX) > threshold &&
    Math.abs(pointerState.velY) > threshold
  );
}
