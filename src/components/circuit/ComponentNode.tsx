import { Arc, Group, Rect, Text } from "react-konva";
import type { PortDefinition } from "../../core";
import { getComponentBox, getComponentPortPosition, PORT_RADIUS } from "./geometry";
import type { Position } from "./geometry";
import { WIRE_ACTIVE_COLOR, WIRE_INACTIVE_COLOR } from "./WireLine";

const BOX_FILL = "#27272a";
const BOX_STROKE = "#71717a";
const LABEL_COLOR = "#f4f4f5";

interface ComponentNodeProps {
  readonly position: Position;
  readonly label: string;
  readonly inputs: readonly PortDefinition[];
  readonly outputs: readonly PortDefinition[];
  readonly getPortValue: (portId: string, direction: "input" | "output") => boolean;
  /** Fired with the component's new position while/after dragging. */
  readonly onMove?: (position: Position) => void;
}

/** One gate instance: a box with its name centered, input pins on the left edge, output pins on the right. */
export function ComponentNode({ position, label, inputs, outputs, getPortValue, onMove }: ComponentNodeProps) {
  const maxPortCount = Math.max(inputs.length, outputs.length);
  const box = getComponentBox({ x: 0, y: 0 }, maxPortCount);
  const draggable = Boolean(onMove);

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable={draggable}
      onDragMove={(e) => onMove?.({ x: e.target.x(), y: e.target.y() })}
      onDragEnd={(e) => onMove?.({ x: e.target.x(), y: e.target.y() })}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage && draggable) stage.container().style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
    >
      <Rect
        x={0}
        y={0}
        width={box.width}
        height={box.height}
        fill={BOX_FILL}
        stroke={BOX_STROKE}
        strokeWidth={1.5}
        cornerRadius={6}
      />
      <Text
        x={0}
        y={0}
        width={box.width}
        height={box.height}
        text={label}
        fontSize={12}
        fontStyle="bold"
        fill={LABEL_COLOR}
        align="center"
        verticalAlign="middle"
        wrap="word"
        padding={6}
        listening={false}
      />
      {inputs.map((port, index) => {
        const p = getComponentPortPosition({ x: 0, y: 0 }, "input", index, inputs.length, maxPortCount);
        const active = getPortValue(port.id, "input");
        return (
          <Arc
            key={port.id}
            x={p.x}
            y={p.y}
            innerRadius={0}
            outerRadius={PORT_RADIUS}
            angle={180}
            rotation={90}
            fill={active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR}
          />
        );
      })}
      {outputs.map((port, index) => {
        const p = getComponentPortPosition({ x: 0, y: 0 }, "output", index, outputs.length, maxPortCount);
        const active = getPortValue(port.id, "output");
        return (
          <Arc
            key={port.id}
            x={p.x}
            y={p.y}
            innerRadius={0}
            outerRadius={PORT_RADIUS}
            angle={180}
            rotation={-90}
            fill={active ? WIRE_ACTIVE_COLOR : WIRE_INACTIVE_COLOR}
          />
        );
      })}
    </Group>
  );
}
