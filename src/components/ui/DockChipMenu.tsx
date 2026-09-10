import type { GateDefinition } from "../../core";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";

interface DockChipMenuProps {
  readonly gate: GateDefinition;
  readonly onAddGate?: (gateId: string) => void;
  readonly onDragStart: (e: React.DragEvent, gateId: string) => void;
  readonly onOpen: () => void;
  readonly onRename: () => void;
}

export function DockChipMenu({ gate, onAddGate, onDragStart, onOpen, onRename }: DockChipMenuProps) {
  return (
    <div className="gate-chip gate-chip-composite">
      <button
        type="button"
        className="gate-chip-main"
        draggable
        onDragStart={(e) => onDragStart(e, gate.id)}
        onClick={() => onAddGate?.(gate.id)}
        title={`${gate.name}: Drag to canvas or click to add`}
      >
        <span>{gate.name}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <button type="button" className="gate-chip-menu-btn" aria-label="Chip Options">
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
