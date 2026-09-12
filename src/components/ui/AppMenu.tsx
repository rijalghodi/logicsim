import { useMemo, useEffect } from "react";
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
  const menuItems = useMemo(
    () => [
      { label: "NEW CHIP", key: "k", displayKey: "⌘ K", action: onNew, show: true },
      { label: "SAVE CHIP", key: "s", displayKey: "⌘ S", action: onSave, show: true },
      { label: "CUSTOMIZE", key: "e", displayKey: "⌘ E", action: onCustomize, show: isSaved },
      { label: "DELETE CHIP", key: "backspace", displayKey: "⌘ ⌫", action: onDelete, show: isSaved, isDanger: true },
    ],
    [onNew, onSave, onCustomize, onDelete, isSaved]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      
      const pressedKey = e.key.toLowerCase();
      const item = menuItems.find((i) => i.key === pressedKey);
      
      if (item && item.show) {
        e.preventDefault();
        item.action();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuItems]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="btn-primary" title="Circuit & Chip Actions">
          <MenuIcon size={14} /> MENU
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <DropdownMenuItem key={item.label} onClick={item.action} isDanger={item.isDanger}>
              <span>{item.label}</span>
              <DropdownMenuShortcut>{item.displayKey}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
