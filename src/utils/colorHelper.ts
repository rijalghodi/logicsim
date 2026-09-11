export function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return { r, g, b };
}

export function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  hex = hex.replace("#", "");

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // sRGB → linear RGB
  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  // Linear RGB → OKLab
  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;

  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;

  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // OKLab → OKLCH
  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);

  if (H < 0) H += 360;

  return {
    l: L,
    c: C,
    h: H,
  };
}

export function oklchToHex({ l: L, c: C, h: H }) {
  const hRad = H * (Math.PI / 180);

  // OKLCH → OKLab
  const a = C * Math.cos(hRad);
  let b = C * Math.sin(hRad);

  // OKLab → LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS → linear RGB
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;

  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;

  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Linear RGB → sRGB
  const toSrgb = (c) => {
    const clamped = Math.max(0, Math.min(1, c));

    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSrgb(R) * 255);
  const g = Math.round(toSrgb(G) * 255);
  b = Math.round(toSrgb(B) * 255);

  return rgbToHex({ r, g, b });
}

export function getContrastColor(hex: string, darkColor = "#000000", lightColor = "#ffffff"): string {
  if (!hex.startsWith("#")) return hex;
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? darkColor : lightColor;
}

export function scaleColorLightness(hex: string, factor: number): string {
  if (!hex.startsWith("#")) return hex;

  const { h, c, l } = hexToOklch(hex);

  const safeL = Math.max(0, Math.min(l * factor, 1));

  return oklchToHex({ l: safeL, c, h });
}

export function getBorderColor(hex: string): string {
  if (!hex.startsWith("#")) return hex;

  const { h, c, l } = hexToOklch(hex);

  const factor = l >= 0.5 ? 0.7 : 1.3;
  const newL = Math.min(Math.max(l * factor, 0), 1);

  return oklchToHex({ l: newL, c, h });
}

export function getHoverColor(hex: string): string {
  return scaleColorLightness(hex, 1.2);
}

export function getSafeColor(hex: string): string {
  if (!hex.startsWith("#")) return hex;

  const { h, c } = hexToOklch(hex);

  return oklchToHex({ l: 0.5, c, h });
}

export function getDimmedColor(hex: string): string {
  if (!hex.startsWith("#")) return hex;

  const { h, c } = hexToOklch(hex);

  // Dim the color (e.g., target around 20-30% lightness)
  // const newL = Math.max(l * 0.4, 0.17);
  const newL = 0.4;

  return oklchToHex({ l: newL, c, h });
}

export function getBrightColor(hex: string) {
  if (!hex.startsWith("#")) return hex;

  const { h, c, l } = hexToOklch(hex);

  // Brighten the color (e.g., target around 70-90% lightness)
  const newL = Math.min(Math.max(l * 1.5, 0.6), 0.8);

  return oklchToHex({ l: newL, c, h });
}
