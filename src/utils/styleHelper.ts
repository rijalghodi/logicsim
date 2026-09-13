/**
 * Join classes together with space, dropping any falsy ones — lets callers pass
 * optional/conditional class names (e.g. `cn("btn", isActive && "btn-active")`) directly.
 * @example cn("btn", "btn-primary") // "btn btn-primary"
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
