import { useMemo } from "react";
import { Slider } from "./Slider";
import { oklchToHex, hexToOklch } from "@/utils/colorHelper";
import "./ColorSliderInput.css";

interface ColorSliderInputProps {
  readonly color: string;
  readonly onChange: (color: string) => void;
}

export function ColorSliderInput({ color, onChange }: ColorSliderInputProps) {
  const oklch = hexToOklch(color);
  const hue = isNaN(oklch.h) ? 0 : oklch.h;

  const handleHueChange = (h: number) => {
    onChange(oklchToHex({ l: 0.7, c: 0.15, h }));
  };

  const gradient = useMemo(() => {
    const stops = [];
    for (let i = 0; i <= 360; i += 30) {
      // In CSS we can directly use oklch() to create the gradient
      stops.push(`oklch(0.55 0.15 ${i})`);
    }
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, []);

  return (
    <div className="color-slider-container">
      <div className="color-slider-preview" style={{ backgroundColor: color }} />
      <Slider
        min={0}
        max={360}
        step={1}
        value={hue}
        onChange={handleHueChange}
        style={{ background: gradient }}
        className="hue-slider"
      />
    </div>
  );
}
