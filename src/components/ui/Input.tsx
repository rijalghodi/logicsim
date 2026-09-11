import type { ComponentPropsWithRef } from "react";
import "./Input.css";

export function Input(props: ComponentPropsWithRef<"input">) {
  return <input {...props} className={`input ${props.className || ""}`} />;
}
