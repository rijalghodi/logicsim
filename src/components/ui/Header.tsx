import { Breadcrumbs } from "./Breadcrumbs";
import { AppMenu } from "./AppMenu";
import { useCircuitStore, useCurrentChip } from "@/stores/circuitStore";
import { useMemo } from "react";
import "./Header.css";

export interface HeaderProps {
  readonly onNavigateBreadcrumb: (index: number) => void;
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onCustomize: () => void;
  readonly onDelete: () => void;
  readonly onPreferences: () => void;
  readonly onQuit: () => void;
  readonly isSaved: boolean;
}

export function Header({
  onNavigateBreadcrumb,
  onNew,
  onSave,
  onCustomize,
  onDelete,
  onPreferences,
  onQuit,
  isSaved,
}: HeaderProps) {
  const store = useCircuitStore();
  const currentChip = useCurrentChip();

  const breadcrumbItems = useMemo(() => {
    const items = store.viewStack.map((state, i) => {
      // In viewStack, state corresponds to a saved chip, so we find it to get the name
      const chip = store.savedChips.find((c) => c.id === state.currentChipId);
      return {
        id: `stack-${i}`,
        name: chip?.name ?? "Untitled",
        isDirty: state.isDirty,
      };
    });
    items.push({
      id: "current",
      name: currentChip?.name ?? "Untitled",
      isDirty: store.isDirty,
    });
    return items;
  }, [store.viewStack, store.savedChips, currentChip, store.isDirty]);

  return (
    <header className="header-container">
      <AppMenu
        onNew={onNew}
        onSave={onSave}
        onCustomize={onCustomize}
        onDelete={onDelete}
        onPreferences={onPreferences}
        onQuit={onQuit}
        isSaved={isSaved}
      />
      <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigateBreadcrumb} />
    </header>
  );
}
