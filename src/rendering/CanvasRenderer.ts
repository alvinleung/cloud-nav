import { createFullScreenCanvas } from "./createFullScreenCanvas";

export interface CanvasRenderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  cleanup: () => void;
}
export interface CanvasRendererConfig {
  elm: HTMLElement;
  init: (renderer: CanvasRenderer) => Promise<any>;
  update: (renderer: CanvasRenderer) => void;
}

export function createCanvasRenderer({
  elm,
  init,
  update,
}: CanvasRendererConfig): CanvasRenderer {
  const canvas = createFullScreenCanvas();
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  // add canvas to document
  elm.appendChild(canvas);

  const renderer = {
    cleanup,
    canvas,
    context,
  };

  let animFrame = 0;
  // init
  function updateFrame() {
    renderer.context.clearRect(0, 0, canvas.width, canvas.height);
    update(renderer);
    animFrame = requestAnimationFrame(updateFrame);
  }

  async function initCanvas() {
    await init(renderer);
    animFrame = requestAnimationFrame(updateFrame);
  }
  initCanvas();

  function cleanup() {
    cancelAnimationFrame(animFrame);
  }

  return renderer;
}
