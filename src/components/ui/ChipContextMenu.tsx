import { useEffect, useRef } from "react";

interface ChipContextMenuProps {
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly onRemove: () => void;
}

export function ChipContextMenu({ position, onClose, onOpen, onRemove }: ChipContextMenuProps) {
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
      className="dropdown"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 1000,
        width: 120,
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // prevent native menu on the custom menu itself
      }}
    >
      <button
        type="button"
        className="dropdown-item"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
          onClose();
        }}
      >
        VIEW
      </button>
      <button
        type="button"
        className="dropdown-item dropdown-item-danger"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
          onClose();
        }}
      >
        REMOVE
      </button>
    </div>
  );
}
