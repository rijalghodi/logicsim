import { useEffect, useRef, useState } from "react";
import type Konva from "konva";
import type { PortDirection, PortRef } from "@/core";
import { CANVAS_BG_NAME } from "./geometry";
import type { Position } from "./geometry";

/** A wire being drawn: the starting port, plus any corner anchors committed so far by clicking empty canvas space. */
export interface WiringDraft {
  readonly from: PortRef;
  readonly fromPos: Position;
  readonly corners: readonly Position[];
}

/**
 * Owns the click-to-wire state machine: click a port to start, optionally click
 * empty canvas to drop corner anchors, then click another port to finish (or
 * cancel by re-clicking the start port or pressing Escape). Kept separate from
 * rendering so this interaction logic reads as one self-contained unit.
 *
 * `cursor` is intentionally its own state, separate from `wiringDraft`: it
 * changes on every mousemove pixel while `wiringDraft` changes only on those
 * discrete events. Keeping them apart means `handlePortInteraction` (which
 * closes over `wiringDraft`, not `cursor`) stays referentially stable while
 * the mouse moves — letting components downstream that don't care about the
 * cursor (every placed chip, every boundary port) skip re-rendering on each
 * tick instead of redoing a full re-render per mousemove.
 *
 * Ports can be clicked in either order — output-then-input or
 * input-then-output. `getPortDirection` lets `handlePortInteraction` detect
 * a "backward" pair and normalize it to (output, input) before calling
 * `onConnectWire`, so a connection started at an input still succeeds. A
 * same-direction pair (two inputs, two outputs) is passed through unchanged
 * and left for core's own validation to reject.
 */
export function useWiringDraft(
  onConnectWire?: (from: PortRef, to: PortRef, anchors?: Position[]) => void,
  getPortDirection?: (ref: PortRef) => PortDirection | undefined,
) {
  const [wiringDraft, setWiringDraft] = useState<WiringDraft | null>(null);
  const [cursor, setCursor] = useState<Position | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  /** Ends the wire draft and restores the default cursor (elements the mouse is currently over will re-assert their own cursor as it moves). */
  const cancel = () => {
    setWiringDraft(null);
    setCursor(null);
    const stage = stageRef.current;
    if (stage) stage.container().style.cursor = "default";
  };

  // Cancel wiring on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!wiringDraft) return;
    const stage = e.target.getStage();
    const ptr = stage?.getPointerPosition();
    if (ptr) setCursor(ptr);

    // Crosshair over empty canvas while wiring; ports/wires/chips manage their own cursor on hover.
    const isBackground = e.target === stage || e.target.attrs.name === CANVAS_BG_NAME;
    if (isBackground && stage) stage.container().style.cursor = "crosshair";
  };

  /** A click on empty canvas, while wiring, commits another corner anchor instead of canceling. */
  const handleBackgroundClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!wiringDraft) return;
    const stage = e.target.getStage();
    const ptr = stage?.getPointerPosition();
    if (ptr) {
      setWiringDraft({ ...wiringDraft, corners: [...wiringDraft.corners, ptr] });
      setCursor(ptr);
    }
  };

  const handlePortInteraction = (ref: PortRef, portPos: Position) => {
    if (!wiringDraft) {
      setWiringDraft({ from: ref, fromPos: portPos, corners: [] });
      setCursor(portPos);
      return;
    }
    // Clicking the exact same port cancels.
    if (wiringDraft.from.componentId === ref.componentId && wiringDraft.from.portId === ref.portId) {
      cancel();
      return;
    }
    // A connection must run output -> input; if the user clicked input first
    // and output second, swap so it still succeeds. Corners were recorded
    // walking from the first click to the second, so they need reversing too
    // when the endpoints swap, to keep the rendered path's corner order correct.
    const backward = getPortDirection?.(wiringDraft.from) === "input" && getPortDirection?.(ref) === "output";
    const [source, destination] = backward ? [ref, wiringDraft.from] : [wiringDraft.from, ref];
    const corners = backward ? [...wiringDraft.corners].reverse() : [...wiringDraft.corners];

    onConnectWire?.(source, destination, corners);
    cancel();
  };

  return { wiringDraft, cursor, stageRef, handleStageMouseMove, handleBackgroundClick, handlePortInteraction };
}
