import { useCallback } from "react";
import { modals } from "@/stores/modalStore";
import { useCircuitStore } from "@/stores/circuitStore";
import { CHIP_FILL } from "@/components/circuit/constants";

export function useAppActions(windowSize: { width: number; height: number }) {
  const store = useCircuitStore();

  // Reads fresh state via getState() rather than the closured `store` — this gets called
  // repeatedly mid-sequence by handleBreadcrumbClick's level-by-level close, where the
  // active chip changes between calls faster than this hook re-renders.
  const handleSaveClick = useCallback((onSaved?: () => void) => {
    const state = useCircuitStore.getState();
    if (state.currentChipId) {
      const chipDef = state.savedChips.find((c) => c.id === state.currentChipId);
      state.saveCurrentChip({
        id: state.currentChipId,
        name: chipDef?.name || "",
        color: chipDef?.color || CHIP_FILL,
      });
      onSaved?.();
    } else {
      modals.open("save-chip", { chipId: null, onSaved });
    }
  }, []);

  const handleNewClick = useCallback(() => {
    if (store.isDirty && (store.circuit.components.length > 0 || store.circuit.connections.length > 0)) {
      modals.open("unsaved-alert", { onDiscard: () => store.resetToBlank(), onSave: handleSaveClick });
    } else {
      store.resetToBlank();
    }
  }, [store, handleSaveClick]);

  const handleCustomizeClick = useCallback(() => {
    if (store.currentChipId) {
      modals.open("save-chip", { chipId: store.currentChipId });
    }
  }, [store.currentChipId]);

  const handleDeleteCurrentClick = useCallback(() => {
    if (store.currentChipId) {
      modals.open("delete-chip", { chipId: store.currentChipId });
    }
  }, [store]);

  const handleOpenChipClick = useCallback(
    (chipId: string) => {
      if (store.isDirty && (store.circuit.components.length > 0 || store.circuit.connections.length > 0)) {
        modals.open("unsaved-alert", {
          onDiscard: () => store.loadChipToCanvas(chipId),
          onSave: handleSaveClick,
        });
      } else {
        store.loadChipToCanvas(chipId);
      }
    },
    [store, handleSaveClick],
  );

  // Jumping to a breadcrumb `index` can skip several dived-into levels at once. Rather than one
  // combined check, close them one at a time — from the current (deepest) level up toward the
  // target — prompting for each dirty level individually, the same way closing several unsaved
  // documents one by one would. Each step reads getState() fresh since the active level changes
  // between steps faster than this hook re-renders.
  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      const closeNextLevel = () => {
        const state = useCircuitStore.getState();
        const currentDepth = state.viewStack.length;
        if (currentDepth <= index) return; // reached (or already at) the target level

        const parentIndex = currentDepth - 1; // one level up: the immediate parent
        const proceed = () => {
          useCircuitStore.getState().executeBreadcrumbNavigation(parentIndex);
          closeNextLevel();
        };

        if (state.isDirty) {
          modals.open("unsaved-alert", { onDiscard: proceed, onSave: () => handleSaveClick(proceed) });
        } else {
          proceed();
        }
      };

      closeNextLevel();
    },
    [handleSaveClick],
  );

  const handleAddChipFreespace = useCallback(
    (chipType: string) => {
      const cx = Math.round(windowSize.width / 2 - 60);
      const cy = Math.round(windowSize.height / 2 - 40);

      if (chipType === "IN" || chipType === "OUT") {
        const ports = chipType === "IN" ? store.boundary.inputs : store.boundary.outputs;

        let lowestY = 16 + 40; // PADDING_TOP + 40
        if (ports.length > 0) {
          let maxLayoutY = 0;
          ports.forEach((p, index) => {
            let offset = 0;
            if (index % 2 === 1) {
              offset = Math.ceil(index / 2) * 60;
            } else if (index > 0) {
              offset = -Math.ceil(index / 2) * 60;
            }
            const centerY = (windowSize.height - 16 - 56) / 2 + 16;
            const fallbackY = centerY + offset;

            const y = store.boundaryLayout[p.id] ?? fallbackY;
            if (y > maxLayoutY) {
              maxLayoutY = y;
            }
          });

          if (maxLayoutY >= lowestY) {
            lowestY = maxLayoutY + 60; // SPACING
          }
        }

        // If it fits on the screen, place it on the edge
        if (lowestY <= windowSize.height - 60) {
          store.dropChip(chipType, { x: 0, y: lowestY });
          return;
        }

        // If it doesn't fit, pick a random Y on the edge
        const isPortOccupied = (testY: number) => {
          return ports.some((p, index) => {
            let offset = 0;
            if (index % 2 === 1) {
              offset = Math.ceil(index / 2) * 60;
            } else if (index > 0) {
              offset = -Math.ceil(index / 2) * 60;
            }
            const centerY = (windowSize.height - 16 - 56) / 2 + 16;
            const fallbackY = centerY + offset;

            const py = store.boundaryLayout[p.id] ?? fallbackY;
            return Math.abs(py - testY) < 40; // 40px clearance
          });
        };

        let randomY: number;
        let attempts = 0;
        do {
          const minY = 56;
          const maxY = windowSize.height - 60;
          randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
          attempts++;
        } while (isPortOccupied(randomY) && attempts < 100);

        store.dropChip(chipType, { x: 0, y: randomY });
        return;
      }

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
    handleSaveClick: handleSaveClick,
    handleNewClick,
    handleCustomizeClick,
    handleDeleteCurrentClick,
    handleOpenChipClick,
    handleBreadcrumbClick,
    handleAddChipFreespace,
  };
}
