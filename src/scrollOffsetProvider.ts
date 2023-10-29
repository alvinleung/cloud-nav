export function createScrollOffsetProvider(canvas: HTMLCanvasElement) {
  let scrollInfo = {
    y: 0,
  };
  window.addEventListener("scroll", (e) => {
    scrollInfo.y = window.scrollY;
  });

  return scrollInfo;
}
