export interface PointerState {
  x: number;
  y: number;
  velX: number;
  velY: number;
  prevX: number;
  prevY: number;
  isPressed: boolean;
  _isPressedPrev: boolean;
  hasClicked: boolean;
  cleanup: () => void;
}

export function createPointerStateProvider(): PointerState {
  const pointerState = {
    x: 0,
    y: 0,
    velX: 0,
    velY: 0,
    prevX: 0,
    prevY: 0,
    isPressed: false,
    _isPressedPrev: false,
    hasClicked: false,
    cleanup,
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
  updateHasClickedState(pointerState);
  pointerState.velX = pointerState.x - pointerState.prevX;
  pointerState.velY = pointerState.y - pointerState.prevY;
  pointerState.prevX = pointerState.x;
  pointerState.prevY = pointerState.y;
}

function updateHasClickedState(pointerState: PointerState) {
  // has clicked
  pointerState.hasClicked = false;
  if (pointerState._isPressedPrev && !pointerState.isPressed) {
    pointerState.hasClicked = true;
  }
  pointerState._isPressedPrev = pointerState.isPressed;
}
