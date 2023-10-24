import { ViewportAnchor } from "../ViewportAnchor";
import { PointerState } from "../pointer";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { getRandomColor } from "../utils/getRandomColor";
import { generateRandomFromRange } from "../utils/utils";
import { followTarget } from "./FollowTarget";
import { NodeCollection, isPointWithinNode } from "./NodeCollection";

export interface Node {
  parentCollection: NodeCollection | undefined;
  x: number;
  y: number;
  centerOffsetX: number;
  centerOffsetY: number;
  scale: number;
  initialScale: number;
  targetScale: number;
  radius: number;
  color: string;
  responsiveness: number;
  opacity: number;
  targetOpacity: number;
}

export function createNode(
  config: Partial<Node>,
  collection?: NodeCollection
): Node {
  const node: Node = {
    x: config.x || 0,
    y: config.y || 0,
    centerOffsetX: config.centerOffsetX || 0,
    centerOffsetY: config.centerOffsetY || 0,
    scale: config.scale || 1,
    initialScale: config.initialScale || 1,
    targetScale: config.targetScale || config.initialScale || 1,
    radius: config.radius || 10,
    color: config.color || getRandomColor(),
    parentCollection: collection,
    responsiveness: generateRandomFromRange(0.1, 0.02),
    opacity: 1,
    targetOpacity: 1,
  };
  return node;
}

export function updateNode(node: Node) {
  // update node
  const parent = node.parentCollection;
  if (!parent) {
    return;
  }

  const dist =
    (node.centerOffsetX * node.centerOffsetX +
      node.centerOffsetY * node.centerOffsetY) /
    1700;
  const offset = projectOffset(node.centerOffsetX, node.centerOffsetY, -dist);

  const targetX = !parent.isExpanded
    ? parent.x + node.centerOffsetX + offset.x
    : parent.x + node.centerOffsetX;
  const targetY = !parent.isExpanded
    ? parent.y + node.centerOffsetY + offset.y
    : parent.y + node.centerOffsetY;
  // const targetX = parent.x + node.centerOffsetX;
  // const targetY = parent.y + node.centerOffsetY;

  node.x = followTarget(node.x, targetX, node.responsiveness);
  node.y = followTarget(node.y, targetY, node.responsiveness);
  node.scale = followTarget(
    node.scale,
    parent.isExpanded ? node.targetScale : 0.5,
    node.responsiveness
  );
  node.opacity = followTarget(
    node.opacity,
    node.targetOpacity,
    node.responsiveness
  );
}

function projectOffset(dx: number, dy: number, amount: number) {
  const angle = Math.atan2(dy, dx);
  return {
    x: Math.cos(angle) * amount,
    y: Math.sin(angle) * amount,
  };
}

export function renderNode(node: Node, { context }: CanvasRenderer) {
  // render the node here
  context.globalAlpha = node.opacity;
  context.fillStyle = node.color;
  context.beginPath();
  context.arc(node.x, node.y, node.radius * node.scale, 0, 2 * Math.PI);
  context.fill();
  context.globalAlpha = 1;
}
