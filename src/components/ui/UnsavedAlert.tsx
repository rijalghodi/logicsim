import { useCircuitStore } from "@/stores/circuitStore";
import { ModalActions } from "./Modal";
import type { ModalContextProps } from "@/stores/modalStore";
import { useMemo } from "react";
import Button from "./Button";

export const UnsavedAlert = ({
  payload,
  closeModal,
  openModal,
}: ModalContextProps<{ chipIdToOpen: string | null }>) => {
  const { savedChips, loadChipToCanvas, resetToBlank } = useCircuitStore();

  const chip = useMemo(() => savedChips.find((c) => c.id === payload.chipIdToOpen), [savedChips, payload.chipIdToOpen]);

  const handleDiscard = () => {
    closeModal();
    if (payload.chipIdToOpen) {
      loadChipToCanvas(payload.chipIdToOpen);
    } else {
      resetToBlank();
    }
  };

  const handleSave = () => {
    closeModal();
    openModal("save-chip", {
      title: payload.chipIdToOpen ? "CUSTOMIZE CHIP" : "SAVE CHIP",
      chipId: payload.chipIdToOpen,
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
