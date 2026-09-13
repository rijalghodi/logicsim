import { useCircuitStore } from "@/stores/circuitStore";
import { ModalActions } from "./Modal";
import type { ModalProps } from "@/stores/modalStore";
import { modals } from "@/stores/modalStore";
import { useMemo } from "react";
import Button from "./Button";

export const UnsavedAlert = ({ payload }: ModalProps<{ chipIdToOpen: string | null }>) => {
  const { savedChips, loadChipToCanvas, resetToBlank } = useCircuitStore();

  const chip = useMemo(() => savedChips.find((c) => c.id === payload.chipIdToOpen), [savedChips, payload.chipIdToOpen]);

  const handleDiscard = () => {
    modals.close();
    if (payload.chipIdToOpen) {
      loadChipToCanvas(payload.chipIdToOpen);
    } else {
      resetToBlank();
    }
  };

  const handleSave = () => {
    modals.close();
    modals.open("save-chip", {
      title: payload.chipIdToOpen ? "CUSTOMIZE CHIP" : "SAVE CHIP",
      description: "Enter a name and color for the chip.",
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
        <Button type="button" variant="secondary" onClick={() => modals.close()}>
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
