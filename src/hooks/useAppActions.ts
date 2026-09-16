import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { modals } from "@/stores/modalStore";
import { useCircuitStore } from "@/stores/circuitStore";
import { CHIP_FILL } from "@/components/circuit/constants";

export function useAppActions(windowSize: { width: number; height: number }) {
  const store = useCircuitStore();
  const navigate = useNavigate();

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

  const handleSaveAsClick = useCallback(() => {
    const state = useCircuitStore.getState();
    if (!state.currentChipId) return;
    modals.open("save-chip", {
      chipId: state.currentChipId,
      saveAsNew: true,
      title: "SAVE AS",
      description: "Save a copy of this chip under a new name.",
    });
  }, []);

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

  // "Edit Chip" — only shown while viewing a dived-into (read-only) chip — makes the chip
  // currently being viewed the live editable canvas. Everything reached by diving in is
  // read-only and therefore never dirty; only the parent (viewStack[0], the leftmost
  // breadcrumb) can hold real unsaved edits, so that's the only thing worth checking or
  // saving here — children can't be saved and never need an unsaved-changes prompt.
  const handleEditReadOnlyChipClick = useCallback(() => {
    const state = useCircuitStore.getState();
    const childChipId = state.currentChipId;
    if (!childChipId) return;

    const openChild = () => useCircuitStore.getState().loadChipToCanvas(childChipId);
    const parentIsDirty = state.viewStack[0]?.isDirty ?? false;

    if (!parentIsDirty) {
      openChild();
      return;
    }

    modals.open("unsaved-alert", {
      onDiscard: openChild,
      onSave: () => {
        // Surface the parent as the live canvas first, so Save persists its data — not the
        // read-only child currently on screen.
        useCircuitStore.getState().executeBreadcrumbNavigation(0);
        handleSaveClick(openChild);
      },
    });
  }, [handleSaveClick]);

  // Everything reached by diving in is read-only and can never be dirty — only the parent
  // (viewStack[0], the leftmost breadcrumb, or the current level itself when not dived into
  // anything) can hold real unsaved edits, so that's the only thing Quit needs to check.
  const handleQuitClick = useCallback(() => {
    const state = useCircuitStore.getState();
    const isReadOnly = state.viewStack.length > 0;
    const parentIsDirty = isReadOnly ? !!state.viewStack[0]?.isDirty : state.isDirty;

    if (!parentIsDirty) {
      navigate("/");
      return;
    }

    modals.open("unsaved-alert", {
      onDiscard: () => {
        state.discardProjectChanges();
        navigate("/");
      },
      onSave: () => {
        // Surface the parent as the live canvas first, so Save persists its data — not
        // whatever read-only child currently happens to be on screen.
        if (isReadOnly) state.executeBreadcrumbNavigation(0);
        handleSaveClick(() => navigate("/"));
      },
    });
  }, [navigate, handleSaveClick]);

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
    handleSaveAsClick,
    handleNewClick,
    handleCustomizeClick,
    handleDeleteCurrentClick,
    handleOpenChipClick,
    handleEditReadOnlyChipClick,
    handleQuitClick,
    handleBreadcrumbClick,
    handleAddChipFreespace,
  };
}
