import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/ui/BackButton";
import { ExampleRow } from "@/components/ui/ExampleRow";
import { EXAMPLES } from "@/examples";
import "./ExamplesListPage.css";

export function ExamplesListPage() {
  const navigate = useNavigate();

  return (
    <div className="examples-page">
      <div className="examples-page-container">
        <BackButton onClick={() => navigate("/")} />

        <h1 className="examples-page-title">Examples</h1>

        <div className="examples-page-content">
          <div className="examples-list">
            {EXAMPLES.map((example) => (
              <ExampleRow key={example.id} name={example.name} onClick={() => navigate(`/examples/${example.id}`)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
