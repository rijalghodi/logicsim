import { useEffect, useRef, useState } from "react";
import type { GateDefinition } from "../../core";

interface DockProps {
  readonly savedGates: readonly GateDefinition[];
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onAddGate?: (gateType: string) => void;
}

export function Dock({ savedGates, onNew, onSave, onAddGate }: DockProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleDragStart = (e: React.DragEvent, gateType: string) => {
    e.dataTransfer.setData("application/logicsim-gate", gateType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="dock-container">
      {/* Menu dropdown trigger */}
      <div style={{ position: "relative" }} ref={menuRef}>
        <button
          type="button"
          className="dock-btn dock-btn-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
          title="Circuit & Gate Actions"
        >
          MENU
        </button>

        {menuOpen && (
          <div className="menu-dropdown">
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                onNew();
              }}
            >
              <span>NEW CHIP</span>
              <span className="dropdown-item-shortcut">Ctrl+N</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                onSave();
              }}
            >
              <span>Save CHIP</span>
              <span className="dropdown-item-shortcut">Ctrl+S</span>
            </button>
          </div>
        )}
      </div>

      {/* Input / Output Primitives */}
      <button
        type="button"
        className="gate-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "IN")}
        onClick={() => onAddGate?.("IN")}
        title="Input Port: Drag to left edge or click to add"
      >
        <span>IN</span>
      </button>

      <button
        type="button"
        className="gate-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "OUT")}
        onClick={() => onAddGate?.("OUT")}
        title="Output Port: Drag to right edge or click to add"
      >
        <span>OUT</span>
      </button>

      {/* NAND Primitive Chip */}
      <button
        type="button"
        className="gate-chip"
        draggable
        onDragStart={(e) => handleDragStart(e, "NAND")}
        onClick={() => onAddGate?.("NAND")}
        title="NAND Gate: Drag to canvas or click to add"
      >
        <span>NAND</span>
      </button>

      {/* User-created Custom Gates */}
      {savedGates.map((gate) => (
        <button
          key={gate.id}
          type="button"
          className="gate-chip"
          draggable
          onDragStart={(e) => handleDragStart(e, gate.id)}
          onClick={() => onAddGate?.(gate.id)}
          title={`${gate.name}: Drag to canvas or click to add`}
        >
          <span>{gate.name}</span>
        </button>
      ))}
    </div>
  );
}
