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
    showChildrenLink: config.showChildrenLink || false,
    nodes,
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

  if (nodeCollection.parentCollection) {
    // follow the parent node
    updateNode(nodeCollection, pointerState);
  }

  nodeCollection.isHovering = isPointWithinNode(
    pointerState.x,
    pointerState.y,
    nodeCollection
  );

  // update the children nodes
  nodeCollection.nodes.forEach((node) => {
    // if it were a node collection
    if ((node as NodeCollection).nodes) {
      updateNodeCollection(node as NodeCollection, pointerState);
      return;
    }
    updateNode(node, pointerState);
  });
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
      context.strokeStyle = nodeCollection.color;
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
