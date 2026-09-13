import { cn } from "@/utils/styleHelper";
import { type ComponentPropsWithRef } from "react";
import "./Button.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
} & ComponentPropsWithRef<"button">;

export default function Button({ children, className, variant = "secondary", ...props }: Props) {
  return (
    <button className={cn(`btn-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
