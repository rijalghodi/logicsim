import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { AppMenu } from "./AppMenu";
import "./Header.css";

export interface HeaderProps {
  readonly breadcrumbItems: readonly BreadcrumbItem[];
  readonly onNavigateBreadcrumb: (index: number) => void;
  readonly onNew: () => void;
  readonly onSave: () => void;
  readonly onCustomize: () => void;
  readonly onDelete: () => void;
  readonly isSaved: boolean;
}

export function Header({
  breadcrumbItems,
  onNavigateBreadcrumb,
  onNew,
  onSave,
  onCustomize,
  onDelete,
  isSaved,
}: HeaderProps) {
  return (
    <header className="header-container">
      <AppMenu
        onNew={onNew}
        onSave={onSave}
        onCustomize={onCustomize}
        onDelete={onDelete}
        isSaved={isSaved}
      />
      <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigateBreadcrumb} />
    </header>
  );
}
