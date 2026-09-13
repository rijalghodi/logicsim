import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "@/stores/toastStore";
import { ModalActions } from "./Modal";
import { Input } from "./Input";
import { useCircuitStore } from "@/stores/circuitStore";
import type { ModalContextProps } from "@/stores/modalStore";
import Button from "./Button";

export const CustomizePortModal = ({ payload, closeModal }: ModalContextProps<{ portId: string }>) => {
  const { boundary, customizeBoundaryPort: renameBoundaryPort } = useCircuitStore();

  const port = useMemo(() => {
    return (
      boundary.inputs.find((p) => p.id === payload.portId) ??
      boundary.outputs.find((p) => p.id === payload.portId) ??
      null
    );
  }, [payload.portId, boundary]);

  const [name, setName] = useState(port?.name ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Port name cannot be empty");
      return;
    }
    renameBoundaryPort(payload.portId, trimmed);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="PORT NAME (e.g. A, B, OUT)"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          maxLength={10}
          required
        />
      </div>

      <ModalActions>
        <Button type="button" variant="secondary" onClick={closeModal}>
          CANCEL
        </Button>
        <Button type="submit" variant="primary">
          SAVE
        </Button>
      </ModalActions>
    </form>
  );
};
