import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "@/stores/toastStore";
import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import { Input } from "./Input";
import { ColorSliderInput } from "./ColorSliderInput";
import { BIT_COLOR } from "../circuit/colors";
import { useCircuitStore } from "@/stores/circuitStore";
import { useCustomizePortModalStore } from "@/stores/customizePortModalStore";

export function CustomizePortModal() {
  const { isOpen, portId, close } = useCustomizePortModalStore();
  const { boundary, portColors, renameBoundaryPort } = useCircuitStore();

  const port = useMemo(() => {
    if (!portId) return null;
    return boundary.inputs.find((p) => p.id === portId) ?? boundary.outputs.find((p) => p.id === portId) ?? null;
  }, [portId, boundary]);

  const initialName = port?.name ?? "";
  const initialColor = portId ? (portColors[portId] ?? "") : "";

  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor || BIT_COLOR);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialName);

      setColor(initialColor || BIT_COLOR);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialName, initialColor]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Port name cannot be empty");
      return;
    }
    if (portId) {
      renameBoundaryPort(portId, trimmed, color);
    }
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeader>
        <ModalTitle>CUSTOMIZE PORT</ModalTitle>
        <ModalDescription>Enter a new name for this boundary port.</ModalDescription>
      </ModalHeader>

      <ModalBody onSubmit={handleSubmit}>
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
          <ColorSliderInput color={color} onChange={setColor} />
        </div>

        <ModalActions>
          <button type="button" className="btn-secondary" onClick={close}>
            CANCEL
          </button>
          <button type="submit" className="btn-primary">
            SAVE
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
