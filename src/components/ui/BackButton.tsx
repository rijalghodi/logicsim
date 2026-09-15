import { ArrowRight } from "./icons/ArrowRight";
import "./BackButton.css";
import Button from "./Button";

interface BackButtonProps {
  readonly onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <Button type="button" variant="plain" onClick={onClick}>
      <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} /> BACK
    </Button>
  );
}
