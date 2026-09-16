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

interface EditModeProps {
  readonly mode: "edit";
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onSaveAs: () => void;
  readonly onCustomize: () => void;
  readonly onDelete: () => void;
  readonly onPreferences: () => void;
  readonly onQuit: () => void;
  readonly isSaved: boolean;
}

interface ReadOnlyModeProps {
  readonly mode: "readOnly";
  readonly onNew: () => void;
  /** Makes the currently-viewed (read-only) chip the live editable canvas. */
  readonly onEditChip: () => void;
  /** Jumps to the leftmost breadcrumb — the chip you were actually editing before diving in. */
  readonly onBackToParent: () => void;
  readonly onPreferences: () => void;
  readonly onQuit: () => void;
}

interface ExampleModeProps {
  readonly mode: "example";
  readonly onCopyToProject: () => void;
  readonly onPreferences: () => void;
  readonly onQuit: () => void;
}

type AppMenuProps = (EditModeProps | ReadOnlyModeProps | ExampleModeProps) & { readonly align?: "left" | "right" };

export function AppMenu(props: AppMenuProps) {
  const { align = "left" } = props;

  const menuItems = useMemo(() => {
    if (props.mode === "readOnly") {
      const { onNew, onEditChip, onBackToParent, onPreferences, onQuit } = props;
      return [
        { label: "NEW CHIP", key: "k", displayKey: "⌘ K", action: onNew, show: true },
        { label: "EDIT CHIP", key: "e", displayKey: "⌘ E", action: onEditChip, show: true },
        { label: "GO TO PARENT", key: "backspace", displayKey: "⌘ ⌫", action: onBackToParent, show: true },
        {
          label: "PREFERENCES",
          key: ",",
          displayKey: "⌘ ,",
          action: onPreferences,
          show: true,
          separatorOnTop: true,
        },
        { label: "QUIT PROJECT", key: "q", displayKey: "⌘ Q", action: onQuit, show: true },
      ];
    }

    if (props.mode === "example") {
      const { onCopyToProject, onPreferences, onQuit } = props;
      return [
        { label: "COPY EXAMPLE", key: "s", displayKey: "⌘ S", action: onCopyToProject, show: true },
        {
          label: "PREFERENCES",
          key: ",",
          displayKey: "⌘ ,",
          action: onPreferences,
          show: true,
          separatorOnTop: true,
        },
        { label: "QUIT EXAMPLE", key: "q", displayKey: "⌘ Q", action: onQuit, show: true },
      ];
    }

    const { onNew, onSave, onSaveAs, onCustomize, onDelete, onPreferences, onQuit, isSaved } = props;
    return [
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
      { label: "PREFERENCES", key: ",", displayKey: "⌘ ,", action: onPreferences, show: true, separatorOnTop: true },
      { label: "QUIT PROJECT", key: "q", displayKey: "⌘ Q", action: onQuit, show: true },
    ];
  }, [props]);

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
