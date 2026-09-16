import type { Project } from "@/storage/projectStorage";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import "./ProjectRow.css";
import FolderIcon from "./icons/FolderIcon";

interface ProjectRowProps {
  readonly project: Project;
  readonly onClick: () => void;
}

export function ProjectRow({ project, onClick }: ProjectRowProps) {
  return (
    <button type="button" className="project-row" onClick={onClick}>
      <span className="project-row-name">
        <FolderIcon size={16} color="var(--fg-muted)" />
        {project.name}
      </span>
      <span className="project-row-meta">UPDATED {formatRelativeTime(project.updatedAt)}</span>
    </button>
  );
}
