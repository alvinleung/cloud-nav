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
  NodeCollection,
  createNodeCollection,
  renderNodeCollection,
  updateNodeCollection,
} from "./cloud/NodeCollection";
import {
  generateRandomFromRange,
  getPositionFromAngleRadius,
} from "./utils/utils";
import {
  NodeInfo,
  buildTreeFromData,
  createAllNodesFromTree,
} from "./cloud/NodeInfoTree";

window.onload = () =>
  createCanvasRenderer({
    elm: document.body,
    init,
    update,
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
        });
      }

      const levelFactor = level / 5;
      const limitedAngle = 270 * levelFactor;
      const angle =
        (limitedAngle * index) / siblingCount - limitedAngle / 2 - parentAngle;
      const dist = (50 * index) / siblingCount + 100;
      const pos = getPositionFromAngleRadius(dist, angle);
      return parentNode.createNodeCollection({
        centerOffsetX: pos.x,
        centerOffsetY: pos.y,
        radius: 10,
        isExpanded: false,
        canToggleExpandState: true,
        showChildrenLink: true,
      });
    }
  )[0];

  /*
  const bigCircleCount = 5;
  for (let i = 0; i < bigCircleCount; i++) {
    const baseLevelAngle = (i / bigCircleCount) * 360;
    const angleVariations = generateRandomFromRange(0, 40);
    const distVariations = generateRandomFromRange(-60, 60);
    const pos = getPositionFromAngleRadius(
      225 + distVariations,
      baseLevelAngle + angleVariations
    );
    const secondLevelCollection = nodeCollection.createNodeCollection({
      centerOffsetX: pos.x,
      centerOffsetY: pos.y,
      radius: 60,
      showChildrenLink: true,
      isExpanded: false,
      // canToggleExpandState: false,
    });

    for (let j = 0; j < 3; j++) {
      const angleRange = 140;
      const secondLevelAngle = (j / 3) * angleRange;
      const angleOffset = -angleRange / 3;
      const angleVariations = generateRandomFromRange(0, 20);

      const pos = getPositionFromAngleRadius(
        160,
        baseLevelAngle + secondLevelAngle + angleOffset + angleVariations
      );
      const thirdLevelCollection = secondLevelCollection.createNodeCollection({
        centerOffsetX: pos.x,
        centerOffsetY: pos.y,
        radius: 30,
        isExpanded: false,
        canToggleExpandState: true,
        showChildrenLink: true,
      });

      for (let j = 0; j < 3; j++) {
        const angleRange = 80;
        const angle2 = (j / 3) * angleRange;
        const angleOffset2 = angleOffset - angleRange / 3;
        const dist = generateRandomFromRange(60, 120);
        const angleVariations = generateRandomFromRange(-10, 10);

        const pos = getPositionFromAngleRadius(
          dist,
          baseLevelAngle +
            secondLevelAngle +
            angle2 +
            angleOffset2 +
            angleVariations
        );
        const thirdLevelCollection2 = thirdLevelCollection.createNodeCollection(
          {
            centerOffsetX: pos.x,
            centerOffsetY: pos.y,
            radius: 15,
            isExpanded: false,
            canToggleExpandState: true,
          }
        );

        // for (let k = 0; k < 8; k++) {
        //   const angleRange = 100;
        //   const angle = (k / 8) * angleRange;
        //   const angleOffset3 = angleOffset - angleRange / 8;
        //   const dist = generateRandomFromRange(50, 200);
        //   const angleVariations = generateRandomFromRange(0, 0);
        //   const pos = getPositionFromAngleRadius(
        //     dist,
        //     baseLevelAngle + angle + angleVariations + angleOffset3
        //   );
        //   thirdLevelCollection2.createNode({
        //     centerOffsetX: pos.x,
        //     centerOffsetY: pos.y,
        //     initialScale: generateRandomFromRange(0.2, 0.5),
        //     color: "rgba(0,0,0,.1)",
        //   });
        // }
      }
    }
  }*/
}

function update(canvasRenderer: CanvasRenderer) {
  updatePointerState(mouse);
  updateViewportAnchor(mouse, canvasRenderer, viewportAnchor);
  // render update
  updateNodeCollection(nodeCollection, mouse, viewportAnchor);
  renderNodeCollection(nodeCollection, canvasRenderer);
}
