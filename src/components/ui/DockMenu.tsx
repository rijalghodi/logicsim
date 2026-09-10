import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "./DropdownMenu";

interface DockMenuProps {
  readonly onNew: () => void;
  readonly onSave: () => void;
}

export function DockMenu({ onNew, onSave }: DockMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="dock-btn dock-btn-menu" title="Circuit & Chip Actions">
          MENU
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onNew}>
          <span>NEW CHIP</span>
          <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSave}>
          <span>SAVE CHIP</span>
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
