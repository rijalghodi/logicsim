import { Breadcrumbs } from "./Breadcrumbs";
import { AppMenu } from "./AppMenu";
import { useCircuitStore, useCurrentChip } from "@/stores/circuitStore";
import { useMemo } from "react";
import "./Header.css";

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
      <div className="flex flex-row gap-4 items-center">
        {isReadOnly ? (
          <AppMenu
            mode="readOnly"
            onNew={onNew}
            onEditChip={onEditReadOnlyChip}
            onBackToParent={() => onNavigateBreadcrumb(0)}
            onPreferences={onPreferences}
            onQuit={onQuit}
          />
        ) : (
          <AppMenu
            mode="edit"
            onNew={onNew}
            onSave={onSave}
            onSaveAs={onSaveAs}
            onCustomize={onCustomize}
            onDelete={onDelete}
            onPreferences={onPreferences}
            onQuit={onQuit}
            isSaved={isSaved}
          />
        )}
        <div className="flex items-center gap-1">
          <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigateBreadcrumb} />
          {isReadOnly && (
            <span
              className="header-readonly-badge"
              title="Viewing this chip's internals — open it from the menu to edit"
            >
              READ-ONLY
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
