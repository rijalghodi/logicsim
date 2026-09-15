import { useMemo, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
} from "./DropdownMenu";
import { MenuIcon } from "./icons/MenuIcon";
import Button from "./Button";

interface AppMenuProps {
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onSaveAs: () => void;
  readonly onCustomize: () => void;
  readonly onDelete: () => void;
  readonly onEditReadOnlyChip: () => void;
  readonly onPreferences: () => void;
  readonly onQuit: () => void;
  readonly isSaved: boolean;
  /** True while viewing a dived-into (read-only) chip — see Header's isReadOnly. Narrows the
   * menu to only what's meaningful for a read-only view: editing it for real, preferences, quit. */
  readonly isReadOnly: boolean;
  readonly align?: "left" | "right";
}

export function AppMenu({
  onNew,
  onSave,
  onSaveAs,
  onCustomize,
  onDelete,
  onEditReadOnlyChip,
  onPreferences,
  onQuit,
  isSaved,
  isReadOnly,
  align = "left",
}: AppMenuProps) {
  const menuItems = useMemo(
    () =>
      isReadOnly
        ? [
            { label: "NEW CHIP", key: "k", displayKey: "⌘ K", action: onNew, show: true },
            { label: "EDIT CHIP", key: "e", displayKey: "⌘ E", action: onEditReadOnlyChip, show: true },
            {
              label: "PREFERENCES",
              key: ",",
              displayKey: "⌘ ,",
              action: onPreferences,
              show: true,
              separatorOnTop: true,
            },
            { label: "QUIT PROJECT", key: "q", displayKey: "⌘ Q", action: onQuit, show: true },
          ]
        : [
            { label: "NEW CHIP", key: "k", displayKey: "⌘ K", action: onNew, show: true },
            { label: "SAVE CHIP", key: "s", displayKey: "⌘ S", action: onSave, show: true },
            { label: "SAVE AS", key: "s", shiftKey: true, displayKey: "⌘ ⇧ S", action: onSaveAs, show: isSaved },
            { label: "CUSTOMIZE", key: "e", displayKey: "⌘ E", action: onCustomize, show: isSaved },
            {
              label: "DELETE CHIP",
              key: "backspace",
              shiftKey: true,
              displayKey: "⌘ ⇧ ⌫",
              action: onDelete,
              show: isSaved,
              isDanger: true,
            },
            {
              label: "PREFERENCES",
              key: ",",
              displayKey: "⌘ ,",
              action: onPreferences,
              show: true,
              separatorOnTop: true,
            },
            { label: "QUIT PROJECT", key: "q", displayKey: "⌘ Q", action: onQuit, show: true },
          ],
    [isReadOnly, onNew, onSave, onSaveAs, onCustomize, onDelete, onEditReadOnlyChip, onPreferences, onQuit, isSaved],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      const pressedKey = e.key.toLowerCase();
      const item = menuItems.find((i) => i.key === pressedKey && !!i.shiftKey === e.shiftKey);

      if (item && item.show) {
        e.preventDefault();
        item.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuItems]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button type="button" variant="primary" title="Circuit & Chip Actions">
          <MenuIcon size={14} /> MENU
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <div key={item.label}>
              {item.separatorOnTop && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={item.action} isDanger={item.isDanger}>
                <span>{item.label}</span>
                <DropdownMenuShortcut>{item.displayKey}</DropdownMenuShortcut>
              </DropdownMenuItem>
            </div>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
