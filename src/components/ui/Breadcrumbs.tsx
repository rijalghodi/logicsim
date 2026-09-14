import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./DropdownMenu";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";
import { MoreHorizontalIcon } from "./icons/MoreHorizontalIcon";
import "./Breadcrumbs.css";
import { DotIcon } from "./icons/DotIcon";
import { cn } from "@/utils";

export interface BreadcrumbItem {
  readonly id: string;
  readonly name: string;
  readonly unsaved: boolean;
}

interface BreadcrumbsProps {
  readonly items: readonly BreadcrumbItem[];
  readonly onNavigate: (index: number) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => (
    <button
      key={item.id}
      type="button"
      className={cn("breadcrumb-item", isLast ? "breadcrumb-item-active" : "breadcrumb-item-link")}
      onClick={() => !isLast && onNavigate(index)}
    >
      {item.name}
      {item.unsaved && (
        <span className="breadcrumb-dirty-dot">
          <DotIcon size={5} />
        </span>
      )}
    </button>
  );

  const renderSeparator = (key: string) => (
    <span key={key} className="breadcrumb-separator">
      <ChevronRightIcon size={14} />
    </span>
  );

  const renderedNodes = [];

  if (items.length <= 3) {
    // Show all items
    for (let i = 0; i < items.length; i++) {
      renderedNodes.push(renderItem(items[i], i, i === items.length - 1));
      if (i < items.length - 1) {
        renderedNodes.push(renderSeparator(`sep-${i}`));
      }
    }
  } else {
    // Overflow mode: [First] > [...] > [Second to last] > [Last]
    const first = items[0];
    const secondToLast = items[items.length - 2];
    const last = items[items.length - 1];

    renderedNodes.push(renderItem(first, 0, false));
    renderedNodes.push(renderSeparator("sep-first"));

    renderedNodes.push(
      <DropdownMenu key="ellipsis-menu">
        <DropdownMenuTrigger>
          <button type="button" className="breadcrumb-ellipsis">
            <MoreHorizontalIcon size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.slice(1, items.length - 2).map((item, originalIndexMinusOne) => (
            <DropdownMenuItem key={item.id} onClick={() => onNavigate(originalIndexMinusOne + 1)}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {item.name}
                {item.unsaved && <span className="breadcrumb-dirty-dot">*</span>}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    renderedNodes.push(renderSeparator("sep-second-to-last"));
    renderedNodes.push(renderItem(secondToLast, items.length - 2, false));

    renderedNodes.push(renderSeparator("sep-last"));
    renderedNodes.push(renderItem(last, items.length - 1, true));
  }

  return <div className="breadcrumbs">{renderedNodes}</div>;
}
