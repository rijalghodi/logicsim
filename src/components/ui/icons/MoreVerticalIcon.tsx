export function MoreVerticalIcon({
  color = "currentColor",
  size = 16,
}: {
  readonly color?: string;
  readonly size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1.8" fill={color} />
      <circle cx="12" cy="3" r="1.8" fill={color} />
      <circle cx="12" cy="21" r="1.8" fill={color} />
    </svg>
  );
}
