import { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut } from "./DropdownMenu";

export interface ContextMenuItem {
  readonly label: string;
  readonly onClick: () => void;
  readonly isDanger?: boolean;
  readonly shortcutKeys?: string[];
  readonly shortcutHint?: string;
}

export interface ContextMenuProps {
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly items: ContextMenuItem[];
}

export function ContextMenu({ position, onClose, items }: ContextMenuProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const item of items) {
        if (item.shortcutKeys?.includes(e.key)) {
          e.preventDefault();
          item.onClick();
          onClose();
          return;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, onClose]);

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // prevent native menu on the custom menu itself
      }}
    >
      <DropdownMenu open={true} onOpenChange={(open) => !open && onClose()}>
        <DropdownMenuContent style={{ width: 120 }}>
          {items.map((item, index) => (
            <DropdownMenuItem
              key={index}
              isDanger={item.isDanger}
              onClick={() => {
                item.onClick();
                onClose();
              }}
            >
              <span>{item.label}</span>
              {item.shortcutHint && <DropdownMenuShortcut>{item.shortcutHint}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
