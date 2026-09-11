/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "./Toast";
import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import { CHIP_FILL } from "../circuit/colors";
import { Input } from "./Input";
import { ColorPickerButton } from "./ColorPickerButton";

export interface ChipSaveState {
  readonly id: string | null;
  readonly name: string;
  readonly color: string;
}

export interface SaveChipModalContextType {
  openSaveModal: (initialState?: ChipSaveState) => void;
}

export const SaveChipModalContext = createContext<SaveChipModalContextType | null>(null);

export function useSaveChipModal() {
  const ctx = useContext(SaveChipModalContext);
  if (!ctx) throw new Error("useSaveChipModal must be used within a SaveChipModalProvider");
  return ctx;
}

export interface SaveChipModalProps {
  readonly isOpen: boolean;
  readonly initialState?: ChipSaveState;
  readonly onSave: (state: ChipSaveState) => void;
  readonly onCancel: () => void;
}

export function SaveChipModal({ isOpen, initialState, onSave, onCancel }: SaveChipModalProps) {
  const [name, setName] = useState(initialState?.name || "");
  const [color, setColor] = useState(initialState?.color || CHIP_FILL);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialState?.name || "");
      setColor(initialState?.color || CHIP_FILL);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialState]);

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
    onSave({ ...initialState, name: trimmed, color });
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>
        <ModalTitle>{initialState?.name ? "CUSTOMIZE" : "SAVE"} CHIP</ModalTitle>
        <ModalDescription>Enter a name and color for the chip.</ModalDescription>
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
