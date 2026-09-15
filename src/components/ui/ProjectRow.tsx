import type { Project } from "@/storage/projectStorage";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import "./ProjectRow.css";

interface ProjectRowProps {
  readonly project: Project;
  readonly onClick: () => void;
}

export function ProjectRow({ project, onClick }: ProjectRowProps) {
  return (
    <button type="button" className="project-row" onClick={onClick}>
      <span className="project-row-name">{project.name}</span>
      <span className="project-row-meta">UPDATED {formatRelativeTime(project.updatedAt)}</span>
    </button>
  );
}
