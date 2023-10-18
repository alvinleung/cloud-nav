import { ViewportAnchor } from "../ViewportAnchor";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { getRandomColor } from "../utils/getRandomColor";
import { generateRandomFromRange } from "../utils/utils";
import { followTarget } from "./FollowTarget";
import { MovablePoint } from "./Point";
import { Node, createNode, renderNode, updateNode } from "./node";

export interface NodeCollection extends Node {
  nodes: Node[];
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
    weight: generateRandomFromRange(0.3, 1),
    parentCollection: parentCollection,
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
  viewportAnchor?: ViewportAnchor
) {
  if (viewportAnchor) {
    // this is the root node
    nodeCollection.x = followTarget(nodeCollection.x, viewportAnchor.x, 0.1);
    nodeCollection.y = followTarget(nodeCollection.y, viewportAnchor.y, 0.1);
  }

  if (nodeCollection.parentCollection) {
    // follow the parent node
    nodeCollection.x = followTarget(
      nodeCollection.x,
      nodeCollection.parentCollection.x + nodeCollection.centerOffsetX,
      0.08 * nodeCollection.weight
    );
    nodeCollection.y = followTarget(
      nodeCollection.y,
      nodeCollection.parentCollection.y + nodeCollection.centerOffsetY,
      0.08 * nodeCollection.weight
    );
  }

  // update the children nodes
  nodeCollection.nodes.forEach((node) => {
    // if it were a node collection
    if ((node as NodeCollection).nodes) {
      updateNodeCollection(node as NodeCollection);
      return;
    }
    updateNode(node);
  });
}

export function renderNodeCollection(
  nodeCollection: NodeCollection,
  canvasRenderer: CanvasRenderer
) {
  // render the node collection here
  nodeCollection.nodes.forEach((node) => {
    // if it were a node collection
    if ((node as NodeCollection).nodes) {
      renderNodeCollection(node as NodeCollection, canvasRenderer);
      return;
    }
    renderNode(node, canvasRenderer);
  });

  const context = canvasRenderer.context;
  // render the node here
  context.fillStyle = "#EEE";
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
}
