/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import "./Toast.css";

type ToastType = "success" | "error" | "info";

interface ToastEvent {
  message: string;
  type: ToastType;
}

type ToastListener = (event: ToastEvent) => void;

let listeners: ToastListener[] = [];

export const toast = {
  success: (message: string) => {
    listeners.forEach((l) => l({ message, type: "success" }));
  },
  error: (message: string) => {
    listeners.forEach((l) => l({ message, type: "error" }));
  },
  info: (message: string) => {
    listeners.forEach((l) => l({ message, type: "info" }));
  },
};

export function Toast() {
  const [current, setCurrent] = useState<ToastEvent | null>(null);

  useEffect(() => {
    const listener = (event: ToastEvent) => {
      setCurrent(event);
      setTimeout(() => {
        setCurrent((curr) => (curr?.message === event.message ? null : curr));
      }, 3500);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  if (!current) return null;

  const typeClass = current.type === "success" ? "toast-success" : current.type === "error" ? "toast-error" : "";

  return <div className={`toast ${typeClass}`}>{current.message}</div>;
}
