import { useCircuitStore } from "@/stores/circuitStore";
import { ModalActions } from "./Modal";
import type { ModalContextProps } from "@/stores/modalStore";
import { useMemo } from "react";
import Button from "./Button";

/** What to do once the unsaved-changes prompt is resolved — whatever navigation/reset the caller was originally trying to do. */
export const UnsavedAlert = ({ payload, closeModal, openModal }: ModalContextProps<{ onProceed: () => void }>) => {
  const { currentChipId, savedChips } = useCircuitStore();

  // The chip with the actual unsaved changes is whatever's currently loaded — not wherever we're headed.
  const chip = useMemo(() => savedChips.find((c) => c.id === currentChipId), [savedChips, currentChipId]);

  const handleDiscard = () => {
    closeModal();
    payload.onProceed();
  };

  const handleSave = () => {
    closeModal();
    openModal("save-chip", {
      title: currentChipId ? "CUSTOMIZE CHIP" : "SAVE CHIP",
      chipId: currentChipId,
      onSaved: payload.onProceed,
    });
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
