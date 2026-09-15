import type { ComponentPropsWithRef } from "react";
import "./Input.css";
import { cn } from "@/utils";

export type InputSize = "sm" | "md" | "lg" | "xl";

export type InputProps = Omit<ComponentPropsWithRef<"input">, "size"> & {
  readonly size?: InputSize;
};

export function Input(props: InputProps) {
  const { size = "md", className, ...rest } = props;
  return <input {...rest} className={cn("input", `input-${size}`, className)} />;
}
