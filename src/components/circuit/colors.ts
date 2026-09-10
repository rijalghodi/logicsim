// Canvas Background
export const CANVAS_BACKGROUND = "hsl(0, 0%, 17%)";

// Wire Colors
export const WIRE_ACTIVE_COLOR = "hsl(53, 98%, 77%)";
export const WIRE_INACTIVE_COLOR = "hsl(0, 0%, 4%)";
export const WIRE_DELETE_HOVER_COLOR = "hsl(0, 84%, 60%)";

// Component Node Colors
export const CHIP_FILL = "#4a6920";
export const CHIP_STROKE = "#4a6920";
export const LABEL_COLOR = "hsl(0, 0%, 90%)";

export function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return { r, g, b };
}

export function getContrastColor(hex: string): string {
  if (!hex.startsWith("#")) return LABEL_COLOR;
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "hsl(0, 0%, 10%)" : LABEL_COLOR;
}

export function getBorderColor(hex: string): string {
  if (!hex.startsWith("#")) return hex;
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  const factor = yiq >= 128 ? 0.7 : 1.3;
  const nr = Math.min(255, Math.floor(r * factor));
  const ng = Math.min(255, Math.floor(g * factor));
  const nb = Math.min(255, Math.floor(b * factor));
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

// Port Pin Colors
export const PORT_COLOR = "hsl(0, 0%, 4%)";

// Boundary Port Controller Colors
export const CONTROLLER_FILL = "hsl(0, 0%, 0%)";
export const CONTROLLER_FILL_HOVER = "hsl(0, 0%, 10%)";
export const CONTROLLER_STROKE = "hsl(0, 0%, 20%)";
export const CONTROLLER_STROKE_HOVER = "hsl(0, 0%, 30%)";

// Boundary Port Bit Circle Colors
export const BIT_FILL = "hsl(53, 98%, 16%)";
export const BIT_FILL_HOVER = "hsl(53, 98%, 20%)";
export const BIT_STROKE = "hsl(0, 0%, 6%)";
export const BIT_STROKE_HOVER = "hsl(53, 98%, 10%)";
export const BIT_STROKE_ACTIVE = WIRE_ACTIVE_COLOR;
