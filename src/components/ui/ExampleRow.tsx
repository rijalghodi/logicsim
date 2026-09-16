import "./ProjectRow.css";

interface ExampleRowProps {
  readonly name: string;
  readonly description: string;
  readonly onClick: () => void;
}

/** Same row treatment as ProjectRow, for the home page's Examples section — an example isn't a
 * Project (no id/updatedAt to show), so this takes plain name/description instead. */
export function ExampleRow({ name, description, onClick }: ExampleRowProps) {
  return (
    <button type="button" className="project-row" onClick={onClick}>
      <span className="project-row-name">{name}</span>
      <span className="project-row-meta">{description}</span>
    </button>
  );
}
