import { useMemo, useState } from "react";
import "./Dock.css";
import { DockChipMenu } from "./DockChipMenu";
import { DockPrimitiveChip } from "./DockPrimitiveChip";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";
import { useCircuitStore } from "@/stores/circuitStore";

interface DockProps {
  readonly onAddChip?: (chipType: string) => void;
  readonly onOpenChip?: (chipId: string) => void;
  readonly onDeleteChip?: (chipId: string) => void;
}

export function Dock({ onAddChip, onOpenChip, onDeleteChip }: DockProps) {
  const { savedChips, currentChipId, registry } = useCircuitStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const disabledChipIds = useMemo(() => {
    const disabled = new Set<string>();
    if (currentChipId) {
      for (const chip of savedChips) {
        if (registry.dependsOn(chip.id, currentChipId)) {
          disabled.add(chip.id);
        }
      }
    }
    return disabled;
  }, [currentChipId, savedChips, registry]);

  const sortedChips = useMemo(() => [...savedChips].sort((a, b) => a.name.localeCompare(b.name)), [savedChips]);

  const handleDragStart = (e: React.DragEvent, chipType: string) => {
    e.dataTransfer.setData("application/logicsim-chip", chipType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className={`dock-container ${isExpanded ? "dock-container-expanded" : ""}`}>
      <div className="dock-chips">
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

        {/* User-created Custom Chips, sorted alphabetically by name */}
        {sortedChips.map((chip) => {
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

      <button
        type="button"
        className="dock-expand-btn"
        onClick={() => setIsExpanded((prev) => !prev)}
        title={isExpanded ? "Collapse dock" : "Expand dock"}
        aria-label={isExpanded ? "Collapse dock" : "Expand dock"}
      >
        <span style={{ display: "inline-flex", transform: `rotate(${isExpanded ? 90 : -90}deg)` }}>
          <ChevronRightIcon size={14} />
        </span>
      </button>
    </div>
  );
}
