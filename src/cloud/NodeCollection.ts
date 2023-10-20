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
  initialDragOffsetX: number;
  initialDragOffsetY: number;
  isDragging: boolean;
  showChildrenLink: boolean;
  createNode: (node: Partial<Node>) => Node;
  createNodeCollection: (node: Partial<NodeCollection>) => NodeCollection;
}

export function createNodeCollection(
  config: Partial<NodeCollection>,
  parentCollection?: NodeCollection
) {
  const nodes: Node[] = [];

  const collection: NodeCollection = {
    x: config.x || 0,
    y: config.y || 0,
    centerOffsetX: config.centerOffsetX || 0,
    centerOffsetY: config.centerOffsetY || 0,
    scale: config.scale || 1,
    radius: config.radius || 10,
    color: getRandomColor(),
    responsiveness: generateRandomFromRange(0.08, 0.14),
    parentCollection: parentCollection,
    isHovering: false,
    isExpanded: config.isExpanded || false,
    canToggleExpandState:
      config.canToggleExpandState !== undefined
        ? config.canToggleExpandState
        : true,
    showChildrenLink:
      config.showChildrenLink !== undefined ? config.showChildrenLink : false,
    nodes,
    initialDragOffsetX: 0,
    initialDragOffsetY: 0,
    createNode: function (nodeConfig: Partial<Node>) {
      const newNode = createNode(nodeConfig, collection);
      newNode.x = collection.x;
      newNode.y = collection.y;
      nodes.push(newNode);
      return newNode;
    },
    createNodeCollection: function (config: Partial<NodeCollection>) {
      const nodeCollection = createNodeCollection(config, collection);
      nodeCollection.x = collection.x;
      nodeCollection.y = collection.y;
      nodes.push(nodeCollection);
      return nodeCollection;
    },
    isDragging: false,
  };
  return collection;
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
    pointerState.hasClicked
  ) {
    nodeCollection.isExpanded = !nodeCollection.isExpanded;
  }
}
function updateNodeCollectionHoverState(
  nodeCollection: NodeCollection,
  pointerState: PointerState
) {
  nodeCollection.isHovering = isPointWithinNode(
    pointerState.x,
    pointerState.y,
    nodeCollection
  );
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
      context.strokeStyle = nodeCollection.isExpanded ? "#CCC" : "#000";
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
  context.fillStyle = nodeCollection.isHovering ? "#CCC" : "#EEE";
  context.strokeStyle = nodeCollection.color;
  context.beginPath();
  context.arc(
    nodeCollection.x,
    nodeCollection.y,
    nodeCollection.radius * nodeCollection.scale,
    0,
    2 * Math.PI
  );
  context.fill();
  context.stroke();
  context.closePath();
}
