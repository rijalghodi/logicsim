import "./Dock.css";
import { DockChipMenu } from "./DockChipMenu";
import { DockPrimitiveChip } from "./DockPrimitiveChip";
import type { SavedChip } from "../../storage/chipStorage";

interface DockProps {
  readonly savedChips: readonly SavedChip[];
  readonly disabledChipIds?: Set<string>;
  readonly onAddChip?: (chipType: string) => void;
  readonly onOpenChip?: (chipId: string) => void;
  readonly onDeleteChip?: (chipId: string) => void;
}

export function Dock({ savedChips, disabledChipIds = new Set(), onAddChip, onOpenChip, onDeleteChip }: DockProps) {
  const handleDragStart = (e: React.DragEvent, chipType: string) => {
    e.dataTransfer.setData("application/logicsim-chip", chipType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="dock-container">
      {/* Input / Output Primitives */}
      <DockPrimitiveChip
        chipType="IN"
        title="Input Port: Drag to left edge or click to add"
        onAddChip={onAddChip}
        onDragStart={handleDragStart}
      />
      <DockPrimitiveChip
        chipType="OUT"
        title="Output Port: Drag to right edge or click to add"
        onAddChip={onAddChip}
        onDragStart={handleDragStart}
      />

      {/* NAND Primitive Chip */}
      <DockPrimitiveChip
        chipType="NAND"
        title="NAND Chip: Drag to canvas or click to add"
        onAddChip={onAddChip}
        onDragStart={handleDragStart}
      />

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
            onDelete={() => onDeleteChip?.(chip.id)}
          />
        );
      })}
    </div>
  );
}
