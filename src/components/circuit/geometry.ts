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
export const BOUNDARY_LABEL_OFFSET_Y = 26;
export const PORT_LABEL_HEIGHT = 16;
export const PORT_LABEL_MAX_WIDTH = 100;
export const WIRE_STROKE_WIDTH = 4;

/** Background grid dot spacing, shown when the "show grid" preference is on. */
export const GRID_SIZE = 20;

/** Wire corner radius, applied to a wire's interior corner anchors (no effect on a plain 2-point wire, which has none). */
export const WIRE_CORNER_RADIUS = 8;

/** Konva node name for the canvas background rect, used to distinguish "clicked empty canvas" from "clicked a shape". */
export const CANVAS_BG_NAME = "canvas-bg";

export function getPortLabelWidth(text: string): number {
  return Math.min(PORT_LABEL_MAX_WIDTH, Math.max(22, text.length * 9));
}

/** Orders ports by a saved chip's custom `boundaryLayout` (port id -> position), falling back to declaration order when absent. */
export function sortPortsByLayout<T extends { readonly id: string }>(
  ports: readonly T[],
  layout: Readonly<Record<string, number>> | undefined,
): readonly T[] {
  if (!layout) return ports;
  return [...ports].sort((a, b) => (layout[a.id] ?? 0) - (layout[b.id] ?? 0));
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

/**
 * Builds an SVG path `d` string for a wire: straight segments between `points`, with every
 * interior vertex (a corner anchor — never the two endpoints) rounded off by a quadratic
 * Bézier curve of `radius`, instead of a sharp angle.
 *
 * Per corner, the incoming and outgoing segments are each trimmed back by the corner radius
 * (`r`, clamped to half of whichever adjacent segment is shorter, so short segments can't make
 * the curve overshoot into a loop) to get a "cut-in" point and a "cut-out" point, and a `Q`
 * command curves between them using the original vertex as the control point — the same
 * "corner-cutting" technique used for elbow connectors in most diagramming tools.
 */
export function buildRoundedWirePath(points: readonly Position[], radius: number): string {
  if (points.length === 0) return "";

  if (points.length < 3 || radius <= 0) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  const commands: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const distIn = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const distOut = Math.hypot(next.x - curr.x, next.y - curr.y);

    // Degenerate segment (two corners placed on top of each other) — nothing to round.
    if (distIn === 0 || distOut === 0) {
      commands.push(`L ${curr.x} ${curr.y}`);
      continue;
    }

    const r = Math.min(radius, distIn / 2, distOut / 2);
    const cutIn = { x: curr.x + ((prev.x - curr.x) / distIn) * r, y: curr.y + ((prev.y - curr.y) / distIn) * r };
    const cutOut = { x: curr.x + ((next.x - curr.x) / distOut) * r, y: curr.y + ((next.y - curr.y) / distOut) * r };

    commands.push(`L ${cutIn.x} ${cutIn.y}`, `Q ${curr.x} ${curr.y} ${cutOut.x} ${cutOut.y}`);
  }

  const last = points[points.length - 1];
  commands.push(`L ${last.x} ${last.y}`);

  return commands.join(" ");
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
