import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu";

interface DockChipMenuProps {
  readonly children: React.ReactElement;
  readonly onOpen: () => void;
  readonly onRename: () => void;
}

export function DockChipMenu({ children, onOpen, onRename }: DockChipMenuProps) {
  return (
    <DropdownMenu triggerType="right">
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onOpen}>
          <span>OPEN</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRename}>
          <span>RENAME</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
