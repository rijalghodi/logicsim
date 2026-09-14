import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { listProjects } from "@/storage/projectStorage";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import "./ProjectsListPage.css";

export function ProjectsListPage() {
  const navigate = useNavigate();
  const projects = listProjects();

  return (
    <div className="projects-page">
      <h1 className="projects-page-title">Projects</h1>

      <div className="projects-page-content">
        {projects.length === 0 ? (
          <p className="projects-empty-text">You don&apos;t have any projects yet.</p>
        ) : (
          <div className="projects-list">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="project-row"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <span className="project-row-name">{project.name}</span>
                <span className="project-row-meta">UPDATED {formatRelativeTime(project.updatedAt)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="projects-page-actions">
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/")}>
            BACK
          </Button>
          <Button type="button" variant="primary" size="lg" onClick={() => navigate("/new-project")}>
            + NEW PROJECT
          </Button>
        </div>
      </div>
    </div>
  );
}
