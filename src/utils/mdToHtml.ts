export function markdownToHtml(markdown: string): string {
  const lines = markdown.trim().split("\n");
  const html: string[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,3}) (.+)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      const items: string[] = [];

      while (i < lines.length && /^[-*] /.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().slice(2))}</li>`);
        i++;
      }

      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];

      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^\d+\. /, ""))}</li>`);
        i++;
      }

      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Default text
    html.push(`<p>${inline(line)}</p>`);
    i++;
  }

  return html.join("\n");
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}
