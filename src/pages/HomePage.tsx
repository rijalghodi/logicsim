import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/icons/GithubIcon";
import { ProjectRow } from "@/components/ui/ProjectRow";
import { ExampleRow } from "@/components/ui/ExampleRow";
import { listProjects } from "@/storage/projectStorage";
import { EXAMPLES } from "@/examples";
import { ArrowRight } from "@/components/ui/icons/ArrowRight";
import "./HomePage.css";

const LOGO_ASCII = String.raw`
██╗      ██████╗  ██████╗ ██╗ ██████╗███████╗██╗███╗   ███╗
██║     ██╔═══██╗██╔════╝ ██║██╔════╝██╔════╝██║████╗ ████║
██║     ██║   ██║██║  ███╗██║██║     ███████╗██║██╔████╔██║
██║     ██║   ██║██║   ██║██║██║     ╚════██║██║██║╚██╔╝██║
███████╗╚██████╔╝╚██████╔╝██║╚██████╗███████║██║██║ ╚═╝ ██║
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝ ╚═════╝╚══════╝╚═╝╚═╝     ╚═╝`;

const RECENT_PROJECTS_COUNT = 3;
const RECENT_EXAMPLES_COUNT = 3;

export function HomePage() {
  const navigate = useNavigate();
  const projects = listProjects();
  const recentProjects = projects.slice(0, RECENT_PROJECTS_COUNT);
  const recentExamples = EXAMPLES.slice(0, RECENT_EXAMPLES_COUNT);

  return (
    <div className="home">
      <div className="home-hero">
        <pre className="home-ascii" aria-label="LogicSim">
          {LOGO_ASCII}
        </pre>
        <p className="home-tagline">DIGITAL CIRCUIT SIMULATOR</p>
      </div>

      {recentProjects.length > 0 && (
        <div className="home-section">
          <div className="home-section-header">
            <span className="home-section-title">Recent Projects</span>
            {projects.length > RECENT_PROJECTS_COUNT && (
              <Button type="button" variant="plain" size="sm" onClick={() => navigate("/projects")}>
                SHOW ALL <ArrowRight size={13} />
              </Button>
            )}
          </div>

          <div className="home-section-list">
            {recentProjects.map((project) => (
              <ProjectRow key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
            ))}
          </div>
        </div>
      )}

      <div className="home-section">
        <div className="home-section-header">
          <span className="home-section-title">Examples</span>
          {EXAMPLES.length > RECENT_EXAMPLES_COUNT && (
            <Button type="button" variant="plain" size="sm" onClick={() => navigate("/examples")}>
              SHOW ALL <ArrowRight size={13} />
            </Button>
          )}
        </div>

        <div className="home-section-list">
          {recentExamples.map((example) => (
            <ExampleRow key={example.id} name={example.name} onClick={() => navigate(`/examples/${example.id}`)} />
          ))}
        </div>
      </div>

      <div className="home-actions">
        <Button type="button" variant="primary" size="lg" onClick={() => navigate("/new-project")}>
          + NEW PROJECT
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/about")}>
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
