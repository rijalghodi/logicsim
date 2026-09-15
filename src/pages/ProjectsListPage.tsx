import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { ProjectRow } from "@/components/ui/ProjectRow";
import { listProjects } from "@/storage/projectStorage";
import "./ProjectsListPage.css";

export function ProjectsListPage() {
  const navigate = useNavigate();
  const projects = listProjects();

  return (
    <div className="projects-page">
      <div className="projects-page-container">
        <BackButton onClick={() => navigate("/")} />

        <h1 className="projects-page-title">Projects</h1>

        <div className="projects-page-content">
          {projects.length === 0 ? (
            <p className="projects-empty-text">You don&apos;t have any projects yet.</p>
          ) : (
            <div className="projects-list">
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
              ))}
            </div>
          )}

          <div className="projects-page-actions">
            <Button type="button" variant="primary" size="lg" onClick={() => navigate("/new-project")}>
              + NEW PROJECT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
