import { useCircuitStore } from "@/stores/circuitStore";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalActions } from "./Modal";
import { useUnsavedAlertStore } from "@/stores/unsavedAlertStore";
import { useMemo } from "react";

export function UnsavedAlert({
  onSave,
  onDiscard,
}: {
  onSave: (chipIdToOpen: string | null) => void;
  onDiscard: (chipIdToOpen: string | null) => void;
}) {
  const { isOpen, close, chipIdToOpen } = useUnsavedAlertStore();
  const { savedChips } = useCircuitStore();

  const chip = useMemo(() => savedChips.find((c) => c.id === chipIdToOpen), [savedChips, chipIdToOpen]);

  if (!isOpen) return null;

  const handleCancel = () => close();

  const handleDiscard = () => {
    onDiscard(chipIdToOpen);
    close();
  };

  const handleSave = () => {
    onSave(chipIdToOpen);
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalHeader>
        <ModalTitle>UNSAVED CHANGES</ModalTitle>
        <ModalDescription>
          The <strong style={{ color: "var(--fg)" }}>{chip?.name ?? "Untitled"}</strong> circuit has unsaved changes. Do
          you want to save this circuit before proceeding?
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        <ModalActions>
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            CANCEL
          </button>
          <button type="button" className="btn-danger" onClick={handleDiscard}>
            DISCARD
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            SAVE
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
