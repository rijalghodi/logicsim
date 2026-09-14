import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/stores/toastStore";
import { ModalActions } from "./Modal";
import { CHIP_FILL } from "../circuit/constants";
import { Input } from "./Input";
import { ColorSliderInput } from "./ColorSliderInput";
import type { ModalContextProps } from "@/stores/modalStore";
import { useCircuitStore } from "@/stores/circuitStore";
import Button from "./Button";

export const SaveChipModal = ({
  payload,
  closeModal,
}: ModalContextProps<{ chipId: string | null; onSaved?: () => void }>) => {
  const { savedChips, saveCurrentChip } = useCircuitStore();

  const chip = useMemo(() => savedChips.find((c) => c.id === payload.chipId), [savedChips, payload.chipId]);

  const [name, setName] = useState(chip?.name || "");
  const [color, setColor] = useState(chip?.color || CHIP_FILL);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a chip name");
      return;
    }
    if (trimmed === "NAND") {
      toast.error("NAND is a reserved primitive chip name");
      return;
    }
    saveCurrentChip({ id: chip?.id ?? null, name: trimmed, color });
    closeModal();
    payload.onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Input
          type="text"
          placeholder="CHIP NAME (e.g. AND, XOR)"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%" }}
          maxLength={20}
          required
        />
        <ColorSliderInput color={color} onChange={setColor} />
      </div>

      <ModalActions>
        <Button type="button" variant="secondary" onClick={closeModal}>
          CANCEL
        </Button>
        <Button type="submit" variant="primary">
          SAVE CHIP
        </Button>
      </ModalActions>
    </form>
  );
};
