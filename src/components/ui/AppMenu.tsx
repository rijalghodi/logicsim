import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "./DropdownMenu";
import { MenuIcon } from "./icons/MenuIcon";

interface AppMenuProps {
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly align?: "left" | "right";
}

export function AppMenu({ onNew, onSave, align = "left" }: AppMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="btn-secondary" title="Circuit & Chip Actions">
          <MenuIcon size={14} /> MENU
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
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
