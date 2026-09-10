import type { ChipDefinition } from "../../core";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";

interface DockChipMenuProps {
  readonly chip: ChipDefinition;
  readonly isDisabled?: boolean;
  readonly onAddChip?: (chipId: string) => void;
  readonly onDragStart: (e: React.DragEvent, chipId: string) => void;
  readonly onOpen: () => void;
  readonly onRename: () => void;
}

export function DockChipMenu({ chip, isDisabled, onAddChip, onDragStart, onOpen, onRename }: DockChipMenuProps) {
  return (
    <div className="chip-chip chip-chip-composite">
      <button
        type="button"
        className="chip-chip-main"
        disabled={isDisabled}
        draggable={!isDisabled}
        style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? "not-allowed" : "pointer" }}
        onDragStart={(e) => onDragStart(e, chip.id)}
        onClick={() => !isDisabled && onAddChip?.(chip.id)}
        title={
          isDisabled ? "Cannot add chip: circular dependency detected" : `${chip.name}: Drag to canvas or click to add`
        }
      >
        <span>{chip.name}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <button type="button" className="chip-chip-menu-btn" aria-label="Chip Options">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              <circle cx="12" cy="3" r="1.8" fill="currentColor" />
              <circle cx="12" cy="21" r="1.8" fill="currentColor" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onOpen}>
            <span>OPEN</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRename}>
            <span>RENAME</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
