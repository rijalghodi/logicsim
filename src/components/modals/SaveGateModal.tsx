import { useEffect, useRef, useState } from "react";

interface SaveGateModalProps {
  readonly isOpen: boolean;
  readonly initialName?: string;
  readonly onSave: (name: string) => void;
  readonly onCancel: () => void;
}

export function SaveGateModal({ isOpen, initialName = "", onSave, onCancel }: SaveGateModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialName);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a gate name");
      return;
    }
    if (trimmed === "NAND") {
      setError("NAND is a reserved primitive gate name");
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
        <div className="modal-header">
          <h3 className="modal-title">Save Chip</h3>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <input
            ref={inputRef}
            type="text"
            className="modal-input"
            placeholder="e.g. AND, XOR, HALF_ADDER"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
          />

          {error && (
            <div style={{ color: "#f87171", fontSize: "12px", marginTop: "-12px", marginBottom: "16px" }}>{error}</div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
