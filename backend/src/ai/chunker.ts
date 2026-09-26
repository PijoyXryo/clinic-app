// Split a document into chunks of whole paragraphs, each up to ~600 characters
export function chunkMarkdown(text: string, maxChars = 600): string[] {
  const paragraphs = text
    .split(/\n\s*\n/) // blank line = new paragraph
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';
  for (const p of paragraphs) {
    if (current && current.length + p.length + 2 > maxChars) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? `${current}\n\n${p}` : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}