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
  radius: number;
  color: string;
  responsiveness: number;
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
    responsiveness: generateRandomFromRange(0.1, 0.02),
  };
  return node;
}

export function updateNode(node: Node, pointer: PointerState) {
  // update node
  const parent = node.parentCollection;
  if (!parent) {
    return;
  }

  const isDragging =
    pointer.isPressed && isPointWithinNode(pointer.x, pointer.y, node);

  const targetX = isDragging ? pointer.x : parent.x + node.centerOffsetX;
  const targetY = isDragging ? pointer.y : parent.y + node.centerOffsetY;

  node.x = followTarget(node.x, targetX, node.responsiveness);
  node.y = followTarget(node.y, targetY, node.responsiveness);
}
export function renderNode(node: Node, { context }: CanvasRenderer) {
  // render the node here
  context.fillStyle = node.color;
  context.beginPath();
  context.arc(node.x, node.y, node.radius * node.scale, 0, 2 * Math.PI);
  context.fill();
}
