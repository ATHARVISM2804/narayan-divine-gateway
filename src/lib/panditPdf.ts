// The pandit's sankalp list as an A4 PDF, built in the browser.
//
// The table is laid out as HTML and captured page by page (html2canvas), so Hindi names are
// shaped by the browser exactly as on screen — jsPDF's own text output cannot join Devanagari.
// Rows are measured first and never split across pages; the header row repeats on every page.
// Both libraries are loaded only when an export starts, so the public site never downloads them.

export interface PanditPdfInput {
  title: string;
  subtitle: string;
  headers: string[];
  rows: string[][];
  filename: string;
}

const PAGE_W = 794; // A4 at 96 dpi
const PAGE_H = 1123;
const MARGIN = 40;
const FONT = `"Segoe UI", "Nirmala UI", "Noto Sans Devanagari", "Noto Sans", Arial, sans-serif`;
const COL_WIDTHS = ["7%", "28%", "45%", "20%"]; // S.No + the three list columns
const CELL = "border:1px solid #c9b48a;padding:6px 9px 8px;line-height:1.5;text-align:left;vertical-align:top;word-break:break-word;";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, style: string, text?: string) {
  const node = document.createElement(tag);
  node.style.cssText = style;
  if (text !== undefined) node.textContent = text; // customer text never goes through innerHTML
  return node;
}

function titleBlock(title: string, subtitle: string) {
  const box = el("div", "padding-bottom:14px;");
  box.append(
    el("div", "font-size:20px;font-weight:700;color:#5c1a10;", title),
    el("div", "font-size:12px;color:#5a4636;margin-top:4px;", subtitle),
  );
  return box;
}

function table(headers: string[], rows: string[][]) {
  const t = el("table", `width:100%;border-collapse:collapse;table-layout:fixed;font-size:13px;color:#2b1d14;`);
  const colgroup = document.createElement("colgroup");
  COL_WIDTHS.forEach((w) => colgroup.append(el("col", `width:${w};`)));
  const head = t.createTHead().insertRow();
  ["S.No", ...headers].forEach((h) => head.append(el("th", `${CELL}background:#f3e3c3;font-weight:700;`, h)));
  const body = t.createTBody();
  rows.forEach((r) => {
    const tr = body.insertRow();
    r.forEach((c) => tr.append(el("td", CELL, c)));
  });
  t.prepend(colgroup);
  return t;
}

function page(content: HTMLElement[], footer: string) {
  const p = el("div", `width:${PAGE_W}px;height:${PAGE_H}px;padding:${MARGIN}px;box-sizing:border-box;background:#fff;font-family:${FONT};position:relative;`);
  p.append(...content, el("div", `position:absolute;left:${MARGIN}px;right:${MARGIN}px;bottom:16px;font-size:10px;color:#8a7a6a;text-align:right;`, footer));
  return p;
}

export async function downloadPanditListPdf({ title, subtitle, headers, rows, filename }: PanditPdfInput): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);
  const numbered = rows.map((r, i) => [String(i + 1), ...r]);

  const host = el("div", "position:fixed;left:-10000px;top:0;");
  document.body.append(host);
  try {
    await document.fonts?.ready;

    // 1. Measure the title, the header row and every row at the real page width.
    const probeTitle = titleBlock(title, subtitle);
    const probeTable = table(headers, numbered);
    host.append(page([probeTitle, probeTable], ""));
    const titleH = probeTitle.offsetHeight;
    const headH = probeTable.tHead?.offsetHeight ?? 0;
    const rowHs = Array.from(probeTable.tBodies[0].rows, (r) => r.offsetHeight);
    host.replaceChildren();

    // 2. Fill pages with whole rows (36px kept free for the footer).
    const avail = PAGE_H - 2 * MARGIN - 36;
    const pages: number[][] = [];
    let current: number[] = [];
    let used = titleH + headH;
    rowHs.forEach((h, i) => {
      if (current.length && used + h > avail) {
        pages.push(current);
        current = [];
        used = headH;
      }
      current.push(i);
      used += h;
    });
    pages.push(current);

    // 3. Capture each page and add it to the PDF.
    const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    for (let p = 0; p < pages.length; p++) {
      const content: HTMLElement[] = [table(headers, pages[p].map((i) => numbered[i]))];
      if (p === 0) content.unshift(titleBlock(title, subtitle));
      const node = page(content, `Page ${p + 1} of ${pages.length}`);
      host.replaceChildren(node);
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", logging: false });
      if (p > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.9), "JPEG", 0, 0, pdfW, pdfH);
    }
    pdf.save(filename);
  } finally {
    host.remove();
  }
}
