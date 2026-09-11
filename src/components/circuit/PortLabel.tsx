import { Group, Rect, Text } from "react-konva";
import { getPortLabelWidth, PORT_LABEL_HEIGHT } from "./geometry";

interface PortLabelProps {
  readonly x: number;
  readonly y: number;
  readonly text: string;
}

export function PortLabel({ x, y, text }: PortLabelProps) {
  const width = getPortLabelWidth(text);
  const height = PORT_LABEL_HEIGHT;

  return (
    <Group x={x} y={y} listening={false}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="hsl(0, 0%, 0%)"
        cornerRadius={4}
        shadowColor="hsl(0, 0%, 30)"
        shadowBlur={6}
        shadowOpacity={0.5}
      />
      <Text
        x={0}
        y={0}
        width={width}
        height={height}
        text={text}
        fontSize={12}
        fontStyle="500"
        fontFamily="JetBrains Mono"
        fill="hsl(0, 0%, 100%)"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}
