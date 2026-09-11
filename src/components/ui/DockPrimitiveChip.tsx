import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";
import { MoreVerticalIcon } from "./icons/MoreVerticalIcon";

interface DockPrimitiveChipProps {
  readonly chipType: string;
  readonly title: string;
  readonly onAddChip?: (chipType: string) => void;
  readonly onDragStart: (e: React.DragEvent, chipType: string) => void;
}

export function DockPrimitiveChip({ chipType, title, onAddChip, onDragStart }: DockPrimitiveChipProps) {
  return (
    <div className="dock-chip dock-chip-composite">
      <button
        type="button"
        className="dock-chip-main"
        draggable
        onDragStart={(e) => onDragStart(e, chipType)}
        onClick={() => onAddChip?.(chipType)}
        title={title}
      >
        <span>{chipType}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button type="button" className="dock-chip-menu-btn" aria-label="Chip Options">
            <MoreVerticalIcon size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent style={{ width: 120 }}>
          <DropdownMenuItem onClick={() => onAddChip?.(chipType)}>
            <span>PLACE</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
