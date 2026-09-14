import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import "./AboutPage.css";
import MarkdownViewer from "@/components/ui/MarkdownViewer";

const ABOUT_MARKDOWN = `# LogicSim

A digital circuit simulator you build entirely in the browser: drag logic
chips onto a canvas, wire them up, and watch them evaluate live.

## What you can do

- Drop primitive and custom chips onto the canvas and connect them with wires
- Toggle boundary inputs and watch outputs update instantly
- Group any circuit into a reusable custom chip and save it to your library
- Dive into a chip's internals to see exactly how it's built, down to NAND gates
- Keep circuits organized as separate projects, each with its own chip library

## Core ideas

- **NAND is the only built-in primitive.** Every other gate (AND, OR, NOT, XOR, ...) is just a NAND circuit you can open and inspect.
- **Chips are made of chips.** A custom chip's internals are themselves a circuit, so nesting goes as deep as you like.
- **Floating inputs read as false**, so a half-wired circuit still evaluates while you work on it.
`;

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <h1 className="about-page-title">About</h1>

      <div className="about-page-content">
        <MarkdownViewer value={ABOUT_MARKDOWN} />

        <div className="about-page-actions">
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/")}>
            BACK
          </Button>
        </div>
      </div>
    </div>
  );
}
