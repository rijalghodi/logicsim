import { ModalActions } from "./Modal";
import { useMemo } from "react";
import type { ModalProps } from "@/stores/modalStore";
import { modals } from "@/stores/modalStore";
import { useCircuitStore } from "@/stores/circuitStore";

export const DeleteChipAlert = ({ payload }: ModalProps<{ chipId: string }>) => {
  const { savedChips, registry, deleteChips } = useCircuitStore();

  const chipsToDelete = useMemo(() => {
    return savedChips.filter((c) => c.id === payload.chipId || registry.dependsOn(c.id, payload.chipId));
  }, [payload.chipId, savedChips, registry]);

  const targetChip = savedChips.find((c) => c.id === payload.chipId);

  if (!targetChip) return null;

  const handleConfirm = () => {
    deleteChips(chipsToDelete);
    // TODO: load empty circuit
    modals.close();
  };

  return (
    <>
      <p>
        Are you sure you want to delete <strong style={{ color: "var(--fg)" }}>{targetChip.name}</strong>?
      </p>

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
              .filter((c) => c.id !== payload.chipId)
              .map((c) => (
                <li key={c.id}>{c.name}</li>
              ))}
          </ul>
        </div>
      )}

      <ModalActions>
        <button type="button" className="btn-secondary" onClick={() => modals.close()}>
          CANCEL
        </button>
        <button type="button" className="btn-danger" onClick={handleConfirm}>
          DELETE
        </button>
      </ModalActions>
    </>
  );
};
