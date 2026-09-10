import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import type { SavedChip } from "../../storage/chipStorage";
import type { ChipRegistry } from "../../core";
import { useMemo } from "react";

interface DeleteChipModalProps {
  readonly chipId: string | null;
  readonly savedChips: readonly SavedChip[];
  readonly registry: ChipRegistry;
  readonly onConfirm: (chipsToDelete: SavedChip[]) => void;
  readonly onClose: () => void;
}

export function DeleteChipModal({ chipId, savedChips, registry, onConfirm, onClose }: DeleteChipModalProps) {
  const chipsToDelete = useMemo(() => {
    if (!chipId) return [];
    return savedChips.filter((c) => c.id === chipId || registry.dependsOn(c.id, chipId));
  }, [chipId, savedChips, registry]);

  const targetChip = savedChips.find((c) => c.id === chipId);

  if (!chipId || !targetChip) return null;

  return (
    <Modal isOpen={!!chipId} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Delete Chip</ModalTitle>
        <ModalDescription>
          Are you sure you want to delete <strong style={{ color: "var(--fg)" }}>{targetChip.name}</strong>?
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        {chipsToDelete.length > 1 && (
          <div
            style={{
              background: "rgba(255, 0, 0, 0.1)",
              padding: "12px",
              borderRadius: "8px",
              color: "var(--danger)",
              fontSize: "14px",
              lineHeight: 1.5,
              marginBottom: "16px",
            }}
          >
            <strong>Warning:</strong> This will also delete {chipsToDelete.length - 1} other chip(s) that depend on it:
            <ul style={{ paddingLeft: "20px" }}>
              {chipsToDelete
                .filter((c) => c.id !== chipId)
                .map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
            </ul>
          </div>
        )}
        <p style={{ color: "var(--text)", fontSize: "14px" }}>This action cannot be undone.</p>

        <ModalActions>
          <button type="button" className="btn-secondary" onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: "var(--danger)", color: "var(--danger-fg)" }}
            onClick={() => onConfirm(chipsToDelete)}
          >
            DELETE
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
