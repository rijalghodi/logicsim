import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import "./AboutPage.css";
import MarkdownViewer from "@/components/ui/MarkdownViewer";

export function AboutPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    fetch("/tutorial.md")
      .then((res) => res.text())
      .then((text) => setContent(text))
      .catch((err) => console.error("Failed to load tutorial:", err));
  }, []);

  return (
    <div className="about-page">
      <h1 className="about-page-title">About</h1>

      <div className="about-page-content">
        <MarkdownViewer value={content} />

        <div className="about-page-actions">
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/")}>
            BACK
          </Button>
        </div>
      </div>
    </div>
  );
}
