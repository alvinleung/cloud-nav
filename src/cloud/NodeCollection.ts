import { ViewportAnchor } from "../ViewportAnchor";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { getRandomColor } from "../utils/getRandomColor";
import { generateRandomFromRange } from "../utils/utils";
import { followTarget } from "./FollowTarget";
import { MovablePoint } from "./Point";
import { Node, createNode, renderNode, updateNode } from "./Node";
import { PointerState } from "../pointer";

export interface NodeCollection extends Node {
  nodes: Node[];
  isHovering: boolean;
  isExpanded: boolean;
  canToggleExpandState: boolean;
  isLastCollectionLevel: boolean;
  initialDragOffsetX: number;
  initialDragOffsetY: number;
  isDragging: boolean;
  showChildrenLink: boolean;
  createNode: (node: Partial<Node>) => Node;
  createNodeCollection: (node: Partial<NodeCollection>) => NodeCollection;
}

function withDefault(config: any, defaultValue: any) {
  return config !== undefined ? config : defaultValue;
}

export function createNodeCollection(
  config: Partial<NodeCollection>,
  parentCollection?: NodeCollection
) {
  const nodes: Node[] = [];

  const collection: NodeCollection = {
    x: withDefault(config.x, 0),
    y: withDefault(config.y, 0),
    centerOffsetX: withDefault(config.centerOffsetX, 0),
    centerOffsetY: withDefault(config.centerOffsetY, 0),
    scale: withDefault(config.scale, 1),
    initialScale: withDefault(config.initialScale, 1),
    radius: withDefault(config.radius, 10),
    // color: getRandomColor(),
    color: config.image
      ? getRGBAString(getAverageRGB(config.image))
      : getParentColour(parentCollection),
    responsiveness: generateRandomFromRange(0.08, 0.14),
    parentCollection: parentCollection,
    isHovering: false,
    isExpanded: config.isExpanded || false,
    canToggleExpandState: withDefault(config.canToggleExpandState, true),
    showChildrenLink: withDefault(config.showChildrenLink, false),
    nodes,
    initialDragOffsetX: 0,
    initialDragOffsetY: 0,
    isLastCollectionLevel: true,
    createNode: function (nodeConfig: Partial<Node>) {
      const newNode = createNode(nodeConfig, collection);
      newNode.x = collection.x;
      newNode.y = collection.y;
      nodes.push(newNode);
      collection.isLastCollectionLevel = true;
      return newNode;
    },
    createNodeCollection: function (config: Partial<NodeCollection>) {
      const nodeCollection = createNodeCollection(config, collection);
      nodeCollection.x = collection.x;
      nodeCollection.y = collection.y;
      nodes.push(nodeCollection);
      collection.isLastCollectionLevel = false;
      return nodeCollection;
    },
    isDragging: false,
    targetScale: config.targetScale || config.initialScale || 1,
    opacity: 1,
    targetOpacity: 1,
    image: config.image,
    label: config.label,
  };
  return collection;
}

function getAverageRGB(img: HTMLImageElement) {
  const context = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;
  if (typeof img == "string") {
    var src = img;
    img = new Image();
    img.setAttribute("crossOrigin", "");
    img.src = src;
  }
  context.imageSmoothingEnabled = true;
  context.drawImage(img, 0, 0, 1, 1);
  //@ts-ignore
  const rgbArr: [number, number, number] = context
    .getImageData(0, 0, 1, 1)
    .data.slice(0, 3);

  return rgbArr;
}

function varyRGB(
  rgb: [number, number, number],
  variation: number = 60
): [number, number, number] {
  return [
    rgb[0] + Math.random() * variation,
    rgb[1] + Math.random() * variation,
    rgb[2] + Math.random() * variation,
  ];
}
function getRGBAString(rgbArr: [number, number, number]) {
  return `rgba(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]}, 1)`;
}

function getParentColour(parent?: NodeCollection) {
  if (!parent) return "#FFF";
  if (parent.image) {
    const parentRGB = getAverageRGB(parent.image);
    const variedRGB = varyRGB(parentRGB);
    return getRGBAString(variedRGB);
  }
  if (!parent.parentCollection) return "#FFF";
  return getParentColour(parent.parentCollection);
}

export function updateNodeCollection(
  nodeCollection: NodeCollection,
  pointerState: PointerState,
  viewportAnchor?: ViewportAnchor
) {
  if (viewportAnchor) {
    // this is the root node
    nodeCollection.x = followTarget(nodeCollection.x, viewportAnchor.x, 0.1);
    nodeCollection.y = followTarget(nodeCollection.y, viewportAnchor.y, 0.1);
  }

  // update the states
  updateNodeCollectionHoverState(nodeCollection, pointerState);
  updateNodeCollectionExpandState(nodeCollection, pointerState);
  updateNodeCollectionDrag(nodeCollection, pointerState);

  // follow the parent node positions
  if (nodeCollection.isDragging) {
    nodeCollection.x = followTarget(
      nodeCollection.x,
      pointerState.x - nodeCollection.initialDragOffsetX,
      0.1
    );
    nodeCollection.y = followTarget(
      nodeCollection.y,
      pointerState.y - nodeCollection.initialDragOffsetY,
      0.1
    );
  }
  if (!nodeCollection.isDragging) {
    updateNode(nodeCollection);
  }

  // snap to mouse
  if (nodeCollection.isHovering) {
    nodeCollection.x = followTarget(
      nodeCollection.x,
      nodeCollection.x + (pointerState.x - nodeCollection.x) * 0.5,
      0.1
    );
    nodeCollection.y = followTarget(
      nodeCollection.y,
      nodeCollection.y + (pointerState.y - nodeCollection.y) * 0.5,
      0.1
    );
  }

  // update the children nodes
  nodeCollection.nodes.forEach((node) => {
    // if it were a node collection
    if ((node as NodeCollection).nodes) {
      updateNodeCollection(node as NodeCollection, pointerState);
      return;
    }
    updateNode(node);
  });
}

function updateNodeCollectionExpandState(
  nodeCollection: NodeCollection,
  pointerState: PointerState
) {
  // handle toggling of expand state
  if (
    nodeCollection.canToggleExpandState &&
    nodeCollection.isHovering &&
    !nodeCollection.isExpanded
  ) {
    updateAllParentCollections(nodeCollection, (collection) => {
      collection.isExpanded = true;
    });
    updateOtherNodeCollections(nodeCollection, (collection) => {
      if (!collection.canToggleExpandState) return;
      collection.isExpanded = false;
    });
  }

  // if (
  //   nodeCollection.canToggleExpandState &&
  //   !nodeCollection.isHovering &&
  //   nodeCollection.isExpanded
  // ) {
  //   nodeCollection.isExpanded = false;
  //   updateChildrenNodeCollections(nodeCollection, (collection) => {
  //     if (!collection.canToggleExpandState) return;
  //     collection.isExpanded = false;
  //   });
  // }

  // if (
  //   nodeCollection.canToggleExpandState &&
  //   nodeCollection.isHovering &&
  //   pointerState.hasClicked
  // ) {
  //   nodeCollection.isExpanded = !nodeCollection.isExpanded;
  //   // collapse other node collection
  //   // close all children
  //   if (!nodeCollection.isExpanded) {
  //     updateChildrenNodeCollections(nodeCollection, (collection) => {
  //       if (!collection.canToggleExpandState) return;
  //       collection.isExpanded = false;
  //     });
  //   }
  //   // close unrelated collections
  //   if (nodeCollection.isExpanded) {
  //     updateOtherNodeCollections(nodeCollection, (collection) => {
  //       if (!collection.canToggleExpandState) return;
  //       collection.isExpanded = false;
  //     });
  //   }
  // }
}

function updateAllParentCollections(
  self: NodeCollection,
  callback: (collection: NodeCollection) => void
) {
  callback(self);
  if (!self.parentCollection) return;
  updateAllParentCollections(self.parentCollection, callback);
}

function updateOtherNodeCollections(
  self: NodeCollection,
  callback: (collection: NodeCollection) => void,
  notIncludeOwnChildren: boolean = false
) {
  const traverseUpwardAndCollapseOtherBranches = (
    self: NodeCollection,
    prevNode?: NodeCollection
  ) => {
    if (!self.nodes) return;
    self.nodes.forEach((node) => {
      if (notIncludeOwnChildren && prevNode === undefined) return;
      if (node === prevNode) return;
      updateChildrenNodeCollections(node as NodeCollection, callback);
    });

    // continue traverse upwards when it doesn't hit the root node
    if (!self.parentCollection) return;
    traverseUpwardAndCollapseOtherBranches(
      self.parentCollection as NodeCollection,
      self
    );
  };

  traverseUpwardAndCollapseOtherBranches(self, undefined);
}

function updateChildrenNodeCollections(
  collection: NodeCollection,
  callback: (collection: NodeCollection) => void
) {
  callback(collection);

  if (collection.isLastCollectionLevel) {
    return;
  }
  if (!collection.nodes) {
    return;
  }
  collection.nodes.forEach((node) => {
    if (!(node as NodeCollection).nodes) return;
    updateChildrenNodeCollections(node as NodeCollection, callback);
  });
}

function updateNodeCollectionHoverState(
  nodeCollection: NodeCollection,
  pointerState: PointerState
) {
  const isWithinNode = isPointWithinNode(
    pointerState.x,
    pointerState.y,
    nodeCollection
  );

  const okayToHover =
    pointerState.hoveringCollection === null ||
    pointerState.hoveringCollection === nodeCollection;

  if (isWithinNode && okayToHover && !nodeCollection.isHovering) {
    onEnterHover(nodeCollection);
    nodeCollection.isHovering = true;
  }

  if (!isWithinNode && nodeCollection.isHovering) {
    onExitHover(nodeCollection);
    nodeCollection.isHovering = false;
  }

  if (nodeCollection.isHovering) {
    pointerState.hoveringCollection = nodeCollection;
  }

  // clean up when no longer hovering
  if (
    !nodeCollection.isHovering &&
    pointerState.hoveringCollection === nodeCollection
  ) {
    pointerState.hoveringCollection = null;
  }
}

function onEnterHover(nodeCollection: NodeCollection) {
  nodeCollection.targetScale = nodeCollection.initialScale * 1.1;
  updateOtherNodeCollections(
    nodeCollection,
    (collection) => {
      collection.targetOpacity = 0.2;
    },
    true
  );
}
function onExitHover(nodeCollection: NodeCollection) {
  nodeCollection.targetScale = nodeCollection.initialScale;
  updateOtherNodeCollections(nodeCollection, (collection) => {
    collection.targetOpacity = 1;
  });
}

function updateNodeCollectionDrag(
  nodeCollection: NodeCollection,
  pointerstate: PointerState
) {
  if (pointerstate.hasPointerDown && nodeCollection.isHovering) {
    nodeCollection.isDragging = true;
    nodeCollection.initialDragOffsetX = pointerstate.x - nodeCollection.x;
    nodeCollection.initialDragOffsetY = pointerstate.y - nodeCollection.y;
  }

  if (pointerstate.hasPointerUp) {
    nodeCollection.isDragging = false;
  }
}

export function isPointWithinNode(x: number, y: number, node: Node) {
  return (
    Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2) < Math.pow(node.radius, 2)
  );
}

export function renderNodeCollection(
  nodeCollection: NodeCollection,
  canvasRenderer: CanvasRenderer
) {
  const context = canvasRenderer.context;

  // render the line to each collection
  if (nodeCollection.showChildrenLink) {
    nodeCollection.nodes.forEach((node) => {
      context.fillStyle = "#CCC";
      context.strokeStyle = nodeCollection.isExpanded
        ? "#CCC"
        : "rgba(0,0,0,0)";
      context.beginPath();
      context.moveTo(nodeCollection.x, nodeCollection.y);
      context.lineTo(node.x, node.y);
      context.stroke();
    });
  }

  // render the node collection here
  nodeCollection.nodes.forEach((node) => {
    // if it were a node collection
    if ((node as NodeCollection).nodes) {
      renderNodeCollection(node as NodeCollection, canvasRenderer);
      return;
    }
    renderNode(node, canvasRenderer);
  });

  // render the node here
  context.beginPath();
  context.arc(
    nodeCollection.x,
    nodeCollection.y,
    nodeCollection.radius * nodeCollection.scale,
    0,
    2 * Math.PI
  );

  const isParentExpanded =
    !nodeCollection.parentCollection ||
    nodeCollection.parentCollection?.isExpanded;
  context.globalAlpha = nodeCollection.opacity;
  context.fillStyle = "#FFF";
  context.fill();
  // context.fillStyle = nodeCollection.isHovering
  //   ? "#999"
  //   : `rgba(180,180,180,${nodeCollection.opacity})`;
  context.fillStyle = nodeCollection.image ? "#FFF" : nodeCollection.color;
  // context.strokeStyle = "#CCC";
  context.fill();
  // context.stroke();
  context.closePath();
  context.globalAlpha = 1;

  if (nodeCollection.image) {
    context.globalAlpha = nodeCollection.opacity;
    canvasRenderer.context.drawImage(
      nodeCollection.image,
      nodeCollection.x - nodeCollection.radius,
      nodeCollection.y - nodeCollection.radius,
      nodeCollection.radius * 2,
      nodeCollection.radius * 2
    );
    context.globalAlpha = 1;
  }
}

let roundRect = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  color: string
) => {
  var w = x1 - x0;
  var h = y1 - y0;
  if (r > w / 2) r = w / 2;
  if (r > h / 2) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x1 - r, y0);
  ctx.quadraticCurveTo(x1, y0, x1, y0 + r);
  ctx.lineTo(x1, y1 - r);
  ctx.quadraticCurveTo(x1, y1, x1 - r, y1);
  ctx.lineTo(x0 + r, y1);
  ctx.quadraticCurveTo(x0, y1, x0, y1 - r);
  ctx.lineTo(x0, y0 + r);
  ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

export function renderNodeText(
  nodeCollection: NodeCollection,
  canvasRenderer: CanvasRenderer
) {
  if (nodeCollection.label && nodeCollection.isHovering) {
    const textPositionX = nodeCollection.x + nodeCollection.radius + 10;
    const fontSize = 16;
    const textWidth = canvasRenderer.context.measureText(
      nodeCollection.label
    ).width;
    const paddingX = 8;
    roundRect(
      canvasRenderer.context,
      textPositionX,
      nodeCollection.y - fontSize * 1,
      textPositionX + textWidth + paddingX + paddingX,
      nodeCollection.y + fontSize * 1,
      64,
      "#EEE"
    );

    canvasRenderer.context.fillStyle = "#333";
    canvasRenderer.context.font = `${fontSize}px 'Nb International Pro', sans-serif`;

    canvasRenderer.context.fillText(
      nodeCollection.label,
      textPositionX + paddingX,
      nodeCollection.y + fontSize * 0.45
    );
  }

  if (!nodeCollection.nodes) return;
  nodeCollection.nodes.forEach((node) =>
    renderNodeText(node as NodeCollection, canvasRenderer)
  );
}
