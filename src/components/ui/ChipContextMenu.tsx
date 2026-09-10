import { useEffect, useRef } from "react";
import "./ChipContextMenu.css";

interface ChipContextMenuProps {
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly onRemove: () => void;
}

export function ChipContextMenu({ position, onClose, onRemove }: ChipContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use a slight delay before attaching so the right-click event itself doesn't trigger a close
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("contextmenu", handleClickOutside); // also dismiss on other right clicks
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="chip-context-menu"
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
      <button
        type="button"
        className="chip-context-menu-item chip-context-menu-danger"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
          onClose();
        }}
      >
        Remove
      </button>
    </div>
  );
}
