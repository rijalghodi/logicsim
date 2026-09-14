import { Input, type InputSize } from "./Input";
import type { ComponentPropsWithRef } from "react";

export type NumberInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "onChange" | "value" | "type" | "min" | "max" | "size"
> & {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  preventLeadingZero?: boolean;
  size?: InputSize;
};

export function NumberInput({ value, onChange, min, max, preventLeadingZero, ...props }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valStr = e.target.value;

    if (preventLeadingZero && /^0[0-9]/.test(valStr)) {
      valStr = valStr.replace(/^0+/, "");
      if (valStr === "") valStr = "0";
      e.target.value = valStr;
    }

    let num = Number(valStr);
    if (isNaN(num)) num = 0;

    if (max !== undefined && num > max) num = max;
    if (min !== undefined && num < min) num = min;

    onChange(num);
  };

  return <Input type="number" min={min} max={max} value={value} onChange={handleChange} {...props} />;
}
