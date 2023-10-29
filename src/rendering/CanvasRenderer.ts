import { createFullScreenCanvas } from "./createFullScreenCanvas";

export interface CanvasRenderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  cleanup: () => void;
}

export interface CanvasRendererConfig<T> {
  elm: HTMLElement;
  init: (renderer: CanvasRenderer) => Promise<T>;
  update: (renderer: CanvasRenderer, params: T) => void;
}

export type PromiseReturnType<T> = T extends Promise<infer Return> ? Return : T;
export type InitFunction = (renderer: CanvasRenderer) => Promise<any>;
export type GetInitFunctionReturns<T extends InitFunction> = Awaited<
  ReturnType<T>
>;
export type UpdateFunction<T extends InitFunction> = (
  canvasRenderer: CanvasRenderer,
  params: GetInitFunctionReturns<T>
) => void;

export function createCanvasRenderer<T>({
  elm,
  init,
  update,
}: CanvasRendererConfig<T>): CanvasRenderer {
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
  let initialParams: GetInitFunctionReturns<typeof init>;
  // init
  function updateFrame() {
    renderer.context.clearRect(0, 0, canvas.width, canvas.height);
    update(renderer, initialParams);
    animFrame = requestAnimationFrame(updateFrame);
  }

  async function initCanvas() {
    initialParams = await init(renderer);
    animFrame = requestAnimationFrame(updateFrame);
  }
  initCanvas();

  function cleanup() {
    cancelAnimationFrame(animFrame);
  }

  return renderer;
}
