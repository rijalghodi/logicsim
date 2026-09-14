import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/icons/GithubIcon";
import { listProjects } from "@/storage/projectStorage";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
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
              <button
                key={project.id}
                type="button"
                className="home-recent-card"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <span className="home-recent-card-name">{project.name}</span>
                <span className="home-recent-card-meta">UPDATED {formatRelativeTime(project.updatedAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: "column",
          width: "100%",
          maxWidth: 400,
          justifyContent: "center",
        }}
      >
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
        <span className="home-footer-version">Version: v0.0.1</span>
      </footer>
    </div>
  );
}
