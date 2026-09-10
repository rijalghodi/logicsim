import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "./DropdownMenu";
import { MenuIcon } from "./icons/MenuIcon";

interface DockMenuProps {
  readonly onNew: () => void;
  readonly onSave: () => void;
}

export function DockMenu({ onNew, onSave }: DockMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="dock-btn dock-btn-menu" title="Circuit & Chip Actions">
          <MenuIcon size={14} /> MENU
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
