import { useEffect, useRef, useState } from "react";
import { toast } from "./Toast";

interface SaveGateModalProps {
  readonly isOpen: boolean;
  readonly initialName?: string;
  readonly onSave: (name: string) => void;
  readonly onCancel: () => void;
}

export function SaveGateModal({ isOpen, initialName = "", onSave, onCancel }: SaveGateModalProps) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel} onKeyDown={handleKeyDown}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-body">
          <input
            ref={inputRef}
            type="text"
            className="modal-input"
            placeholder="CHIP NAME (e.g. AND, XOR, HALF_ADDER)"
            value={name}
            onChange={(e) => {
              setName(e.target.value.toUpperCase());
            }}
          />

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              CANCEL
            </button>
            <button type="submit" className="btn-primary">
              SAVE CHIP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
