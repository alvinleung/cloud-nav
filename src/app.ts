import { createPointerStateProvider, updatePointerState } from "./pointer";
import {
  CanvasRenderer,
  createCanvasRenderer,
} from "./rendering/CanvasRenderer";
import { createViewportAnchor, updateViewportAnchor } from "./ViewportAnchor";
import {
  NodeCollection,
  createNodeCollection,
  renderNodeCollection,
  renderNodeText,
  updateNodeCollection,
} from "./cloud/NodeCollection";
import { getPositionFromAngleRadius } from "./utils/utils";
import {
  NodeInfo,
  buildTreeFromData,
  createAllNodesFromTree,
  getAllImagesFromData,
} from "./cloud/NodeInfoTree";

//@ts-ignore
window.setupSuperpowerGraph = (element: HTMLElement) => {
  createCanvasRenderer({
    elm: element,
    init,
    update,
  });
};
window.addEventListener("load", () => {
  const host = window.location.host;
  if (host.indexOf("localhost") !== -1 || host.indexOf("netlify.app") !== -1) {
    //@ts-ignore
    window.setupSuperpowerGraph(document.body);
  }
});

const mouse = createPointerStateProvider();
const tree = buildTreeFromData();
// const nodeCollection = createNodeCollection({
//   radius: 100,
//   showChildrenLink: true,
//   isExpanded: true,
//   canToggleExpandState: false,
// });

function getDegree(rad: number) {
  return (rad * 180) / Math.PI;
}
let nodeCollection: NodeCollection;

const viewportAnchor = createViewportAnchor();

async function init({ canvas, context }: CanvasRenderer) {
  viewportAnchor.x = canvas.width / 2;
  viewportAnchor.y = canvas.height / 2;

  const allImages = await getAllImagesFromData();

  nodeCollection = createAllNodesFromTree(
    tree,
    (nodeInfo, parentNode, level, index) => {
      if (!parentNode)
        return createNodeCollection({
          x: canvas.width / 2,
          y: canvas.height / 2,
          radius: 100,
          showChildrenLink: true,
          isExpanded: true,
          canToggleExpandState: false,
          image: allImages[nodeInfo.img],
        });

      const siblingCount = nodeInfo.parent?.children.length || 0;
      const parentAngle =
        getDegree(
          Math.atan2(parentNode.centerOffsetY, parentNode.centerOffsetX)
        ) - 90;

      if (level === 1) {
        const angle = (360 * index) / siblingCount - parentAngle;
        const dist = 200;
        const pos = getPositionFromAngleRadius(dist, angle);
        return parentNode.createNodeCollection({
          centerOffsetX: pos.x,
          centerOffsetY: pos.y,
          radius: 50,
          isExpanded: false,
          canToggleExpandState: true,
          showChildrenLink: true,
          image: allImages[nodeInfo.img],
          label: nodeInfo.id,
        });
      }

      const levelFactor = level / 5;
      const limitedAngle = 270 * levelFactor;
      const angle =
        (limitedAngle * index) / siblingCount - limitedAngle / 2 - parentAngle;
      const dist = (100 * index) / siblingCount + 100;
      const pos = getPositionFromAngleRadius(dist, angle);
      return parentNode.createNodeCollection({
        centerOffsetX: pos.x,
        centerOffsetY: pos.y,
        radius: 40 * (1 - levelFactor),
        isExpanded: false,
        canToggleExpandState: true,
        showChildrenLink: true,
        image: allImages[nodeInfo.img],
        label: nodeInfo.id,
      });
    }
  )[0];
}

function update(canvasRenderer: CanvasRenderer) {
  updatePointerState(mouse);
  updateViewportAnchor(mouse, canvasRenderer, viewportAnchor);
  // render update
  updateNodeCollection(nodeCollection, mouse, viewportAnchor);
  renderNodeCollection(nodeCollection, canvasRenderer);
  renderNodeText(nodeCollection, canvasRenderer);
}
