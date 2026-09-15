import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/icons/GithubIcon";
import { ProjectRow } from "@/components/ui/ProjectRow";
import { listProjects } from "@/storage/projectStorage";
import "./HomePage.css";

const LOGO_ASCII = String.raw`
██╗      ██████╗  ██████╗ ██╗ ██████╗███████╗██╗███╗   ███╗
██║     ██╔═══██╗██╔════╝ ██║██╔════╝██╔════╝██║████╗ ████║
██║     ██║   ██║██║  ███╗██║██║     ███████╗██║██╔████╔██║
██║     ██║   ██║██║   ██║██║██║     ╚════██║██║██║╚██╔╝██║
███████╗╚██████╔╝╚██████╔╝██║╚██████╗███████║██║██║ ╚═╝ ██║
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝ ╚═════╝╚══════╝╚═╝╚═╝     ╚═╝`;

const RECENT_COUNT = 3;

export function HomePage() {
  const navigate = useNavigate();
  const recentProjects = listProjects().slice(0, RECENT_COUNT);

  return (
    <div className="home">
      <div className="home-hero">
        <pre className="home-ascii" aria-label="LogicSim">
          {LOGO_ASCII}
        </pre>
        <p className="home-tagline">DIGITAL CIRCUIT SIMULATOR</p>
      </div>

      {recentProjects.length > 0 && (
        <div className="home-recent">
          <div className="home-recent-header">
            <span className="home-recent-label">Recent Projects</span>
            <button type="button" className="home-recent-see-all" onClick={() => navigate("/projects")}>
              SEE MORE →
            </button>
          </div>

          <div className="home-recent-list">
            {recentProjects.slice(0, 3).map((project) => (
              <ProjectRow key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
            ))}
          </div>
        </div>
      )}

      <div className="home-actions">
        <Button type="button" variant="primary" size="xl" onClick={() => navigate("/new-project")}>
          + NEW PROJECT
        </Button>
        <Button type="button" variant="secondary" size="xl" onClick={() => navigate("/about")}>
          ABOUT
        </Button>
      </div>

      <footer className="home-footer">
        <span>
          Created by:{" "}
          <a href="https://github.com/rijalghodi" target="_blank" rel="noreferrer" className="home-footer-link">
            <GithubIcon size={14} /> Rijal Ghodi
          </a>
        </span>
      </footer>
    </div>
  );
}
