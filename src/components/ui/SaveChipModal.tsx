import { useEffect, useRef, useState } from "react";
import { toast } from "@/stores/toastStore";
import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import { CHIP_FILL } from "../circuit/colors";
import { Input } from "./Input";
import { ColorSliderInput } from "./ColorSliderInput";
import { useSaveChipModalStore, type ChipSaveState } from "@/stores/saveChipModalStore";

export interface SaveChipModalProps {
  readonly onSave: (state: ChipSaveState) => void;
}

export function SaveChipModal({ onSave }: SaveChipModalProps) {
  const { isOpen, initialState, close } = useSaveChipModalStore();
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
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeader>
        <ModalTitle>{initialState?.name ? "CUSTOMIZE" : "SAVE"} CHIP</ModalTitle>
        <ModalDescription>Enter a name and color for the chip.</ModalDescription>
      </ModalHeader>

      <ModalBody onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            type="text"
            placeholder="CHIP NAME (e.g. AND, XOR)"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            style={{ width: "100%" }}
          />
          <ColorSliderInput color={color} onChange={setColor} />
        </div>

        <ModalActions>
          <button type="button" className="btn-secondary" onClick={close}>
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
