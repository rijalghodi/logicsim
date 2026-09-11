import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import "./DropdownMenu.css";

type DropdownMenuContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div style={{ position: "relative", display: "inline-block" }}>{children}</div>
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

export function DropdownMenuContent({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  const ctx = useContext(DropdownMenuContext);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const [effectiveAlign, setEffectiveAlign] = useState<"left" | "right">(align);

  useEffect(() => {
    if (ctx?.isOpen && menuRef.current) {
      const parent = menuRef.current.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuHeight = menuRef.current.offsetHeight || 150; // estimate if not fully rendered

        // If there's not enough space below, but there is space above, pop up
        if (spaceBelow < menuHeight + 20 && rect.top > menuHeight + 20) {
          setPosition("top");
        } else {
          setPosition("bottom");
        }

        // Auto-detect or use explicit right alignment
        if (align === "right" || rect.right > window.innerWidth - 100) {
          setEffectiveAlign("right");
        } else {
          setEffectiveAlign("left");
        }
      }
    }
  }, [ctx?.isOpen, align]);

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

  if (!ctx?.isOpen) return null;

  return (
    <div ref={menuRef} className={`dropdown dropdown-${position} dropdown-align-${effectiveAlign}`}>
      {children}
    </div>
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
      className="dropdown-item"
      onClick={() => {
        ctx?.setIsOpen(false);
        onClick?.();
      }}
      style={isDanger ? { color: "var(--danger)" } : {}}
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
