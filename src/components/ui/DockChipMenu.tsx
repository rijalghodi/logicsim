import type { ChipDefinition } from "../../core";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";
import { MoreVerticalIcon } from "./icons/MoreVerticalIcon";

interface DockChipMenuProps {
  readonly chip: ChipDefinition;
  readonly isDisabled?: boolean;
  readonly onAddChip?: (chipId: string) => void;
  readonly onDragStart: (e: React.DragEvent, chipId: string) => void;
  readonly onOpen: () => void;
  readonly onRename: () => void;
  readonly onDelete: () => void;
}

export function DockChipMenu({
  chip,
  isDisabled,
  onAddChip,
  onDragStart,
  onOpen,
  onRename,
  onDelete,
}: DockChipMenuProps) {
  return (
    <div className="dock-chip dock-chip-composite">
      <button
        type="button"
        className="dock-chip-main"
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
          <button type="button" className="dock-chip-menu-btn" aria-label="Chip Options">
            <MoreVerticalIcon size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onOpen}>
            <span>OPEN</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRename}>
            <span>RENAME</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} isDanger>
            <span>DELETE CHIP</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
