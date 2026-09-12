import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalActions } from "./Modal";
import { useUnsavedAlertStore } from "@/stores/unsavedAlertStore";

export function UnsavedAlert({
  onSave,
  onDiscard,
}: {
  onSave: (chipId?: string | null) => void;
  onDiscard: (chipId?: string | null) => void;
}) {
  const { isOpen, close, chipId } = useUnsavedAlertStore();

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
          The current circuit has unsaved changes. Do you want to save this circuit as a chip before opening a new one,
          or discard changes?
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
