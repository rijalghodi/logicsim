import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";

interface ChipMenuProps {
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly onOpen: () => void;
  readonly onRemove: () => void;
}

export function ChipMenu({ position, onClose, onOpen, onRemove }: ChipMenuProps) {
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
          </DropdownMenuItem>
          <DropdownMenuItem
            isDanger
            onClick={() => {
              onRemove();
              onClose();
            }}
          >
            <span>REMOVE</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
