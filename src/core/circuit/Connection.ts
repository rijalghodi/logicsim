/**
 * Sentinel component id representing the circuit's own external interface
 * when that circuit is a `ChipDefinition`'s internals. Wiring a chip's own
 * input/output ports through the same `PortRef` shape as any other
 * component (instead of a special-cased port list) keeps `Connection`,
 * validation, and evaluation uniform: an external input is a source port
 * of `BOUNDARY_ID`, an external output is a destination port of it. The
 * two roles are inverted relative to how the ports read from *outside*
 * the chip: an "input" supplies a value here, an "output" consumes one.
 */
export const BOUNDARY_ID = "$boundary";

export interface PortRef {
  readonly componentId: string;
  readonly portId: string;
}

/**
 * A single directed wire from one output-like port to one input-like
 * port. Endpoints are plain IDs rather than object references so a
 * circuit remains trivially JSON-serializable and never holds a live
 * reference into another component's memory.
 */
export interface Connection {
  readonly from: PortRef;
  readonly to: PortRef;
}
