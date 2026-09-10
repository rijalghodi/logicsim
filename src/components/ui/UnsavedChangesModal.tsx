interface UnsavedChangesModalProps {
  readonly isOpen: boolean;
  readonly onSave: () => void;
  readonly onDiscard: () => void;
  readonly onCancel: () => void;
}

export function UnsavedChangesModal({ isOpen, onSave, onDiscard, onCancel }: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Unsaved Changes</h3>
          <p className="modal-description">
            The current circuit has unsaved changes. Do you want to save this circuit as a gate before creating a new
            canvas, or discard changes?
          </p>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onDiscard}>
            Discard & New
          </button>
          <button type="button" className="btn-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
