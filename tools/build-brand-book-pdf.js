const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "brand-book.md");
const htmlPath = path.join(os.tmpdir(), "chateau-follent-brand-book.html");
const pdfPath = path.join(root, "brand-book.pdf");
const tempPdfPath = path.join(os.tmpdir(), "chateau-follent-brand-book.pdf");
const chromeProfilePath = path.join(os.tmpdir(), "chateau-follent-chrome-profile");
const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderTable(lines) {
  const rows = lines
    .filter((line) => !/^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => inline(cell.trim()))
    );

  if (!rows.length) return "";
  const [head, ...body] = rows;
  return [
    "<table>",
    "<thead><tr>",
    ...head.map((cell) => `<th>${cell}</th>`),
    "</tr></thead>",
    "<tbody>",
    ...body.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`),
    "</tbody>",
    "</table>",
  ].join("");
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let list = null;
  let paragraph = [];
  let quote = [];
  let table = [];

  function closeParagraph() {
    if (paragraph.length) {
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function closeList() {
    if (list) {
      html.push(`</${list}>`);
      list = null;
    }
  }

  function closeQuote() {
    if (quote.length) {
      html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      quote = [];
    }
  }

  function closeTable() {
    if (table.length) {
      html.push(renderTable(table));
      table = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeList();
      closeQuote();
      closeTable();
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      closeParagraph();
      closeList();
      closeQuote();
      table.push(trimmed);
      continue;
    }

    closeTable();

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      closeParagraph();
      closeList();
      closeQuote();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      closeParagraph();
      closeList();
      quote.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }

    const unordered = /^-\s+(.+)$/.exec(trimmed);
    if (unordered) {
      closeParagraph();
      closeQuote();
      if (list !== "ul") {
        closeList();
        html.push("<ul>");
        list = "ul";
      }
      html.push(`<li>${inline(unordered[1])}</li>`);
      continue;
    }

    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (ordered) {
      closeParagraph();
      closeQuote();
      if (list !== "ol") {
        closeList();
        html.push("<ol>");
        list = "ol";
      }
      html.push(`<li>${inline(ordered[1])}</li>`);
      continue;
    }

    closeList();
    closeQuote();
    paragraph.push(trimmed);
  }

  closeParagraph();
  closeList();
  closeQuote();
  closeTable();
  return html.join("\n");
}

const markdown = fs.readFileSync(sourcePath, "utf8");
const crestPath = path.join(root, "chateau-follent-crest-black-no-inner.svg").replace(/\\/g, "/");
const body = renderMarkdown(markdown);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Chateau Follent Brand Book</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 17mm 19mm;
    }

    :root {
      --noir: #0A0A0C;
      --ivory: #F2F0EA;
      --surface: #FCFBF8;
      --steel: #5A6470;
      --border: #D2CDC4;
      --bordeaux: #4A002E;
      --ice: #C7E0FF;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--ivory);
      color: var(--noir);
      font-family: Montserrat, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.8pt;
      line-height: 1.52;
    }

    main {
      max-width: 184mm;
      margin: 0 auto;
    }

    .cover {
      min-height: 246mm;
      display: grid;
      align-content: center;
      justify-items: center;
      text-align: center;
      page-break-after: always;
      border: 1px solid var(--border);
      background:
        linear-gradient(180deg, rgba(74, 0, 46, 0.06), rgba(74, 0, 46, 0)),
        var(--surface);
      padding: 22mm;
    }

    .cover img {
      width: 42mm;
      height: auto;
      margin-bottom: 10mm;
    }

    .wordmark {
      font-family: "Libre Baskerville", Playfair Display, Georgia, serif;
      font-size: 26pt;
      line-height: 1.1;
      letter-spacing: 0.08em;
      margin: 0 0 8mm;
    }

    .subtitle {
      color: var(--bordeaux);
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin: 0 0 4mm;
    }

    .cover h1 {
      margin: 0;
      max-width: 11ch;
      font-size: 42pt;
      line-height: 1.04;
    }

    .cover-meta {
      margin-top: 14mm;
      color: var(--steel);
      font-size: 10pt;
    }

    h1, h2, h3, h4 {
      font-family: "Libre Baskerville", Playfair Display, Georgia, serif;
      color: var(--noir);
      line-height: 1.18;
      page-break-after: avoid;
    }

    article > h1 {
      display: none;
    }

    h2 {
      margin: 11mm 0 3mm;
      padding-top: 5mm;
      border-top: 1px solid var(--border);
      color: var(--bordeaux);
      font-size: 19pt;
    }

    h3 {
      margin: 6mm 0 2mm;
      font-size: 13.5pt;
    }

    h4 {
      margin: 4.5mm 0 1.5mm;
      font-size: 11pt;
    }

    p {
      margin: 0 0 3mm;
      color: var(--steel);
    }

    ul, ol {
      margin: 0 0 3.5mm 5mm;
      padding: 0;
      color: var(--steel);
    }

    li {
      margin: 0 0 1.1mm;
      padding-left: 1mm;
    }

    blockquote {
      margin: 4mm 0;
      padding: 4mm 5mm;
      border-left: 2.5mm solid var(--bordeaux);
      background: rgba(74, 0, 46, 0.055);
      page-break-inside: avoid;
    }

    blockquote p {
      margin: 0;
      color: var(--noir);
      font-family: "Libre Baskerville", Playfair Display, Georgia, serif;
      font-size: 11pt;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 4mm 0 5mm;
      font-size: 8.3pt;
      page-break-inside: avoid;
      background: var(--surface);
    }

    th, td {
      border: 1px solid var(--border);
      padding: 2.1mm 2.3mm;
      text-align: left;
      vertical-align: top;
    }

    th {
      color: var(--noir);
      background: rgba(74, 0, 46, 0.08);
      font-weight: 700;
    }

    code {
      color: var(--noir);
      background: rgba(10, 10, 12, 0.06);
      border-radius: 2px;
      padding: 0.4mm 0.8mm;
      font-family: "Courier New", monospace;
      font-size: 8.5pt;
    }

    article {
      counter-reset: section;
    }

    article h2 {
      break-before: auto;
    }

    article h2:nth-of-type(1) {
      margin-top: 0;
      padding-top: 0;
      border-top: 0;
    }

    h2, h3, h4, table, blockquote {
      break-inside: avoid;
    }

    .swatches {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3mm;
      margin: 4mm 0 5mm;
    }

    .swatch {
      min-height: 16mm;
      border: 1px solid var(--border);
      padding: 2mm;
      background: var(--surface);
    }
  </style>
</head>
<body>
  <main>
    <section class="cover">
      <img src="file:///${crestPath}" alt="Chateau Follent crest">
      <p class="wordmark">CHATEAU<br>FOLLENT</p>
      <p class="subtitle">Canonical Brand Source</p>
      <h1>Brand Book</h1>
      <p class="cover-meta">Version 1.0 | 2026-05-23 | Steward: Lord James Follent</p>
    </section>
    <article>
      ${body}
    </article>
  </main>
</body>
</html>`;

fs.writeFileSync(htmlPath, html);

const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) {
  throw new Error("Chrome or Edge was not found for PDF rendering.");
}

fs.rmSync(tempPdfPath, { force: true });
fs.rmSync(chromeProfilePath, { force: true, recursive: true });
fs.mkdirSync(chromeProfilePath, { recursive: true });

const result = spawnSync(
  chrome,
  [
    "--headless",
    "--disable-gpu",
    "--allow-file-access-from-files",
    `--user-data-dir=${chromeProfilePath}`,
    `--print-to-pdf=${tempPdfPath}`,
    `file:///${htmlPath.replace(/\\/g, "/")}`,
  ],
  { stdio: "inherit" }
);

if (result.status !== 0) {
  process.exit(result.status || 1);
}

fs.copyFileSync(tempPdfPath, pdfPath);
console.log(`Wrote ${path.relative(root, pdfPath)}`);
