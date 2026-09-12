import "./Slider.css";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  readonly value: number;
  readonly onChange: (val: number) => void;
}

export function Slider({ value, onChange, className = "", ...props }: SliderProps) {
  return (
    <input
      type="range"
      className={`custom-slider ${className}`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      {...props}
    />
  );
}
