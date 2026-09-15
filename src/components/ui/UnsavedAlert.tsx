import { useCircuitStore } from "@/stores/circuitStore";
import { ModalActions } from "./Modal";
import type { ModalContextProps } from "@/stores/modalStore";
import { useMemo } from "react";
import Button from "./Button";

export const UnsavedAlert = ({
  payload,
  closeModal,
}: ModalContextProps<{ onDiscard: () => void; onSave: () => void }>) => {
  const { currentChipId, viewStack, savedChips } = useCircuitStore();

  // Everything reached by diving in is read-only and can never be dirty — only the parent
  // (viewStack[0], the leftmost breadcrumb) can ever be what this alert is actually about, so
  // name that chip rather than whatever read-only child happens to be on screen right now.
  const parentChipId = viewStack.length > 0 ? viewStack[0].currentChipId : currentChipId;
  const chip = useMemo(() => savedChips.find((c) => c.id === parentChipId), [savedChips, parentChipId]);

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
