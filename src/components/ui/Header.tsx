import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbItem } from "./Breadcrumbs";
import { AppMenu } from "./AppMenu";
import "./Header.css";

export interface HeaderProps {
  readonly breadcrumbItems: readonly BreadcrumbItem[];
  readonly onNavigateBreadcrumb: (index: number) => void;
  readonly onNew: () => void;
  readonly onSave: () => void;
}

export function Header({
  breadcrumbItems,
  onNavigateBreadcrumb,
  onNew,
  onSave,
}: HeaderProps) {
  return (
    <header className="header-container">
      <AppMenu onNew={onNew} onSave={onSave} />
      <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigateBreadcrumb} />
    </header>
  );
}
