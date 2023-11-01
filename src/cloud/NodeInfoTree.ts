import data from "../../assets/mainData.json";
import { loadAllImages, loadImage } from "../rendering/imageLoaderCanvas";
import { NodeCollection, createNodeCollection } from "./NodeCollection";

//@ts-ignore
// import images from "../../static/images/**";

export interface NodeInfo {
  id: string;
  img: string;
  desc: string;
  children: NodeInfo[];
  parent: NodeInfo | null;
}

export async function getAllImagesFromData(urlPrefix: string = "") {
  const imgUrls = data.nodes
    .map((node) => node.img)
    .map((src) => urlPrefix + src);
  const allImages = await loadAllImages(imgUrls);

  return allImages;
}

export function buildTreeFromData() {
  const allNodesLookup: { [key: string]: NodeInfo } = {};

  // make a lookup table for the nodes
  data.nodes.forEach((node) => {
    const nodeInfo = {
      id: node.id,
      img: node.img,
      desc: node.desc,
      children: [],
      parent: null,
    };
    allNodesLookup[nodeInfo.id] = nodeInfo;
  });

  // stitch nodes together
  const allNodesTree: NodeInfo[] = data.links
    .reduce((arr, currLink, index) => {
      // move nodes into node
      const sourceNode = allNodesLookup[currLink.source];
      const targetNode = allNodesLookup[currLink.target];
      targetNode.parent = sourceNode;
      sourceNode.children.push(targetNode);
      // add source node the record
      if (!arr.includes(sourceNode)) arr.push(sourceNode);
      return arr;
    }, [] as NodeInfo[])
    .filter((node) => {
      // return the root node only
      return node.parent === null;
    });

  return allNodesTree;
}

export type NodeCollectionFactory = (
  nodeInfo: NodeInfo,
  parentNode: NodeCollection | null,
  level: number,
  index: number
) => NodeCollection;

export function createAllNodesFromTree(
  treeNode: NodeInfo[],
  buildNode: NodeCollectionFactory
): NodeCollection[] {
  function buildNodeRecursively(
    nodeInfoArr: NodeInfo[],
    level: number,
    parentNodeCollection?: NodeCollection
  ): NodeCollection[] {
    return nodeInfoArr.map((nodeInfo, index) => {
      // this is the root node
      if (!parentNodeCollection) {
        const newNodeCollection = buildNode(nodeInfo, null, 0, index);
        buildNodeRecursively(nodeInfo.children, level + 1, newNodeCollection);
        return newNodeCollection;
      }
      // not the root collection
      const newNodeCollection = buildNode(
        nodeInfo,
        parentNodeCollection,
        level,
        index
      );
      buildNodeRecursively(nodeInfo.children, level + 1, newNodeCollection);
      return newNodeCollection;
    });
    // const nodeCollection =
    //   parentNodeCollection === undefined
    //     ? buildNode(nodeInfo, null, level)
    //     : parentNodeCollection;

    // // reached the bottom
    // if (nodeInfo.children.length === 0) return nodeCollection;

    // // build the children
    // nodeInfo.children.forEach((childrenNode) => {
    //   buildNode(childrenNode, nodeCollection, level);
    //   buildNodeRecursively(childrenNode, level + 1, nodeCollection);
    // });
  }

  return buildNodeRecursively(treeNode, 0);
}
