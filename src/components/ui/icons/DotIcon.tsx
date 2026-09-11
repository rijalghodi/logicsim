export function DotIcon({ color = "currentColor", size = 8 }: { readonly color?: string; readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill={color} xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}
