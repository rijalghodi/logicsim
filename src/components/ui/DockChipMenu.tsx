import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";
import { MoreVerticalIcon } from "./icons/MoreVerticalIcon";
import type { SavedChip } from "@/storage/chipStorage";

interface DockChipMenuProps {
  readonly chip: SavedChip;
  readonly isDisabled?: boolean;
  readonly onAddChip?: (chipId: string) => void;
  readonly onDragStart: (e: React.DragEvent, chipId: string) => void;
  readonly onOpen: () => void;
  readonly onDelete: () => void;
}

export function DockChipMenu({ chip, isDisabled, onAddChip, onDragStart, onOpen, onDelete }: DockChipMenuProps) {
  return (
    <div className="dock-chip dock-chip-composite">
      <button
        type="button"
        className="dock-chip-main"
        disabled={isDisabled}
        draggable={!isDisabled}
        style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? "not-allowed" : "grab" }}
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
            <MoreVerticalIcon size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent style={{ width: 120 }}>
          {!isDisabled && (
            <DropdownMenuItem onClick={() => onAddChip?.(chip.id)}>
              <span>PLACE</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onOpen}>
            <span>VIEW</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} isDanger>
            <span>DELETE</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
