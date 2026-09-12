import { useCircuitStore } from "@/stores/circuitStore";
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalActions } from "./Modal";
import { useUnsavedAlertStore } from "@/stores/unsavedAlertStore";
import { useMemo } from "react";

export function UnsavedAlert({
  onSave,
  onDiscard,
}: {
  onSave: (chipId?: string | null) => void;
  onDiscard: (chipId?: string | null) => void;
}) {
  const { isOpen, close, chipId } = useUnsavedAlertStore();
  const { savedChips } = useCircuitStore();

  const chip = useMemo(() => savedChips.find((c) => c.id === chipId), [savedChips, chipId]);

  if (!isOpen) return null;

  const handleCancel = () => close();

  const handleDiscard = () => {
    onDiscard(chipId);
    close();
  };

  const handleSave = () => {
    onSave(chipId);
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
