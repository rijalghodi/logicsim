import { useState } from "react";
import { Circle, Group } from "react-konva";
import type Konva from "konva";
import { PORT_RADIUS } from "./geometry";
import { WIRE_ACTIVE_COLOR, PORT_COLOR } from "./colors";

interface PortPinProps {
  readonly x: number;
  readonly y: number;
  readonly active: boolean;
  readonly isWiringActive?: boolean;
  readonly onPortClick?: () => void;
  readonly onHoverChange?: (isHovered: boolean) => void;
}

export function PortPin({ x, y, active, isWiringActive, onPortClick, onHoverChange }: PortPinProps) {
  const [isHovered, setIsHovered] = useState(false);

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = cursor;
  };

  const radius = isHovered ? PORT_RADIUS + 1.5 : PORT_RADIUS;

  return (
    <Group
      x={x}
      y={y}
      onClick={(e) => {
        e.cancelBubble = true;
        onPortClick?.();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onPortClick?.();
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onHoverChange?.(true);
        setCursor(e, "pointer");
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onHoverChange?.(false);
        setCursor(e, "default");
      }}
    >
      {/* Expanded hit target for effortless clicking and hovering */}
      <Circle x={0} y={0} radius={PORT_RADIUS + 8} fill="transparent" />

      {/* Target indicator ring during active wiring */}
      {isWiringActive && (
        <Circle
          x={0}
          y={0}
          radius={PORT_RADIUS + 4}
          stroke={WIRE_ACTIVE_COLOR}
          strokeWidth={1.5}
          dash={[3, 3]}
          listening={false}
        />
      )}

      {/* Subtle glow/halo when hovered */}
      {isHovered && (
        <Circle
          x={0}
          y={0}
          radius={PORT_RADIUS + 4}
          fill={active ? "hsla(51, 78%, 61%, 0.25)" : "hsla(0, 0%, 40%, 0.30)"}
          listening={false}
        />
      )}

      {/* Pin shape */}
      <Circle x={0} y={0} radius={radius} fill={PORT_COLOR} listening={false} />
    </Group>
  );
}
