import { Modal, ModalBody, ModalDescription, ModalActions, ModalHeader, ModalTitle } from "./Modal";
import { useMemo } from "react";
import { useDeleteChipAlertStore } from "@/stores/deleteChipAlertStore";
import { useCircuitStore } from "@/stores/circuitStore";

export function DeleteChipAlert() {
  const { isOpen, chipId, close } = useDeleteChipAlertStore();
  const { savedChips, registry, deleteChips } = useCircuitStore();

  const chipsToDelete = useMemo(() => {
    if (!chipId) return [];
    return savedChips.filter((c) => c.id === chipId || registry.dependsOn(c.id, chipId));
  }, [chipId, savedChips, registry]);

  const targetChip = savedChips.find((c) => c.id === chipId);

  if (!isOpen || !chipId || !targetChip) return null;

  const handleConfirm = () => {
    deleteChips(chipsToDelete);
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeader>
        <ModalTitle>DELETE CHIP</ModalTitle>
        <ModalDescription>
          Are you sure you want to delete <strong style={{ color: "var(--fg)" }}>{targetChip.name}</strong>?
        </ModalDescription>
      </ModalHeader>

      <ModalBody>
        {chipsToDelete.length > 1 && (
          <div
            style={{
              background: "hsl(from var(--danger) h s l / 0.1)",
              padding: "12px",
              borderRadius: "8px",
              color: "var(--danger)",
              fontSize: "14px",
              lineHeight: 1.5,
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
          <button type="button" className="btn-secondary" onClick={close}>
            CANCEL
          </button>
          <button type="button" className="btn-danger" onClick={handleConfirm}>
            DELETE
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
