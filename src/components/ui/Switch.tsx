import "./Switch.css";

export interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly "aria-label"?: string;
}

export function Switch({ checked, onChange, "aria-label": ariaLabel }: SwitchProps) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        className="switch-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
      <span className="switch-track">
        <span className="switch-thumb" />
      </span>
    </label>
  );
}
