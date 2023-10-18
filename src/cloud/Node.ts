import { ViewportAnchor } from "../ViewportAnchor";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { getRandomColor } from "../utils/getRandomColor";
import { followTarget } from "./FollowTarget";
import { NodeCollection } from "./NodeCollection";

export interface Node {
  parentCollection: NodeCollection | undefined;
  x: number;
  y: number;
  centerOffsetX: number;
  centerOffsetY: number;
  scale: number;
  radius: number;
  color: string;
  weight: number;
}

export function createNode(
  config: Partial<Node>,
  collection?: NodeCollection
): Node {
  const node = {
    x: config.x || 0,
    y: config.y || 0,
    centerOffsetX: config.centerOffsetX || 0,
    centerOffsetY: config.centerOffsetY || 0,
    scale: config.scale || 1,
    radius: config.radius || 10,
    color: config.color || getRandomColor(),
    parentCollection: collection,
    weight: Math.random() + 0.1,
  };
  return node;
}

export function updateNode(node: Node) {
  // update node
  const parent = node.parentCollection;
  if (!parent) {
    return;
  }

  const targetX = parent.x + node.centerOffsetX;
  const targetY = parent.y + node.centerOffsetY;

  const responsiveness = 0.1;

  node.x = followTarget(node.x, targetX, responsiveness * node.weight);
  node.y = followTarget(node.y, targetY, responsiveness * node.weight);
}

export function isPointWithinNode(x: number, y: number, node: Node) {
  return (
    Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2) < Math.pow(node.radius, 2)
  );
}

export function renderNode(node: Node, { context }: CanvasRenderer) {
  // render the node here
  context.fillStyle = node.color;
  context.beginPath();
  context.arc(node.x, node.y, node.radius * node.scale, 0, 2 * Math.PI);
  context.fill();
}
