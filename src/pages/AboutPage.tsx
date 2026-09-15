import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/ui/BackButton";
import MarkdownViewer from "@/components/ui/MarkdownViewer";
import "./AboutPage.css";

const TUTORIAL_MARKDOWN = `Welcome to **LogicSim** — build digital circuits right in your browser, then watch them come alive.

## Getting started

1. **Drag a chip** from the dock onto the canvas.
2. **Connect two ports** by dragging a wire between them.
3. **Toggle an input** and watch the signal flow through your circuit.

## Go further

- **Group a circuit** into your own chip, and reuse it like any other building block.
- **Dive inside** a chip to see exactly how it works underneath.
- **Save your work** as a project and pick up right where you left off.

## Fun fact

Every gate you drop — AND, OR, NOT, XOR — is quietly built out of NAND gates. Open one up and see for yourself.

Now go wire something up and watch it think.`;

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="about-page-container">
        <BackButton onClick={() => navigate("/")} />

        <h1 className="about-page-title">About</h1>

        <MarkdownViewer value={TUTORIAL_MARKDOWN} />
      </div>
    </div>
  );
}
