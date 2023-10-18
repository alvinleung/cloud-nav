export type WebGLUpdateFunction = (
  context: WebGLRenderingContext,
  canvas: HTMLCanvasElement
) => void | undefined | null;

export type WebGLInitFunction = (
  context: WebGLRenderingContext,
  canvas: HTMLCanvasElement
) => Promise<void>;

export type RefreshRenderer = () => void;

export type RendererConfig = {
  canvas: HTMLCanvasElement;
  init: WebGLInitFunction;
  update: WebGLUpdateFunction;
};

export function createWebGLRenderer(config: RendererConfig): RefreshRenderer {
  const updateFunction: WebGLUpdateFunction = config.update;
  const canvas = config.canvas;
  const initFunction: WebGLInitFunction = config.init;

  let context: WebGLRenderingContext;
  let animFrame = 0;
  async function init() {
    cancelAnimationFrame(animFrame);
    context = canvas.getContext("webgl") as WebGLRenderingContext;
    await initFunction(context, canvas);
    update();
  }

  function update() {
    updateFunction(context, canvas);
    animFrame = requestAnimationFrame(update);
  }
  init();

  return () => {
    init();
  };
}
