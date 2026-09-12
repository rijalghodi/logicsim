import { useCallback } from "react";
import { saveChipModal } from "@/stores/saveChipModalStore";
import { unsavedAlert } from "@/stores/unsavedAlertStore";
import { deleteChipAlert } from "@/stores/deleteChipAlertStore";
import { useCircuitStore } from "@/stores/circuitStore";
import { CHIP_FILL } from "@/components/circuit/colors";

export function useAppActions(windowSize: { width: number; height: number }) {
  const store = useCircuitStore();

  const handleSaveClick = useCallback(() => {
    if (store.currentChipId) {
      const chipDef = store.savedChips.find((c) => c.id === store.currentChipId);
      store.saveCurrentChip({
        id: store.currentChipId,
        name: chipDef?.name || "",
        color: chipDef?.color || CHIP_FILL,
      });
    } else {
      saveChipModal.open(null);
    }
  }, [store]);

  const handleNewClick = useCallback(() => {
    if (store.isDirty && (store.circuit.components.length > 0 || store.circuit.connections.length > 0)) {
      unsavedAlert.open(null);
    } else {
      store.resetToBlank();
    }
  }, [store]);

  const handleCustomizeClick = useCallback(() => {
    if (store.currentChipId) {
      saveChipModal.open(store.currentChipId);
    }
  }, [store.currentChipId]);

  const handleDeleteCurrentClick = useCallback(() => {
    if (store.currentChipId) {
      deleteChipAlert.open(store.currentChipId);
    }
  }, [store]);

  const handleOpenChipClick = useCallback(
    (chipId: string) => {
      if (store.isDirty && (store.circuit.components.length > 0 || store.circuit.connections.length > 0)) {
        unsavedAlert.open(chipId);
      } else {
        store.loadChipToCanvas(chipId);
      }
    },
    [store],
  );

  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      if (store.isDirty && store.currentChipId) {
        unsavedAlert.open(store.currentChipId);
      } else {
        store.executeBreadcrumbNavigation(index);
      }
    },
    [store],
  );

  const handleDiscardChanges = useCallback(
    (chipIdToOpen?: string | null) => {
      unsavedAlert.close();
      if (chipIdToOpen) {
        store.loadChipToCanvas(chipIdToOpen);
      } else {
        store.resetToBlank();
      }
    },
    [store],
  );

  const handleAddChipFreespace = useCallback(
    (chipType: string) => {
      const cx = Math.round(windowSize.width / 2 - 60);
      const cy = Math.round(windowSize.height / 2 - 40);

      const isOccupied = (x: number, y: number) => {
        return Object.values(store.layout).some((pos) => Math.abs(pos.x - x) < 5 && Math.abs(pos.y - y) < 5);
      };

      const ARCH_STEP = 40;
      let finalX = cx;
      let finalY = cy;

      if (isOccupied(cx, cy)) {
        let found = false;
        for (let r = ARCH_STEP; r < 2000; r += ARCH_STEP) {
          const dTheta = ARCH_STEP / r;
          const startTheta = Math.PI / 4; // 45 degree

          for (let theta = startTheta; theta < startTheta + 2 * Math.PI; theta += dTheta) {
            const px = Math.round(cx + r * Math.cos(theta));
            const py = Math.round(cy + r * Math.sin(theta));

            if (!isOccupied(px, py)) {
              finalX = px;
              finalY = py;
              found = true;
              break;
            }
          }

          if (found) {
            break;
          }
        }
      }

      store.dropChip(chipType, { x: finalX, y: finalY });
    },
    [store, windowSize],
  );

  return {
    handleSaveClick,
    handleNewClick,
    handleCustomizeClick,
    handleDeleteCurrentClick,
    handleOpenChipClick,
    handleBreadcrumbClick,
    handleDiscardChanges,
    handleAddChipFreespace,
  };
}
