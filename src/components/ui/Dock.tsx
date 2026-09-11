import "./Dock.css";
import { DockChipMenu } from "./DockChipMenu";
import type { ChipDefinition } from "../../core";

interface DockProps {
  readonly savedChips: readonly ChipDefinition[];
  readonly disabledChipIds?: Set<string>;
  readonly onAddChip?: (chipType: string) => void;
  readonly onOpenChip?: (chipId: string) => void;
  readonly onRenameChip?: (chipId: string) => void;
  readonly onDeleteChip?: (chipId: string) => void;
}

export function Dock({
  savedChips,
  disabledChipIds = new Set(),
  onAddChip,
  onOpenChip,
  onRenameChip,
  onDeleteChip,
}: DockProps) {
  const handleDragStart = (e: React.DragEvent, chipType: string) => {
    e.dataTransfer.setData("application/logicsim-chip", chipType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="dock-container">

      {/* Input / Output Primitives */}
      <button
        type="button"
        className="dock-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "IN")}
        onClick={() => onAddChip?.("IN")}
        title="Input Port: Drag to left edge or click to add"
      >
        <span>IN</span>
      </button>

      <button
        type="button"
        className="dock-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "OUT")}
        onClick={() => onAddChip?.("OUT")}
        title="Output Port: Drag to right edge or click to add"
      >
        <span>OUT</span>
      </button>

      {/* NAND Primitive Chip */}
      <button
        type="button"
        className="dock-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "NAND")}
        onClick={() => onAddChip?.("NAND")}
        title="NAND Chip: Drag to canvas or click to add"
      >
        <span>NAND</span>
      </button>

      {/* User-created Custom Chips */}
      {savedChips.map((chip) => {
        const isDisabled = disabledChipIds.has(chip.id);
        return (
          <DockChipMenu
            key={chip.id}
            chip={chip}
            isDisabled={isDisabled}
            onAddChip={onAddChip}
            onDragStart={handleDragStart}
            onOpen={() => onOpenChip?.(chip.id)}
            onRename={() => onRenameChip?.(chip.id)}
            onDelete={() => onDeleteChip?.(chip.id)}
          />
        );
      })}
    </div>
  );
}
