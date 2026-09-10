import { DockMenu } from "./DockMenu";
import { DockChipMenu } from "./DockChipMenu";
import type { GateDefinition } from "../../core";

interface DockProps {
  readonly savedGates: readonly GateDefinition[];
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onAddGate?: (gateType: string) => void;
  readonly onOpenGate?: (gateId: string) => void;
  readonly onRenameGate?: (gateId: string) => void;
}

export function Dock({ savedGates, onNew, onSave, onAddGate, onOpenGate, onRenameGate }: DockProps) {
  const handleDragStart = (e: React.DragEvent, gateType: string) => {
    e.dataTransfer.setData("application/logicsim-gate", gateType);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="dock-container">
      {/* Menu dropdown trigger */}
      <DockMenu onNew={onNew} onSave={onSave} />

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
        <DockChipMenu key={gate.id} onOpen={() => onOpenGate?.(gate.id)} onRename={() => onRenameGate?.(gate.id)}>
          <button
            type="button"
            className="gate-chip"
            draggable
            onDragStart={(e) => handleDragStart(e, gate.id)}
            onClick={() => onAddGate?.(gate.id)}
            title={`${gate.name}: Drag to canvas or click to add`}
          >
            <span>{gate.name}</span>
          </button>
        </DockChipMenu>
      ))}
    </div>
  );
}
