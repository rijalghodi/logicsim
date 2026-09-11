import { useEffect, useRef, useState } from "react";
import { toast } from "./Toast";
import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import { CHIP_FILL } from "../circuit/colors";
import { Input } from "./Input";
import { ColorPickerButton } from "./ColorPickerButton";

interface SaveChipModalProps {
  readonly isOpen: boolean;
  readonly initialName?: string;
  readonly onSave: (name: string, color: string) => void;
  readonly onCancel: () => void;
}

export function SaveChipModal({ isOpen, initialName = "", onSave, onCancel }: SaveChipModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(CHIP_FILL);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialName);
      setColor(CHIP_FILL);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Please enter a chip name");
      return;
    }
    if (trimmed === "NAND") {
      toast.error("NAND is a reserved primitive chip name");
      return;
    }
    onSave(trimmed, color);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>
        <ModalTitle>Save Chip</ModalTitle>
        <ModalDescription>Enter a name and color for your custom chip.</ModalDescription>
      </ModalHeader>

      <ModalBody onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "8px" }}>
          <ColorPickerButton color={color} onChange={setColor} title="Choose Chip Color" />
          <Input
            type="text"
            placeholder="CHIP NAME (e.g. AND, XOR)"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            style={{ flex: 1 }}
          />
        </div>

        <ModalActions>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            CANCEL
          </button>
          <button type="submit" className="btn-primary">
            SAVE CHIP
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
