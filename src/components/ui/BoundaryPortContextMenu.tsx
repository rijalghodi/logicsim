import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";

interface BoundaryPortContextMenuProps {
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly onRename: () => void;
  readonly onDelete: () => void;
}

export function BoundaryPortContextMenu({ position, onClose, onRename, onDelete }: BoundaryPortContextMenuProps) {
  return (
    <div
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
      <DropdownMenu open={true} onOpenChange={(open) => !open && onClose()}>
        <DropdownMenuContent style={{ width: 120 }}>
          <DropdownMenuItem
            onClick={() => {
              onRename();
              onClose();
            }}
          >
            <span>RENAME</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            isDanger
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            <span>DELETE</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
