import { useEffect, useRef, useState } from "react";
import { toast } from "./Toast";
import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import { Input } from "./Input";
import { ColorPickerButton } from "./ColorPickerButton";
import { BIT_ACTIVE_COLOR } from "../circuit/colors";

interface CustomizePortModalProps {
  readonly isOpen: boolean;
  readonly initialName: string;
  readonly initialColor: string;
  readonly onCustomize: (newName: string, newColor: string) => void;
  readonly onCancel: () => void;
}

export function CustomizePortModal({
  isOpen,
  initialName,
  initialColor,
  onCustomize,
  onCancel,
}: CustomizePortModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor || BIT_ACTIVE_COLOR);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialName);

      setColor(initialColor || BIT_ACTIVE_COLOR);
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
    onCustomize(trimmed, color);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>
        <ModalTitle>CUSTOMIZE PORT</ModalTitle>
        <ModalDescription>Enter a new name for this boundary port.</ModalDescription>
      </ModalHeader>

      <ModalBody onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <ColorPickerButton color={color} onChange={setColor} />
          <Input
            ref={inputRef}
            type="text"
            placeholder="PORT NAME (e.g. A, B, OUT)"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            maxLength={10}
            style={{ flex: 1 }}
          />
        </div>

        <ModalActions>
          <button type="button" className="btn-secondary" onClick={onCancel}>
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
