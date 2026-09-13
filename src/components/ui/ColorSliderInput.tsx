/* eslint-disable react-hooks/refs */
import { useMemo, useState, useRef } from "react";
import { Slider } from "./Slider";
import { oklchToHex, hexToOklch } from "@/utils/colorHelper";
import "./ColorSliderInput.css";
import { NumberInput } from "./NumberInput";

interface ColorSliderInputProps {
  readonly color: string;
  readonly onChange: (color: string) => void;
}

export function ColorSliderInput({ color, onChange }: ColorSliderInputProps) {
  const oklch = hexToOklch(color);
  const externalHue = isNaN(oklch.h) ? 0 : oklch.h;

  const [internalHue, setInternalHue] = useState(externalHue);
  const lastColorRef = useRef(color);

  // Sync with external color changes
  if (color !== lastColorRef.current) {
    setInternalHue(externalHue);
    lastColorRef.current = color;
  }

  const handleHueChange = (h: number) => {
    setInternalHue(h);
    const newColor = oklchToHex({ l: 0.55, c: 0.15, h });
    lastColorRef.current = newColor;
    onChange(newColor);
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
      <NumberInput
        min={0}
        max={360}
        preventLeadingZero
        value={Math.round(internalHue)}
        onChange={handleHueChange}
        style={{ width: 44, height: 28, fontSize: 12 }}
      />
      <Slider
        min={0}
        max={360}
        step={1}
        value={internalHue}
        onChange={handleHueChange}
        style={{ background: gradient }}
        className="hue-slider"
      />
    </div>
  );
}
