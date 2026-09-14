export interface Project {
  readonly id: string;
  readonly name: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

const PROJECTS_KEY = "logicsim_projects";
const LEGACY_CHIPS_KEY = "logicsim_custom_chips";

/** Namespaced localStorage key for a project's saved-chip library — see chipStorage.ts. */
export function chipsStorageKey(projectId: string): string {
  return `logicsim_custom_chips_${projectId}`;
}

/** Namespaced localStorage key for a project's root circuit — see projectCircuitStorage.ts. */
export function circuitStorageKey(projectId: string): string {
  return `logicsim_project_circuit_${projectId}`;
}

function createProjectId(): string {
  return `proj_${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
}

function readProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Project =>
        p && typeof p.id === "string" && typeof p.name === "string" && typeof p.createdAt === "number",
    );
  } catch (err) {
    console.warn("Failed to load projects from localStorage:", err);
    return [];
  }
}

function writeProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("Failed to save projects to localStorage:", err);
  }
}

/**
 * Pre-project installs kept a single global chip library under LEGACY_CHIPS_KEY.
 * The first time projects are listed after upgrading, adopt that library into a
 * new project instead of orphaning it. Runs at most once (guarded by PROJECTS_KEY
 * existing at all, even as an empty list).
 */
function migrateLegacyChipsOnce(): void {
  if (localStorage.getItem(PROJECTS_KEY) !== null) return;

  const legacy = localStorage.getItem(LEGACY_CHIPS_KEY);
  if (!legacy) {
    writeProjects([]);
    return;
  }

  const now = Date.now();
  const project: Project = { id: createProjectId(), name: "My Project", createdAt: now, updatedAt: now };
  try {
    localStorage.setItem(chipsStorageKey(project.id), legacy);
    localStorage.removeItem(LEGACY_CHIPS_KEY);
  } catch (err) {
    console.error("Failed to migrate legacy chip library into a project:", err);
  }
  writeProjects([project]);
}

/** All projects, most recently updated first. */
export function listProjects(): Project[] {
  migrateLegacyChipsOnce();
  return readProjects().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProject(id: string): Project | null {
  migrateLegacyChipsOnce();
  return readProjects().find((p) => p.id === id) ?? null;
}

export function createProject(name: string): Project {
  const projects = readProjects();
  const now = Date.now();
  const project: Project = { id: createProjectId(), name, createdAt: now, updatedAt: now };
  writeProjects([...projects, project]);
  return project;
}

/** Bumps a project's updatedAt so it surfaces as "recent" — call when it's opened or edited. */
export function touchProject(id: string): void {
  const projects = readProjects();
  if (!projects.some((p) => p.id === id)) return;
  writeProjects(projects.map((p) => (p.id === id ? { ...p, updatedAt: Date.now() } : p)));
}
