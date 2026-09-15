import { cn } from "@/utils/styleHelper";
import { type ComponentPropsWithRef } from "react";
import "./Button.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
} & ComponentPropsWithRef<"button">;

export default function Button({ children, className, variant = "secondary", size = "md", ...props }: Props) {
  return (
    <button className={cn("btn", `btn-${variant}`, `btn-${size}`, className)} {...props}>
      {children}
    </button>
  );
}
