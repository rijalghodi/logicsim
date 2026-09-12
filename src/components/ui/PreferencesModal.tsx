import type { CSSProperties } from "react";
import { Modal, ModalActions, ModalBody, ModalDescription, ModalHeader, ModalTitle } from "./Modal";
import { Switch } from "./Switch";
import { usePreferencesModalStore } from "@/stores/preferencesModalStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
};

export function PreferencesModal() {
  const { isOpen, close } = usePreferencesModalStore();
  const { showGrid, showPortLabel, setShowGrid, setShowPortLabel } = useUserPreferencesStore();

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeader>
        <ModalTitle>PREFERENCES</ModalTitle>
        <ModalDescription>Personalize how the canvas is displayed. Saved on this device.</ModalDescription>
      </ModalHeader>

      <ModalBody>
        <div style={rowStyle}>
          <span>SHOW GRID</span>
          <Switch checked={showGrid} onChange={setShowGrid} aria-label="Show grid" />
        </div>

        <div style={rowStyle}>
          <span>SHOW PORT LABELS</span>
          <Switch checked={showPortLabel} onChange={setShowPortLabel} aria-label="Show port labels" />
        </div>

        <ModalActions>
          <button type="button" className="btn-primary" onClick={close}>
            DONE
          </button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
