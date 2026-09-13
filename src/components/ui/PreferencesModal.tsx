import type { CSSProperties } from "react";
import { ModalActions } from "./Modal";
import { Switch } from "./Switch";
import { type ModalContextProps } from "@/stores/modalStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";
import Button from "./Button";

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
};

export const PreferencesModal = ({ closeModal }: ModalContextProps<object>) => {
  const { showGrid, showPortLabel, setShowGrid, setShowPortLabel } = useUserPreferencesStore();

  return (
    <>
      <div style={rowStyle}>
        <span>SHOW GRID</span>
        <Switch checked={showGrid} onChange={setShowGrid} aria-label="Show grid" />
      </div>

      <div style={rowStyle}>
        <span>SHOW PORT LABELS</span>
        <Switch checked={showPortLabel} onChange={setShowPortLabel} aria-label="Show port labels" />
      </div>

      <ModalActions>
        <Button type="button" variant="primary" onClick={closeModal}>
          DONE
        </Button>
      </ModalActions>
    </>
  );
};
