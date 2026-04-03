import { Image } from './api';

const GROUP_PALETTE = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
  '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3',
  '#808000', '#ffd8b1', '#000075', '#a9a9a9',
];

export interface GroupInfo {
  color: string;
  groupNumber: number;
  rootId: number;
}

/**
 * Walk up best_id pointers to find the root of an image's group
 * within the current image set.
 */
function findRoot(imageId: number, bestIdMap: Map<number, number | null | undefined>, imageIds: Set<number>): number {
  let current = imageId;
  const visited = new Set<number>();
  while (true) {
    visited.add(current);
    const parent = bestIdMap.get(current);
    if (!parent || !imageIds.has(parent) || visited.has(parent)) break;
    current = parent;
  }
  return current;
}

/**
 * Build a color map for admin group_edit mode.
 * Each image that belongs to a best_id group gets a color and number.
 * Ungrouped images (no best_id, no children) are omitted.
 */
export function buildGroupColorMap(images: Image[]): Map<number, GroupInfo> {
  const imageIds = new Set(images.map(img => img.id));
  const bestIdMap = new Map<number, number | null | undefined>();
  for (const img of images) {
    bestIdMap.set(img.id, img.best_id);
  }

  const childrenMap = new Map<number, number[]>();
  for (const img of images) {
    if (img.best_id && imageIds.has(img.best_id)) {
      const children = childrenMap.get(img.best_id) || [];
      children.push(img.id);
      childrenMap.set(img.best_id, children);
    }
  }

  const rootOf = new Map<number, number>();
  for (const img of images) {
    rootOf.set(img.id, findRoot(img.id, bestIdMap, imageIds));
  }

  // Collect distinct roots that have at least one child in the set
  const rootIds = new Set<number>();
  for (const img of images) {
    const root = rootOf.get(img.id)!;
    if (root !== img.id || childrenMap.has(img.id)) {
      rootIds.add(root);
    }
  }

  const sortedRoots = Array.from(rootIds).sort((a, b) => a - b);
  const rootToGroup = new Map<number, { color: string; groupNumber: number }>();
  sortedRoots.forEach((rootId, idx) => {
    rootToGroup.set(rootId, {
      color: GROUP_PALETTE[idx % GROUP_PALETTE.length],
      groupNumber: idx + 1,
    });
  });

  const result = new Map<number, GroupInfo>();
  for (const img of images) {
    const root = rootOf.get(img.id)!;
    const group = rootToGroup.get(root);
    if (group) {
      result.set(img.id, { ...group, rootId: root });
    }
  }

  return result;
}

/**
 * Given a groupColorMap, return the set of all image IDs that share the
 * same root as the given imageId.
 */
export function getGroupMemberIds(imageId: number, groupColorMap: Map<number, GroupInfo>): Set<number> {
  const info = groupColorMap.get(imageId);
  if (!info) return new Set([imageId]);
  const rootId = info.rootId;
  const members = new Set<number>();
  groupColorMap.forEach((gi, id) => {
    if (gi.rootId === rootId) members.add(id);
  });
  return members;
}

/**
 * Build a hierarchical ordering of images using full best_id tree walk.
 * Returns a flat array: root first, then its descendants DFS, then next root, etc.
 * Used for visitor-facing thumbnail ordering.
 */
export function getTreeOrderedImages(images: Image[]): Image[] {
  const imageIds = new Set(images.map(img => img.id));
  const imageMap = new Map<number, Image>();
  for (const img of images) imageMap.set(img.id, img);

  const childrenMap = new Map<number, Image[]>();
  for (const img of images) {
    if (img.best_id && imageIds.has(img.best_id)) {
      const children = childrenMap.get(img.best_id) || [];
      children.push(img);
      childrenMap.set(img.best_id, children);
    }
  }

  // Roots: images whose best_id is null or points outside the current set
  const roots: Image[] = images.filter(
    img => !img.best_id || !imageIds.has(img.best_id)
  );

  const placed = new Set<number>();
  const result: Image[] = [];

  function dfs(img: Image) {
    if (placed.has(img.id)) return;
    placed.add(img.id);
    result.push(img);
    const children = childrenMap.get(img.id);
    if (children) {
      for (const child of children) dfs(child);
    }
  }

  for (const root of roots) dfs(root);

  // Catch any images missed (e.g. cycles)
  for (const img of images) {
    if (!placed.has(img.id)) {
      placed.add(img.id);
      result.push(img);
    }
  }

  return result;
}
