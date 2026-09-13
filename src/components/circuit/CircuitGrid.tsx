import { Shape } from "react-konva";
import type Konva from "konva";
import { GRID_SIZE } from "./geometry";
import { GRID_DOT_COLOR } from "./constants";

interface CircuitGridProps {
  readonly width: number;
  readonly height: number;
}

/** A dotted background grid, purely decorative — drawn as one custom shape (not one `Circle` per dot) and never listens for pointer events, so clicks fall through to the background beneath it. */
export function CircuitGrid({ width, height }: CircuitGridProps) {
  return (
    <Shape
      listening={false}
      sceneFunc={(context: Konva.Context) => {
        context.fillStyle = GRID_DOT_COLOR;
        for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
          for (let y = GRID_SIZE; y < height; y += GRID_SIZE) {
            context.beginPath();
            context.arc(x, y, 1.5, 0, Math.PI * 2);
            context.fill();
          }
        }
      }}
    />
  );
}
