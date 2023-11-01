import { updateNode } from "./Node";
import { NodeCollection, updateNodeCollection } from "./NodeCollection";

export function createCollisionSystem(nodeCollection: NodeCollection) {
  const nodes = flattenNodes(nodeCollection, []);

  return {
    nodes: nodes,
  };
}

export function updateCollisionSystem({
  nodes,
}: ReturnType<typeof createCollisionSystem>) {
  const tree = createBaseQuadTreeCell({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  nodes.forEach((node) => {
    addToQuadTree(tree, node);
  });

  const collisionResults: NodeCollection[] = [];
  nodes.forEach((node) => {
    const result = queryQuadTree(tree, {
      x: node.x,
      y: node.y,
      width: node.radius * 2,
      height: node.radius * 2,
    });
    if (result.length > 1) {
      collisionResults.push(result[1]);
    }
  });

  // console.log(collisionResults.length);
  // const result = queryQuadTree(tree, {
  //   x: window.innerWidth / 2,
  //   y: window.innerHeight / 2,
  //   width: 100,
  //   height: 100,
  // });
  // result.forEach((item) => {
  //   item.targetOpacity = 0.5;
  // });
  // console.log(nodes.length);
  // console.log(result.length);
}

function repelNodes(node1: NodeCollection, node2: NodeCollection) {}

function flattenNodes(node: NodeCollection, arr: NodeCollection[]) {
  arr.push(node);

  // update the node collection
  node.nodes.forEach((node) => {
    // if it were a node collection
    if ((node as NodeCollection).nodes) {
      flattenNodes(node as NodeCollection, arr);
      return;
    }
  });

  return arr;
}

interface QuadTreeConfig {
  width: number;
  height: number;
}

interface QuadTreeCell {
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  items: NodeCollection[];
  children?: {
    topLeft: QuadTreeCell;
    topRight: QuadTreeCell;
    bottomLeft: QuadTreeCell;
    bottomRight: QuadTreeCell;
  };
}
function createBaseQuadTreeCell(config: QuadTreeConfig): QuadTreeCell {
  return createQuadTreeCell(0, 0, config.width, config.height, 0);
}

function addToQuadTree(
  cell: QuadTreeCell,
  node: NodeCollection,
  splitThreshold = 4,
  maxLevel = 4
) {
  const isAboveSplittingThreshold = cell.items.length >= splitThreshold;
  if (isAboveSplittingThreshold && cell.level <= maxLevel) {
    // split here
    splitCellAndAdd(cell, node);
    return;
  }
  cell.items.push(node);
}

function splitCellAndAdd(curr: QuadTreeCell, node: NodeCollection) {
  const halfWidth = curr.width / 2;
  const halfHeight = curr.height / 2;
  const childrenLevel = curr.level + 1;

  curr.children = {
    topLeft: createQuadTreeCell(
      curr.x,
      curr.y,
      halfWidth,
      halfHeight,
      childrenLevel
    ),
    topRight: createQuadTreeCell(
      curr.x + halfWidth,
      curr.y,
      halfWidth,
      halfHeight,
      childrenLevel
    ),
    bottomLeft: createQuadTreeCell(
      curr.x,
      curr.y + halfHeight,
      halfWidth,
      halfHeight,
      childrenLevel
    ),
    bottomRight: createQuadTreeCell(
      curr.x + halfWidth,
      curr.y + halfHeight,
      halfWidth,
      halfHeight,
      childrenLevel
    ),
  };

  curr.items.push(node);
  curr.items.forEach((item) => {
    if (curr.children === undefined) return;
    if (intersectsCircleRect(item, curr.children.topLeft)) {
      curr.children.topLeft.items.push(item);
      return;
    }
    if (intersectsCircleRect(item, curr.children.topRight)) {
      curr.children.topRight.items.push(item);
      return;
    }
    if (intersectsCircleRect(item, curr.children.bottomLeft)) {
      curr.children.bottomLeft.items.push(item);
      return;
    }
    if (intersectsCircleRect(item, curr.children.bottomRight)) {
      curr.children.bottomRight.items.push(item);
      return;
    }
  });
}

function createQuadTreeCell(
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  level = 0
): QuadTreeCell {
  return {
    x,
    y,
    width,
    height,
    level,
    items: [],
  };
}

function queryQuadTree(cell: QuadTreeCell, queryRect: Rect) {
  const reuslt: NodeCollection[] = [];
  if (doesFullyContainRect(queryRect, cell)) {
    reuslt.push(...cell.items);
  } else if (intersectsRectRect(queryRect, cell)) {
    // this is not a leaf
    if (cell.children) {
      // test the different quardrant
      const topLeftResult = queryQuadTree(cell.children.topLeft, queryRect);
      const topRightResult = queryQuadTree(cell.children.topRight, queryRect);
      const bottomLeftResult = queryQuadTree(
        cell.children.bottomLeft,
        queryRect
      );
      const bottomRightResult = queryQuadTree(
        cell.children.bottomRight,
        queryRect
      );

      reuslt.push(...topLeftResult);
      reuslt.push(...topRightResult);
      reuslt.push(...bottomLeftResult);
      reuslt.push(...bottomRightResult);
      return reuslt;
    }

    for (const item of cell.items) {
      if (intersectsCircleRect(item, queryRect)) {
        reuslt.push(item);
      }
    }
  }
  return reuslt;
}

interface Circle {
  x: number;
  y: number;
  radius: number;
}
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function doesFullyContainRect(rect: Rect, rect2: Rect) {
  return (
    rect.x <= rect2.x &&
    rect.y <= rect.y &&
    rect.x + rect.width >= rect2.x + rect2.width &&
    rect.y + rect.height >= rect2.y + rect2.height
  );
}

function intersectsRectRect(rect: Rect, rect2: Rect) {
  // are the sides of one rectangle touching the other?
  if (
    rect.x + rect.width >= rect2.x && // r1 right edge past r2 left: ;
    rect.x <= rect2.x + rect2.width && // r1 left edge past r2 right: ;
    rect.y + rect.height >= rect2.y && // r1 top edge past r2 bottom
    rect.y <= rect2.y + rect2.height
  ) {
    // r1 bottom edge past r2 top
    return true;
  }
  return false;
}
function intersectsCircleRect(circle: Circle, rect: Rect) {
  const circleDistance = {
    x: Math.abs(circle.x - rect.x),
    y: Math.abs(circle.y - rect.y),
  };

  if (circleDistance.x > rect.width / 2 + circle.radius) {
    return false;
  }
  if (circleDistance.y > rect.height / 2 + circle.radius) {
    return false;
  }

  if (circleDistance.x <= rect.width / 2) {
    return true;
  }
  if (circleDistance.y <= rect.height / 2) {
    return true;
  }

  const cornerDistance_sq =
    (circleDistance.x - rect.width / 2) ^
    (2 + (circleDistance.y - rect.height / 2)) ^
    2;

  return cornerDistance_sq <= (circle.radius ^ 2);
}
