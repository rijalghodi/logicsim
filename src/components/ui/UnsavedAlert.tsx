import { useCircuitStore } from "@/stores/circuitStore";
import { ModalActions } from "./Modal";
import type { ModalContextProps } from "@/stores/modalStore";
import { useMemo } from "react";
import Button from "./Button";

export const UnsavedAlert = ({
  payload,
  closeModal,
}: ModalContextProps<{ onDiscard: () => void; onSave: () => void }>) => {
  const { currentChipId, savedChips } = useCircuitStore();

  const chip = useMemo(() => savedChips.find((c) => c.id === currentChipId), [savedChips, currentChipId]);

  const handleDiscard = () => {
    closeModal();
    payload.onDiscard();
  };

  const handleSave = () => {
    closeModal();
    payload.onSave();
  };

  return (
    <>
      <p style={{ color: "var(--fg-muted)" }}>
        The <strong style={{ color: "var(--fg)" }}>{chip?.name ?? "Untitled"}</strong> circuit has unsaved changes. Do
        you want to save it before proceeding?
      </p>

      <ModalActions>
        <Button type="button" variant="secondary" onClick={closeModal}>
          CANCEL
        </Button>
        <Button type="button" variant="danger" onClick={handleDiscard}>
          DISCARD
        </Button>
        <Button type="button" variant="primary" onClick={handleSave}>
          SAVE
        </Button>
      </ModalActions>
    </>
  );
};
