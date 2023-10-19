import { Node, createNode, renderNode, updateNode } from "./cloud/Node";
import { createPointerStateProvider, updatePointerState } from "./pointer";
import {
  CanvasRenderer,
  createCanvasRenderer,
} from "./rendering/CanvasRenderer";
import { createFullScreenCanvas } from "./rendering/createFullScreenCanvas";
import { MovablePoint, createMovablePoint, createPoint } from "./cloud/Point";
import { createViewportAnchor, updateViewportAnchor } from "./ViewportAnchor";
import {
  createNodeCollection,
  renderNodeCollection,
  updateNodeCollection,
} from "./cloud/NodeCollection";
import {
  generateRandomFromRange,
  getPositionFromAngleRadius,
} from "./utils/utils";

window.onload = () =>
  createCanvasRenderer({
    elm: document.body,
    init,
    update,
  });

const mouse = createPointerStateProvider();
const nodeCollection = createNodeCollection({
  showChildrenLink: true,
  isExpanded: true,
});
const viewportAnchor = createViewportAnchor();

async function init({ canvas, context }: CanvasRenderer) {
  // populate the nodes
  nodeCollection.x = canvas.width / 2;
  nodeCollection.y = canvas.height / 2;

  viewportAnchor.x = canvas.width / 2;
  viewportAnchor.y = canvas.height / 2;

  const bigCircleCount = 5;
  for (let i = 0; i < bigCircleCount; i++) {
    const baseLevelAngle = (i / bigCircleCount) * 360;
    const pos = getPositionFromAngleRadius(225, baseLevelAngle);
    const secondLevelCollection = nodeCollection.createNodeCollection({
      centerOffsetX: pos.x,
      centerOffsetY: pos.y,
      radius: 100,
      showChildrenLink: true,
    });

    for (let j = 0; j < 3; j++) {
      const angleVariations = generateRandomFromRange(-10, 10);
      const angle = (j / 3) * 120;

      const pos = getPositionFromAngleRadius(160, baseLevelAngle + angle);
      const thirdLevelCollection = secondLevelCollection.createNodeCollection({
        centerOffsetX: pos.x,
        centerOffsetY: pos.y,
        radius: 40,
        isExpanded: true,
        canToggleExpandState: false,
      });

      for (let k = 0; k < 20; k++) {
        const angle = (k / 20) * 100;
        const dist = generateRandomFromRange(50, 200);
        const pos = getPositionFromAngleRadius(dist, baseLevelAngle + angle);
        thirdLevelCollection.createNode({
          centerOffsetX: pos.x,
          centerOffsetY: pos.y,
          scale: generateRandomFromRange(0.2, 0.5),
          color: "#777",
        });
      }
    }
  }
}

function update(canvasRenderer: CanvasRenderer) {
  updatePointerState(mouse);
  updateViewportAnchor(mouse, canvasRenderer, viewportAnchor);
  // render update
  updateNodeCollection(nodeCollection, mouse, viewportAnchor);
  renderNodeCollection(nodeCollection, canvasRenderer);
}
