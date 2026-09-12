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

/** Boundary Port */
export const BIT_CIRCLE_RADIUS = 15;

/** Component */
export const NODE_WIDTH = 80;
export const MIN_NODE_HEIGHT = 40;
export const PORT_ROW_HEIGHT = 20;
export const PORT_RADIUS = 8;
export const BOUNDARY_PORT_RADIUS = 8;
export const BOUNDARY_MARGIN = 72;
export const BOUNDARY_LABEL_WIDTH = 100;
export const BOUNDARY_LABEL_OFFSET_Y = 26;
export const PORT_LABEL_HEIGHT = 16;

/** Background grid dot spacing, shown when the "show grid" preference is on. */
export const GRID_SIZE = 20;

export function getPortLabelWidth(text: string): number {
  return Math.max(24, text.length * 8);
}

/** Taller boxes for chips with more ports, so pins on a busy side don't crowd together. */
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

export function getBoundaryPortPosition(
  side: "left" | "right",
  index: number,
  _count: number,
  canvasWidth: number,
  canvasHeight: number,
): Position {
  const PADDING_TOP = 16;
  const PADDING_BOTTOM = 56;
  const SPACING = 60;

  const centerY = (canvasHeight - PADDING_TOP - PADDING_BOTTOM) / 2 + PADDING_TOP;

  let offset = 0;
  if (index % 2 === 1) {
    offset = Math.ceil(index / 2) * SPACING;
  } else if (index > 0) {
    offset = -Math.ceil(index / 2) * SPACING;
  }

  const y = centerY + offset;
  const x = side === "left" ? 16 + BOUNDARY_MARGIN : canvasWidth - 16 - BOUNDARY_MARGIN;
  return { x, y };
}
