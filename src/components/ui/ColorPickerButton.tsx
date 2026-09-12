import { useRef } from "react";
import { PenIcon } from "./icons/PenIcon";
import { getContrastColor } from "@/utils/colorHelper";

interface ColorPickerButtonProps {
  readonly color: string;
  readonly onChange: (color: string) => void;
  readonly title?: string;
  readonly size?: number;
}

export function ColorPickerButton({ color, onChange, title = "Choose Color", size = 36 }: ColorPickerButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  console.log(color);

  return (
    <>
      <input
        type="color"
        ref={inputRef}
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          background: color,
          border: "1px solid var(--border)",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
        title={title}
      >
        <PenIcon color={getContrastColor(color)} />
      </button>
    </>
  );
}
