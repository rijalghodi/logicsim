import "./BackButton.css";

interface BackButtonProps {
  readonly onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button type="button" className="back-button" onClick={onClick}>
      ← BACK
    </button>
  );
}
