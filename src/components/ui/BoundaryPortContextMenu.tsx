import { useEffect, useRef } from "react";
import "./BoundaryPortContextMenu.css";

interface BoundaryPortContextMenuProps {
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly onDelete: () => void;
}

export function BoundaryPortContextMenu({
  position,
  onClose,
  onDelete,
}: BoundaryPortContextMenuProps) {
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
      document.addEventListener("contextmenu", handleClickOutside);
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
      className="boundary-port-context-menu"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <button
        type="button"
        className="boundary-port-context-menu-item boundary-port-context-menu-danger"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
      >
        Delete
      </button>
    </div>
  );
}
