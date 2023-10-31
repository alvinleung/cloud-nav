export function createScrollOffsetProvider(canvas: HTMLCanvasElement) {
  let scrollInfo = {
    y: 0,
    x: 0,
  };

  let canvasOffsetY = 0;

  function updateScrollY() {
    scrollInfo.y = window.scrollY - canvasOffsetY;
  }
  window.addEventListener("scroll", (e) => updateScrollY());
  window.addEventListener("resize", (e) => calculateCanvasOffset());
  function calculateCanvasOffset() {
    canvasOffsetY = canvas.getBoundingClientRect().top + window.scrollY;
    scrollInfo.x = -canvas.getBoundingClientRect().left;
    updateScrollY();
  }

  calculateCanvasOffset();

  return scrollInfo;
}
