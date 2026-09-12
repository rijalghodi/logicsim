import { useState, useRef } from "react";
import { Group, Rect, Text } from "react-konva";
import type { PortDefinition } from "@/core";
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
import { CHIP_FILL } from "./colors";
import { getBorderColor, getContrastColor, getSafeColor } from "@/utils/colorHelper";
import type Konva from "konva";

interface ChipNodeProps {
  readonly position: Position;
  /** chipType is NAND or chipDefinition.id. */
  readonly chipType: string;
  readonly label: string;
  readonly color?: string;
  readonly inputs: readonly PortDefinition[];
  readonly outputs: readonly PortDefinition[];
  readonly getPortValue: (portId: string, direction: "input" | "output") => boolean;
  /** Fired with the component's new position while/after dragging. */
  readonly onMove?: (position: Position) => void;
  /** Whether the context menu for this chip is open */
  readonly isContextMenuOpen?: boolean;
  /** Fired when clicking the chip */
  readonly onContextMenu?: (x: number, y: number) => void;
  /** Fired when double clicking the chip */
  readonly onDblClick?: () => void;
  /** Fired when clicking a port to start or finish a wire connection. */
  readonly onPortClick?: (portId: string, direction: "input" | "output", portPosition: Position) => void;
  /** Whether a wire is currently being drawn across the canvas. */
  readonly isWiringActive?: boolean;
  /** Show every port's label at all times, not just on hover (the "show port labels" preference). */
  readonly showPortLabels?: boolean;
}

/** One chip instance: a box with its name centered, input pins on the left edge, output pins on the right. */
export function ChipNode({
  position,
  chipType,
  label,
  color,
  inputs,
  outputs,
  getPortValue,
  onMove,
  isContextMenuOpen,
  onContextMenu,
  onDblClick,
  onPortClick,
  isWiringActive,
  showPortLabels,
}: ChipNodeProps) {
  const [hoveredPortId, setHoveredPortId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);

  const maxPortCount = Math.max(inputs.length, outputs.length);
  const box = getComponentBox({ x: 0, y: 0 }, maxPortCount);
  const draggable = Boolean(onMove);

  const openContextMenu = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (onContextMenu) {
      const stage = e.target.getStage();
      const pointerPos = stage?.getPointerPosition();
      if (pointerPos) {
        onContextMenu(pointerPos.x, pointerPos.y);
      } else {
        onContextMenu(position.x + box.width + 16, position.y);
      }
    }
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    openContextMenu(e);
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if ("button" in e.evt && e.evt.button !== 0) return;
    if (isDraggingRef.current) return;
    e.cancelBubble = true;
    openContextMenu(e);
  };

  return (
    <Group>
      {/* Draggable body group */}
      <Group
        x={position.x}
        y={position.y}
        draggable={draggable && !isContextMenuOpen}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragMove={(e) => onMove?.(e.target.position())}
        onDragEnd={(e) => {
          onMove?.(e.target.position());
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 100);
        }}
        onClick={handleClick}
        onTap={handleClick}
        onContextMenu={handleContextMenu}
        onDblClick={(e) => {
          if (chipType === "NAND") return;
          e.cancelBubble = true;
          onDblClick?.();
        }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          const stage = e.target.getStage();
          if (stage && draggable) stage.container().style.cursor = "grab";
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
      >
        {/* TODO: Halo Effect behind the component when hovered */}
        {(isHovered || isContextMenuOpen) && (
          <Rect
            x={-6}
            y={-6}
            width={box.width + 12}
            height={box.height + 12}
            cornerRadius={8}
            fill="hsl(0, 0%, 43%)"
            opacity={0.5}
            listening={false}
          />
        )}

        <Rect
          x={0}
          y={0}
          width={box.width}
          height={box.height}
          fill={getSafeColor(color ?? CHIP_FILL)}
          stroke={getBorderColor(color ?? CHIP_FILL)}
          strokeWidth={1.5}
          cornerRadius={6}
        />
        <Text
          x={0}
          y={0}
          width={box.width}
          height={box.height}
          text={label}
          fontSize={16}
          fontFamily="JetBrains Mono"
          fontStyle="bold"
          fill={getContrastColor(color ?? CHIP_FILL)}
          align="center"
          verticalAlign="middle"
          wrap="word"
          padding={PORT_RADIUS}
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

            {/* Port label shown on hover, or always when the "show port labels" preference is on */}
            {(isHovered || showPortLabels) && <PortLabel x={badgeX} y={badgeY} text={port.name} />}
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

            {/* Port label shown on hover, or always when the "show port labels" preference is on */}
            {(isHovered || showPortLabels) && <PortLabel x={badgeX} y={badgeY} text={port.name} />}
          </Group>
        );
      })}
    </Group>
  );
}
