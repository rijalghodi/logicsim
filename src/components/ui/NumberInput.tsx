import { Input } from "./Input";
import type { ComponentPropsWithRef } from "react";

export interface NumberInputProps extends Omit<
  ComponentPropsWithRef<"input">,
  "onChange" | "value" | "type" | "min" | "max"
> {
  readonly value: number;
  readonly onChange: (val: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly preventLeadingZero?: boolean;
}

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
