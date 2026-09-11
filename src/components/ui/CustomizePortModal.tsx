import { useEffect, useRef, useState } from "react";
import { toast } from "./Toast";
import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import { Input } from "./Input";

interface CustomizePortModalProps {
  readonly isOpen: boolean;
  readonly initialName: string;
  readonly onRename: (newName: string) => void;
  readonly onCancel: () => void;
}

export function CustomizePortModal({ isOpen, initialName, onRename, onCancel }: CustomizePortModalProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialName);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Port name cannot be empty");
      return;
    }
    onRename(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>
        <ModalTitle>CUSTOMIZE PORT</ModalTitle>
        <ModalDescription>Enter a new name for this boundary port.</ModalDescription>
      </ModalHeader>

      <ModalBody onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="PORT NAME (e.g. A, B, OUT)"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          maxLength={10}
        />

        <ModalActions>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            CANCEL
          </button>
          <button type="submit" className="btn-primary">
            RENAME
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
