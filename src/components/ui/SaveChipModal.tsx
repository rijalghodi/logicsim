import { useEffect, useRef, useState } from "react";
import { toast } from "./Toast";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalActions } from "./Modal";

interface SaveChipModalProps {
  readonly isOpen: boolean;
  readonly initialName?: string;
  readonly onSave: (name: string) => void;
  readonly onCancel: () => void;
}

export function SaveChipModal({ isOpen, initialName = "", onSave, onCancel }: SaveChipModalProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialName);
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
    onSave(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>
        <ModalTitle>Save Chip</ModalTitle>
        <ModalDescription>Enter a name for your custom chip. This will be available in the dock.</ModalDescription>
      </ModalHeader>

      <ModalBody onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="modal-input"
          placeholder="CHIP NAME (e.g. AND, XOR)"
          value={name}
          onChange={(e) => {
            setName(e.target.value.toUpperCase());
          }}
        />

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
