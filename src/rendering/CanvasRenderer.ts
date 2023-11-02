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
  let isActive = true;
  // init
  function updateFrame() {
    if (!isActive) return;
    renderer.context.clearRect(0, 0, canvas.width, canvas.height);
    // renderer.context.save();
    // renderer.context.scale(2, 2);
    // renderer.context.translate(-canvas.width / 4, -canvas.height / 4);
    update(renderer, initialParams);
    // renderer.context.restore();
    animFrame = requestAnimationFrame(updateFrame);
  }

  async function initCanvas() {
    initialParams = await init(renderer);
    updateFrame();
  }
  initCanvas();

  function cleanup() {
    cancelAnimationFrame(animFrame);
  }

  function resumeUpdateFrame() {
    if (isActive) return;
    isActive = true;
    updateFrame();
  }
  function puaseUpdateFrame() {
    isActive = false;
  }

  // init intersection observer here
  let options = {
    root: document.querySelector("#scrollArea"),
    rootMargin: "0px",
    threshold: [0, 1.0],
  };

  let observer = new IntersectionObserver((e) => {
    e.forEach((entry) => {
      if (entry.isIntersecting) {
        // console.log("in view");
        resumeUpdateFrame();
        return;
      }
      // console.log("exit view");
      puaseUpdateFrame();
    });
  }, options);
  observer.observe(canvas);

  return renderer;
}
