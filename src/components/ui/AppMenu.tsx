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
          <span>NEW CHIP</span>
          <DropdownMenuShortcut>⌘ K</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSave}>
          <span>SAVE CHIP</span>
          <DropdownMenuShortcut>⌘ S</DropdownMenuShortcut>
        </DropdownMenuItem>
        {isSaved && (
          <>
            <DropdownMenuItem onClick={onCustomize}>
              <span>CUSTOMIZE</span>
              <DropdownMenuShortcut>⌘ E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} isDanger>
              <span>DELETE CHIP</span>
              <DropdownMenuShortcut>⌘ ⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
