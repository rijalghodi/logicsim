import { useState } from "react";
import { Arc, Circle, Group, Rect, Text } from "react-konva";
import type { PortDefinition } from "../../core";
import {
  getComponentBox,
  getComponentPortPosition,
  PORT_RADIUS,
  getPortLabelWidth,
  PORT_LABEL_HEIGHT,
} from "./geometry";
import type { Position } from "./geometry";
import { WIRE_ACTIVE_COLOR, WIRE_INACTIVE_COLOR } from "./WireLine";
import { PortLabel } from "./PortLabel";

const BOX_FILL = "#27272a";
const BOX_STROKE = "#71717a";
const LABEL_COLOR = "#f4f4f5";

const PORT_HOVER_ACTIVE_COLOR = "#fef08a";
const PORT_HOVER_INACTIVE_COLOR = "#a1a1aa";

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
        const color = isHovered
          ? active
            ? PORT_HOVER_ACTIVE_COLOR
            : PORT_HOVER_INACTIVE_COLOR
          : active
            ? WIRE_ACTIVE_COLOR
            : WIRE_INACTIVE_COLOR;

        const badgeWidth = getPortLabelWidth(port.name);
        const badgeHeight = PORT_LABEL_HEIGHT;
        const badgeX = Math.max(4, p.x - badgeWidth - 8);
        const badgeY = p.y - badgeHeight / 2;

        return (
          <Group
            key={port.id}
            onClick={(e) => {
              e.cancelBubble = true;
              onPortClick?.(port.id, "input", p);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onPortClick?.(port.id, "input", p);
            }}
            onMouseEnter={(e) => {
              setHoveredPortId(port.id);
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "pointer";
            }}
            onMouseLeave={(e) => {
              setHoveredPortId((curr) => (curr === port.id ? null : curr));
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "default";
            }}
          >
            {/* Expanded hit target for effortless clicking and hovering */}
            <Circle x={p.x} y={p.y} radius={PORT_RADIUS + 8} fill="transparent" />

            {/* Target indicator ring during active wiring */}
            {isWiringActive && (
              <Circle
                x={p.x}
                y={p.y}
                radius={PORT_RADIUS + 5}
                stroke={WIRE_ACTIVE_COLOR}
                strokeWidth={1.5}
                dash={[3, 3]}
                listening={false}
              />
            )}

            {/* Subtle glow/halo when hovered */}
            {isHovered && (
              <Circle
                x={p.x}
                y={p.y}
                radius={PORT_RADIUS}
                fill={active ? "rgba(233, 210, 79, 0.25)" : "rgba(161, 161, 170, 0.25)"}
                listening={false}
              />
            )}

            {/* Port pin shape */}
            <Arc
              x={p.x}
              y={p.y}
              innerRadius={0}
              outerRadius={isHovered ? PORT_RADIUS + 1.5 : PORT_RADIUS}
              angle={180}
              rotation={90}
              fill={color}
              shadowColor={active ? WIRE_ACTIVE_COLOR : "#a1a1aa"}
              shadowBlur={isHovered ? 8 : active ? 4 : 0}
              shadowOpacity={0.9}
              listening={false}
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
        const color = isHovered
          ? active
            ? PORT_HOVER_ACTIVE_COLOR
            : PORT_HOVER_INACTIVE_COLOR
          : active
            ? WIRE_ACTIVE_COLOR
            : WIRE_INACTIVE_COLOR;

        const badgeHeight = PORT_LABEL_HEIGHT;
        const badgeX = p.x + 8;
        const badgeY = p.y - badgeHeight / 2;

        return (
          <Group
            key={port.id}
            onClick={(e) => {
              e.cancelBubble = true;
              onPortClick?.(port.id, "output", p);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onPortClick?.(port.id, "output", p);
            }}
            onMouseEnter={(e) => {
              setHoveredPortId(port.id);
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "pointer";
            }}
            onMouseLeave={(e) => {
              setHoveredPortId((curr) => (curr === port.id ? null : curr));
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = "default";
            }}
          >
            {/* Expanded hit target for effortless clicking and hovering */}
            <Circle x={p.x} y={p.y} radius={PORT_RADIUS + 8} fill="transparent" />

            {/* Subtle glow/halo when hovered */}
            {isHovered && (
              <Circle
                x={p.x}
                y={p.y}
                radius={PORT_RADIUS}
                fill={active ? "rgba(233, 210, 79, 0.25)" : "rgba(161, 161, 170, 0.25)"}
                listening={false}
              />
            )}

            {/* Port pin shape */}
            <Arc
              x={p.x}
              y={p.y}
              innerRadius={0}
              outerRadius={isHovered ? PORT_RADIUS + 1.5 : PORT_RADIUS}
              angle={180}
              rotation={-90}
              fill={color}
              shadowColor={active ? WIRE_ACTIVE_COLOR : "#a1a1aa"}
              shadowBlur={isHovered ? 8 : active ? 4 : 0}
              shadowOpacity={0.9}
              listening={false}
            />

            {/* Port label shown on hover */}
            {isHovered && <PortLabel x={badgeX} y={badgeY} text={port.name} />}
          </Group>
        );
      })}
    </Group>
  );
}
