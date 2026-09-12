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
  readonly onCustomize: () => void;
  readonly onDelete: () => void;
  readonly isSaved: boolean;
  readonly align?: "left" | "right";
}

export function AppMenu({ onNew, onSave, onCustomize, onDelete, isSaved, align = "left" }: AppMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="btn-primary" title="Circuit & Chip Actions">
          <MenuIcon size={14} /> MENU
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={onNew}>
          <span>CREATE NEW</span>
          <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSave}>
          <span>SAVE CHIP</span>
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>
        {isSaved && (
          <>
            <DropdownMenuItem onClick={onCustomize}>
              <span>CUSTOMIZE</span>
              <DropdownMenuShortcut>Ctrl+E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} isDanger>
              <span>DELETE</span>
              <DropdownMenuShortcut>Ctrl+Del</DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
