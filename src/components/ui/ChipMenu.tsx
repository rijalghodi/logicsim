import { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut } from "./DropdownMenu";

interface ChipMenuProps {
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly onRemove: () => void;
}

export function ChipMenu({ position, onClose, onOpen, onRemove }: ChipMenuProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onRemove();
        onClose();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onOpen();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRemove, onOpen, onClose]);

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
          <DropdownMenuItem
            onClick={() => {
              onOpen();
              onClose();
            }}
          >
            <span>VIEW</span>
            <DropdownMenuShortcut>⏎</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            isDanger
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            <span>REMOVE</span>
            <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
