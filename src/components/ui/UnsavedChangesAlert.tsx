import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalActions } from "./Modal";

interface UnsavedChangesAlertProps {
  readonly isOpen: boolean;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
  readonly onCancel: () => void;
}

export function UnsavedChangesAlert({ isOpen, onSave, onDiscard, onCancel }: UnsavedChangesAlertProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>
        <ModalTitle>Unsaved Changes</ModalTitle>
        <ModalDescription>
          The current circuit has unsaved changes. Do you want to save this circuit as a chip before opening a new one,
          or discard changes?
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        <ModalActions>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onDiscard}>
            Discard
          </button>
          <button type="button" className="btn-primary" onClick={onSave}>
            Save
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
