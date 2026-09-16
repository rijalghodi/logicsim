import { Breadcrumbs } from "./Breadcrumbs";
import { AppMenu } from "./AppMenu";
import { useCircuitStore, useCurrentChip } from "@/stores/circuitStore";
import { useMemo } from "react";
import "./Header.css";
import Button from "./Button";

export interface HeaderProps {
  readonly onNavigateBreadcrumb: (index: number) => void;
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onSaveAs: () => void;
  readonly onCustomize: () => void;
  readonly onDelete: () => void;
  readonly onEditReadOnlyChip: () => void;
  readonly onPreferences: () => void;
  readonly onQuit: () => void;
  readonly isSaved: boolean;
}

export function Header({
  onNavigateBreadcrumb,
  onNew,
  onSave,
  onSaveAs,
  onCustomize,
  onDelete,
  onEditReadOnlyChip,
  onPreferences,
  onQuit,
  isSaved,
}: HeaderProps) {
  const store = useCircuitStore();
  const currentChip = useCurrentChip();
  const isReadOnly = store.viewStack.length > 0;

  const breadcrumbItems = useMemo(() => {
    const items = store.viewStack.map((state, i) => {
      // In viewStack, state corresponds to a saved chip, so we find it to get the name
      const chip = store.savedChips.find((c) => c.id === state.currentChipId);
      return {
        id: `stack-${i}`,
        name: chip?.name ?? "Untitled",
        unsaved: state.isDirty,
      };
    });
    items.push({
      id: "current",
      name: currentChip?.name ?? "Untitled",
      unsaved: store.isDirty,
    });
    return items;
  }, [store.viewStack, store.savedChips, currentChip, store.isDirty]);

  return (
    <header className="header-container flex flex-row justify-between items-center">
      <div className="flex flex-row gap-2 items-center">
        {!isReadOnly && (
          <AppMenu
            onNew={onNew}
            onSave={onSave}
            onSaveAs={onSaveAs}
            onCustomize={onCustomize}
            onDelete={onDelete}
            onEditReadOnlyChip={onEditReadOnlyChip}
            onPreferences={onPreferences}
            onQuit={onQuit}
            isSaved={isSaved}
            isReadOnly={isReadOnly}
          />
        )}

        <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigateBreadcrumb} />

        {isReadOnly && (
          <span className="header-readonly-badge" title="Viewing this chip's internals — open it from the dock to edit">
            READ-ONLY
          </span>
        )}
      </div>
      {isReadOnly && (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onEditReadOnlyChip}>
            EDIT CHIP
          </Button>
          <Button variant="primary" onClick={() => onNavigateBreadcrumb(breadcrumbItems.length - 2)}>
            BACK TO PARENT
          </Button>
        </div>
      )}
    </header>
  );
}
