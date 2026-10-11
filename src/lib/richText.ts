/**
 * Long text typed into the admin's plain textareas (about the pooja, about the
 * temple) shown with structure, without asking the team to learn any markup:
 *
 * - a short line on its own with no full stop, or one ending in ":", is a heading
 * - a line starting with -, •, * or ✓ is a bullet
 * - "Label: the rest of the paragraph" shows the label in bold
 * - everything else is a paragraph; a very long one (often pasted with no line
 *   breaks at all) is split into shorter paragraphs at sentence ends
 */
export type RichBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string; label?: string }
  | { type: "list"; items: string[] };

const HEADING_MAX = 90;
const LABEL_MAX = 60;
const SENTENCE_END = /[.!?।]["'”’)]*$/;
const BULLET = /^[-•*✓]\s+/;
const LONG_PARAGRAPH = 450;
const CHUNK = 280;

/** Splits a long paragraph into ~CHUNK-character paragraphs at sentence ends:
    after "।" (even with no space after it), or after . ! ? followed by a space. */
function splitLong(text: string): string[] {
  if (text.length <= LONG_PARAGRAPH) return [text];
  const sentences = text.split(/(?<=।)\s*|(?<=[.!?])\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    cur = cur ? `${cur} ${s}` : s;
    if (cur.length >= CHUNK) {
      out.push(cur);
      cur = "";
    }
  }
  if (cur) {
    if (out.length && cur.length < CHUNK / 2) out[out.length - 1] += ` ${cur}`;
    else out.push(cur);
  }
  return out;
}

export function parseRichText(text: string | null | undefined): RichBlock[] {
  const blocks: RichBlock[] = [];
  for (const raw of (text ?? "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (BULLET.test(line)) {
      const item = line.replace(BULLET, "");
      const last = blocks[blocks.length - 1];
      if (last?.type === "list") last.items.push(item);
      else blocks.push({ type: "list", items: [item] });
      continue;
    }

    if (line.length <= HEADING_MAX && (line.endsWith(":") || !SENTENCE_END.test(line))) {
      blocks.push({ type: "heading", text: line.replace(/:$/, "").trim() });
      continue;
    }

    // "Label: rest". The colon must be followed by a space (not a URL or a time).
    const m = line.match(/^([^:.]{2,}?):\s+(.+)$/);
    const label = m && m[1].length <= LABEL_MAX && !/https?$/i.test(m[1]) ? m[1].trim() : undefined;
    splitLong(label && m ? m[2] : line).forEach((part, i) =>
      blocks.push(label && i === 0 ? { type: "paragraph", label, text: part } : { type: "paragraph", text: part }),
    );
  }
  return blocks;
}
