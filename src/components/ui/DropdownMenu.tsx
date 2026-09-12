import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import "./DropdownMenu.css";

type DropdownMenuContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  /** The trigger's wrapper element — measured to position the portaled `DropdownMenuContent`. */
  triggerRef: RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

export function DropdownMenu({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const value: DropdownMenuContextType = {
    isOpen: open ?? isOpen,
    setIsOpen: (value: boolean) => {
      onOpenChange?.(value);
      setIsOpen(value);
    },
    triggerRef,
  };

  return (
    <DropdownMenuContext.Provider value={value}>
      <div ref={triggerRef} style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
}: {
  children: React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
  }>;
}) {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenuTrigger must be inside DropdownMenu");

  const handleClick = () => {
    ctx.setIsOpen(!ctx.isOpen);
  };

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      handleClick();
      children.props.onClick?.(e);
    },
  });
}

/** Always sets every edge — the unused pair (e.g. `top` when anchored via `bottom`) is explicit
 * `"auto"` rather than omitted, so it can't be left showing through from the `.dropdown`/
 * `.dropdown-top`/`.dropdown-bottom` CSS classes' own `top`/`bottom`/`left` declarations. */
interface FixedPosition {
  readonly top: number | "auto";
  readonly bottom: number | "auto";
  readonly left: number | "auto";
  readonly right: number | "auto";
}

export function DropdownMenuContent({
  children,
  align = "left",
  style,
}: {
  children: ReactNode;
  align?: "left" | "right";
  style?: React.CSSProperties;
}) {
  const ctx = useContext(DropdownMenuContext);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const [effectiveAlign, setEffectiveAlign] = useState<"left" | "right">(align);
  const [fixedPos, setFixedPos] = useState<FixedPosition | null>(null);

  // Rendered through a portal (see the return below), so its position can't come from CSS
  // relative to a positioned ancestor anymore — it's computed here from the trigger's own
  // on-screen rect instead, in viewport (`position: fixed`) coordinates.
  useEffect(() => {
    // No need to reset `fixedPos` on close — the render below already gates on `ctx.isOpen`.
    if (!ctx?.isOpen) return;
    const trigger = ctx.triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    // Estimates for a not-yet-mounted menu; only ever affect the flip decision below, never
    // the on-screen edge itself — we anchor via whichever single edge (top/bottom, left/right)
    // the browser can resolve from the menu's real rendered size, not our guess of it.
    const menuHeight = menuRef.current?.offsetHeight || 150;
    const menuWidth = menuRef.current?.offsetWidth || 160;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 20 && rect.top > menuHeight + 20;
    const openRight = align === "right" || rect.left + menuWidth > window.innerWidth - 16;

    setPosition(openUp ? "top" : "bottom");
    setEffectiveAlign(openRight ? "right" : "left");
    setFixedPos({
      top: openUp ? "auto" : rect.bottom + 12,
      bottom: openUp ? window.innerHeight - rect.top + 12 : "auto",
      left: openRight ? "auto" : rect.left,
      right: openRight ? window.innerWidth - rect.right : "auto",
    });
  }, [ctx?.isOpen, ctx?.triggerRef, align]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        ctx?.setIsOpen(false);
      }
    };

    if (ctx?.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ctx]);

  if (!ctx?.isOpen || !fixedPos) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`dropdown dropdown-${position} dropdown-align-${effectiveAlign}`}
      style={{ position: "fixed", ...fixedPos, ...style }}
    >
      {children}
    </div>,
    document.body,
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  isDanger,
}: {
  children: ReactNode;
  onClick?: () => void;
  isDanger?: boolean;
}) {
  const ctx = useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      className={`dropdown-item ${isDanger ? " dropdown-item-danger" : ""}`}
      onClick={() => {
        ctx?.setIsOpen(false);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export function DropdownMenuShortcut({ children }: { children: ReactNode }) {
  return <span className="dropdown-item-shortcut">{children}</span>;
}

export function DropdownMenuSeparator() {
  return <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />;
}
