import { useEffect, useRef, useState } from "react";
import { toast } from "./Toast";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalActions } from "./Modal";
import { CHIP_FILL, getContrastColor } from "../circuit/colors";

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
  const colorInputRef = useRef<HTMLInputElement>(null);

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
        <ModalDescription>
          Enter a name and color for your custom chip. This will be available in the dock.
        </ModalDescription>
      </ModalHeader>

      <ModalBody onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Hidden color input */}
          <input
            type="color"
            ref={colorInputRef}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
          />
          {/* Custom color picker button */}
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            style={{
              width: "42px",
              height: "42px",
              flexShrink: 0,
              background: color,
              border: "1px solid #333",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            title="Choose Chip Color"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={getContrastColor(color)}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            className="modal-input"
            placeholder="CHIP NAME (e.g. AND, XOR)"
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
