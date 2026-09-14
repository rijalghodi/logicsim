import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createProject } from "@/storage/projectStorage";
import { toast } from "@/stores/toastStore";
import "./NewProjectPage.css";

export function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a project name");
      inputRef.current?.focus();
      return;
    }
    const project = createProject(trimmed);
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="new-project">
      <form className="new-project-form" onSubmit={handleSubmit}>
        <h1 className="new-project-title">Create Project</h1>

        <div className="new-project-field">
          <label htmlFor="project-name" className="new-project-label">
            PROJECT NAME
          </label>
          <Input
            id="project-name"
            ref={inputRef}
            type="text"
            size="xl"
            placeholder="e.g. MY CIRCUITS"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            required
          />
        </div>

        <div className="new-project-actions">
          <Button type="button" variant="secondary" size="xl" onClick={() => navigate("/")}>
            BACK
          </Button>
          <Button type="submit" variant="primary" size="xl">
            CREATE
          </Button>
        </div>
      </form>
    </div>
  );
}
