/**
 * Pure layout math for the circuit canvas — no core or Konva imports. Every
 * component box is drawn signal-flow-left-to-right: inputs on the left
 * edge, outputs on the right edge, ports spaced evenly down whichever
 * edge they're on.
 */

export interface Position {
  readonly x: number;
  readonly y: number;
}

/** Component id -> its top-left corner on the canvas. Positions, not the circuit's own data (see SPEC.md's note on `Circuit`). */
export type Layout = Record<string, Position>;

export const NODE_WIDTH = 120;
export const MIN_NODE_HEIGHT = 60;
export const PORT_ROW_HEIGHT = 20;
export const PORT_RADIUS = 8;
export const BOUNDARY_PORT_RADIUS = 8;
export const BOUNDARY_MARGIN = 72;
export const BOUNDARY_LABEL_WIDTH = 100;
export const BOUNDARY_LABEL_OFFSET_Y = 26;

/** Taller boxes for gates with more ports, so pins on a busy side don't crowd together. */
export function getNodeHeight(maxPortCount: number): number {
  return Math.max(MIN_NODE_HEIGHT, (maxPortCount + 1) * PORT_ROW_HEIGHT);
}

export function getComponentBox(
  position: Position,
  maxPortCount: number,
): { x: number; y: number; width: number; height: number } {
  return { x: position.x, y: position.y, width: NODE_WIDTH, height: getNodeHeight(maxPortCount) };
}

/** The i-th of `count` evenly-spaced offsets along a span of length `span` (never flush with either end). */
function spacedOffset(index: number, count: number, span: number): number {
  return (span * (index + 1)) / (count + 1);
}

export function getComponentPortPosition(
  position: Position,
  direction: "input" | "output",
  index: number,
  count: number,
  maxPortCount: number,
): Position {
  const box = getComponentBox(position, maxPortCount);
  const y = box.y + spacedOffset(index, count, box.height);
  const x = direction === "input" ? box.x : box.x + box.width;
  return { x, y };
}

/** A circuit's own boundary ports sit at the very edges of the canvas: inputs on the left, outputs on the right. */
export function getBoundaryPortPosition(
  side: "left" | "right",
  index: number,
  count: number,
  canvasWidth: number,
  canvasHeight: number,
): Position {
  const y = spacedOffset(index, count, canvasHeight);
  const x = side === "left" ? BOUNDARY_MARGIN : canvasWidth - BOUNDARY_MARGIN;
  return { x, y };
}
