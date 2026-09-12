import { useToastStore } from "@/stores/toastStore";
import "./Toast.css";

export function Toast() {
  const current = useToastStore((state) => state.current);

  if (!current) return null;

  const typeClass = current.type === "success" ? "toast-success" : current.type === "error" ? "toast-error" : "";

  return <div className={`toast ${typeClass}`}>{current.message}</div>;
}
