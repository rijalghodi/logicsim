import { DockMenu } from "./DockMenu";
import "./Dock.css";
import { DockChipMenu } from "./DockChipMenu";
import type { ChipDefinition } from "../../core";

interface DockProps {
  readonly savedChips: readonly ChipDefinition[];
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onAddChip?: (chipType: string) => void;
  readonly onOpenChip?: (chipId: string) => void;
  readonly onRenameChip?: (chipId: string) => void;
}

export function Dock({ savedChips, onNew, onSave, onAddChip, onOpenChip, onRenameChip }: DockProps) {
  const handleDragStart = (e: React.DragEvent, chipType: string) => {
    e.dataTransfer.setData("application/logicsim-chip", chipType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="dock-container">
      {/* Menu dropdown trigger */}
      <DockMenu onNew={onNew} onSave={onSave} />

      {/* Input / Output Primitives */}
      <button
        type="button"
        className="chip-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "IN")}
        onClick={() => onAddChip?.("IN")}
        title="Input Port: Drag to left edge or click to add"
      >
        <span>IN</span>
      </button>

      <button
        type="button"
        className="chip-chip"
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
        className="chip-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "NAND")}
        onClick={() => onAddChip?.("NAND")}
        title="NAND Chip: Drag to canvas or click to add"
      >
        <span>NAND</span>
      </button>

      {/* User-created Custom Chips */}
      {savedChips.map((chip) => (
        <DockChipMenu
          key={chip.id}
          chip={chip}
          onAddChip={onAddChip}
          onDragStart={handleDragStart}
          onOpen={() => onOpenChip?.(chip.id)}
          onRename={() => onRenameChip?.(chip.id)}
        />
      ))}
    </div>
  );
}
