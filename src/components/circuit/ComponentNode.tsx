import { useState } from "react";
import { Group, Rect, Text } from "react-konva";
import type { PortDefinition } from "../../core";
import {
  getComponentBox,
  getComponentPortPosition,
  getPortLabelWidth,
  PORT_LABEL_HEIGHT,
  PORT_RADIUS,
} from "./geometry";
import type { Position } from "./geometry";
import { PortLabel } from "./PortLabel";
import { PortPin } from "./PortPin";

const BOX_FILL = "hsla(88, 78%, 33%, 1.00)";
const BOX_STROKE = "hsl(0, 0%, 30%)";
const LABEL_COLOR = "hsl(0, 0%, 90%)";

interface ComponentNodeProps {
  readonly position: Position;
  readonly label: string;
  readonly inputs: readonly PortDefinition[];
  readonly outputs: readonly PortDefinition[];
  readonly getPortValue: (portId: string, direction: "input" | "output") => boolean;
  /** Fired with the component's new position while/after dragging. */
  readonly onMove?: (position: Position) => void;
  /** Fired when clicking a port to start or finish a wire connection. */
  readonly onPortClick?: (portId: string, direction: "input" | "output", portPosition: Position) => void;
  /** Whether a wire is currently being drawn across the canvas. */
  readonly isWiringActive?: boolean;
}

/** One gate instance: a box with its name centered, input pins on the left edge, output pins on the right. */
export function ComponentNode({
  position,
  label,
  inputs,
  outputs,
  getPortValue,
  onMove,
  onPortClick,
  isWiringActive,
}: ComponentNodeProps) {
  const [hoveredPortId, setHoveredPortId] = useState<string | null>(null);

  const maxPortCount = Math.max(inputs.length, outputs.length);
  const box = getComponentBox({ x: 0, y: 0 }, maxPortCount);
  const draggable = Boolean(onMove);

  return (
    <Group>
      {/* Draggable gate body: box and label */}
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
          fontSize={14}
          fontFamily="JetBrains Mono"
          fontStyle="bold"
          fill={LABEL_COLOR}
          align="center"
          verticalAlign="middle"
          wrap="word"
          padding={6}
          listening={false}
        />
      </Group>

      {/* Input ports outside the draggable body group */}
      {inputs.map((port, index) => {
        const p = getComponentPortPosition(position, "input", index, inputs.length, maxPortCount);
        const active = getPortValue(port.id, "input");
        const isHovered = hoveredPortId === port.id;

        const badgeWidth = getPortLabelWidth(port.name);
        const badgeHeight = PORT_LABEL_HEIGHT;
        const badgeX = Math.max(4, p.x - badgeWidth - PORT_RADIUS - 4);
        const badgeY = p.y - badgeHeight / 2;

        return (
          <Group key={port.id}>
            <PortPin
              x={p.x}
              y={p.y}
              active={active}
              isWiringActive={isWiringActive}
              onPortClick={() => onPortClick?.(port.id, "input", p)}
              onHoverChange={(hovered) => setHoveredPortId(hovered ? port.id : null)}
            />

            {/* Port label shown on hover */}
            {isHovered && <PortLabel x={badgeX} y={badgeY} text={port.name} />}
          </Group>
        );
      })}

      {/* Output ports outside the draggable body group */}
      {outputs.map((port, index) => {
        const p = getComponentPortPosition(position, "output", index, outputs.length, maxPortCount);
        const active = getPortValue(port.id, "output");
        const isHovered = hoveredPortId === port.id;

        const badgeHeight = PORT_LABEL_HEIGHT;
        const badgeX = p.x + PORT_RADIUS + 4;
        const badgeY = p.y - badgeHeight / 2;

        return (
          <Group key={port.id}>
            <PortPin
              x={p.x}
              y={p.y}
              active={active}
              isWiringActive={isWiringActive}
              onPortClick={() => onPortClick?.(port.id, "output", p)}
              onHoverChange={(hovered) => setHoveredPortId(hovered ? port.id : null)}
            />

            {/* Port label shown on hover */}
            {isHovered && <PortLabel x={badgeX} y={badgeY} text={port.name} />}
          </Group>
        );
      })}
    </Group>
  );
}
