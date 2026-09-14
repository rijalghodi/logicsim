import type { ComponentPropsWithRef } from "react";
import "./Input.css";
import { cn } from "@/utils";

export function Input(props: Omit<ComponentPropsWithRef<"input">, "size"> & { size?: "sm" | "md" | "lg" | "xl" }) {
  const { size, className, ...rest } = props;
  return <input {...rest} className={cn("input", `input-${size || "md"}`, className)} />;
}
