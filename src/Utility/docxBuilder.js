import { DEFAULT_DOC_STYLES, BULLET_STYLES } from "./constants.js";
import { pt2hp, ls2dxa, pt2dxa, wAlign, hexCol, xmlEsc, sanitizeUrl, attrEsc } from "./helpers.js";
/* ════════════════════════════════════════════════
   INLINE RICH TEXT PARSER
   Supports: **bold**, _italic_, **_both_**, [text](url)
════════════════════════════════════════════════ */
function parseInlineRuns(text) {
  const runs = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*_(.+?)_\*\*|_\*\*(.+?)\*\*_|\*\*(.+?)\*\*|_(.+?)_/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index), bold: false, italic: false, url: null });
    if (m[1] !== undefined) runs.push({ text: m[1], bold: false, italic: false, url: m[2] });
    else if (m[3] !== undefined) runs.push({ text: m[3], bold: true, italic: true, url: null });
    else if (m[4] !== undefined) runs.push({ text: m[4], bold: true, italic: true, url: null });
    else if (m[5] !== undefined) runs.push({ text: m[5], bold: true, italic: false, url: null });
    else if (m[6] !== undefined) runs.push({ text: m[6], bold: false, italic: true, url: null });
    last = re.lastIndex;
  }
  if (last < text.length) runs.push({ text: text.slice(last), bold: false, italic: false, url: null });
  return runs.filter(r => r.text);
}

function runsToXml(runs, baseRPr) {
  return runs.map(run => {
    const b = run.bold ? "<w:b/><w:bCs/>" : "";
    const i = run.italic ? "<w:i/><w:iCs/>" : "";
    if (run.url) {
      const rPr = baseRPr.replace(/<\/w:rPr>/, `<w:color w:val="1155CC"/><w:u w:val="single"/></w:rPr>`);
      return `<w:r>${rPr}<w:t xml:space="preserve">${xmlEsc(run.text)}</w:t></w:r>`;
    }
    if (run.bold || run.italic) {
      const rPr = baseRPr.replace(/<\/w:rPr>/, `${b}${i}</w:rPr>`);
      return `<w:r>${rPr}<w:t xml:space="preserve">${xmlEsc(run.text)}</w:t></w:r>`;
    }
    return `<w:r>${baseRPr}<w:t xml:space="preserve">${xmlEsc(run.text)}</w:t></w:r>`;
  }).join("");
}

function makeRichParaXml(text, type, docStyles) {
  // Fix: if array, create a separate <w:p> for every item (no joining = no wall of text)
  if (Array.isArray(text)) {
    return text.map(t => makeRichParaXml(String(t ?? ""), type, docStyles)).join("\n");
  }
  text = String(text ?? "");
  const s = (docStyles || DEFAULT_DOC_STYLES)[type] || (docStyles || DEFAULT_DOC_STYLES).paragraph || (docStyles || DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const szHp = pt2hp(s.size);
  const col = hexCol(s.color);
  const jc = wAlign(s.align);
  const bold = s.bold ? "<w:b/><w:bCs/>" : "";
  const ital = s.italic ? "<w:i/><w:iCs/>" : "";
  const ls = ls2dxa(s.lineSpacing || 1.5);
  const bef = pt2dxa(s.marginTop || 0);
  const aft = pt2dxa(s.marginBottom || 8);
  // Fix 3: Use native Word styles for semantic hierarchy (Navigation Pane + ToC support)
  const pStyle = (type === "body" || type === "paragraph") ? `<w:pStyle w:val="ProfessionalBody"/>`
    : type === "h1" ? `<w:pStyle w:val="Heading1"/>`
      : type === "h2" ? `<w:pStyle w:val="Heading2"/>`
        : type === "title" ? `<w:pStyle w:val="Title"/>`
          : "";
  const bgFill = s.bgColor && s.bgColor !== "" ? `<w:shd w:val="clear" w:color="auto" w:fill="${hexCol(s.bgColor)}"/>` : "";
  const pPr = `<w:pPr>${pStyle}${bgFill}<w:jc w:val="${jc}"/><w:spacing w:line="${ls}" w:lineRule="auto" w:before="${bef}" w:after="${aft}"/></w:pPr>`;
  const baseRPr = `<w:rPr><w:rFonts w:ascii="${s.font}" w:hAnsi="${s.font}" w:cs="${s.font}"/>${bold}${ital}<w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${col}"/></w:rPr>`;
  const runs = parseInlineRuns(text);
  const content = runs.length > 0 ? runsToXml(runs, baseRPr) : `<w:r>${baseRPr}<w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`;
  return `<w:p>${pPr}${content}</w:p>`;
}

// makeParaXml removed — superseded by makeRichParaXml (supports inline bold/italic/links).

function makeHrXml() {
  return `<w:p><w:pPr><w:spacing w:before="120" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="9CA3AF"/></w:pBdr></w:pPr></w:p>`;
}

function makeBulletXml(items, docStyles) {
  const s = (docStyles || DEFAULT_DOC_STYLES).paragraph || (docStyles || DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const bs = (docStyles || DEFAULT_DOC_STYLES).bullets || DEFAULT_DOC_STYLES.bullets;
  const font = s.font || "Times New Roman";
  const szHp = pt2hp(s.size);
  const col = hexCol(s.color);
  const ls = ls2dxa(bs.lineSpacing || s.lineSpacing || 1.5);
  const aft = pt2dxa(bs.itemSpacingAfter ?? 6);
  const indL = bs.indentLeft || 720;
  const hang = bs.hanging || 360;
  const baseRPr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${col}"/></w:rPr>`;
  return (Array.isArray(items) ? items : ["Item"]).map(item => {
    const runs = parseInlineRuns(item);
    const content = runs.length > 0
      ? runsToXml(runs, baseRPr)
      : `<w:r>${baseRPr}<w:t xml:space="preserve">${xmlEsc(item)}</w:t></w:r>`;
    return `<w:p>
  <w:pPr>
    <w:pStyle w:val="ListParagraph"/>
    <w:numPr>
      <w:ilvl w:val="0"/>
      <w:numId w:val="1"/>
    </w:numPr>
    <w:spacing w:line="${ls}" w:lineRule="auto" w:after="${aft}"/>
    <w:ind w:left="${indL}" w:hanging="${hang}"/>
  </w:pPr>
  ${content}
</w:p>`;
  }).join("\n");
}

function hasTableData(headers, rows) {
  const validHeaders = (headers || []).filter(h => h && String(h).trim() && String(h).trim() !== "—");
  if (!validHeaders.length) return false;
  // Accept string (CSV blob), array of strings, or nested arrays
  let r = rows;
  if (typeof r === "string" && r.trim()) r = r.split("\n").map(s => s.trim()).filter(Boolean);
  if (!Array.isArray(r)) return false;
  const validRows = r.filter(row => {
    if (Array.isArray(row)) return row.some(c => c && String(c).trim() && String(c).trim() !== "—");
    if (typeof row === "string") return row.split(",").some(c => c.trim() && c.trim() !== "—");
    return false;
  });
  return validRows.length > 0;
}

function makeTableXml(headers, rows, docStyles) {
  // Safety: skip empty tables entirely
  if (!hasTableData(headers, rows)) return "";

  const ts = (docStyles || DEFAULT_DOC_STYLES).table || DEFAULT_DOC_STYLES.table;
  const bs = (docStyles || DEFAULT_DOC_STYLES).paragraph || (docStyles || DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const font = ts.font || bs.font || "Times New Roman";
  const szHp = pt2hp(ts.size || bs.size || 11);
  const bodyCol = hexCol(ts.color || bs.color || "#000000");
  const hdrBg = hexCol(ts.headerBg || "#1e3a8a");
  const hdrCol = hexCol(ts.headerColor || "#ffffff");
  const altBg = ts.rowAltBg ? hexCol(ts.rowAltBg) : "EFF6FF";
  const bdrCol = ts.borderColor ? hexCol(ts.borderColor) : "374151";
  const ls = ls2dxa(ts.lineSpacing || 1.15);
  const aft = pt2dxa(4);

  const hArr = Array.isArray(headers) && headers.length ? headers : ["Column 1", "Column 2"];
  const n = hArr.length;
  // Use percentage-based total width (5000 = 100% in OOXML fiftieths-of-percent)
  // Column widths in dxa for grid — still needed for tblGrid even with pct table
  const totalW = 9026;
  const colWidths = Array(n).fill(Math.floor(totalW / n));
  // Distribute remainder to last column to avoid rounding gaps
  const remainder = totalW - Math.floor(totalW / n) * n;
  colWidths[n - 1] += remainder;

  const gridCols = colWidths.map(w => `<w:gridCol w:w="${w}"/>`).join("");
  // 115 twips (~0.08") padding on all sides — spacious but not loose
  const cellMar = `<w:tcMar><w:top w:w="115" w:type="dxa"/><w:left w:w="115" w:type="dxa"/><w:bottom w:w="115" w:type="dxa"/><w:right w:w="115" w:type="dxa"/></w:tcMar>`;
  const borderXml = `<w:top w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:left w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:bottom w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:right w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:insideH w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/><w:insideV w:val="single" w:sz="12" w:space="0" w:color="${bdrCol}"/>`;
  const pPr = `<w:pPr><w:spacing w:line="${ls}" w:lineRule="auto" w:after="60"/><w:jc w:val="left"/></w:pPr>`;
  const hRpr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:b/><w:bCs/><w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${hdrCol}"/></w:rPr>`;
  const bRpr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/><w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="${bodyCol}"/></w:rPr>`;

  const makeCell = (text, rpr, w, fill) => {
    const cellText = text != null ? String(text).trim() : "";
    const shd = fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : "";
    return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:vAlign w:val="top"/>${shd}${cellMar}</w:tcPr><w:p>${pPr}<w:r>${rpr}<w:t>${xmlEsc(cellText)}</w:t></w:r></w:p></w:tc>`;
  };

  const hdrRow = `<w:tr><w:trPr><w:tblHeader/><w:trHeight w:val="400" w:type="atLeast"/></w:trPr>${hArr.map((h, ci) => makeCell(h, hRpr, colWidths[ci], hdrBg)).join("")}</w:tr>`;

  let dataRows = "";
  // Bulletproof safety splitter: handles string blobs, CSV, nested arrays, quoted cells
  const cleanCell = v => String(v ?? "").trim().replace(/^["']|["']$/g, "").replace(/[\t\u00A0]/g, " ").trim();
  const safeRows = (() => {
    if (!rows) return [];
    let r = rows;
    // Coerce non-array: try JSON parse, then newline-split
    if (!Array.isArray(r)) {
      const s = typeof r === "string" ? r.trim() : "";
      if (!s) return [];
      try { const p = JSON.parse(s); r = Array.isArray(p) ? p : [p]; }
      catch (_) { r = s.split("\n").map(x => x.trim()).filter(Boolean); }
    }
    return r.map(row => {
      if (Array.isArray(row)) return row.map(cleanCell);
      if (typeof row === "string" && row.trim()) return row.split(",").map(cleanCell);
      return [];
    }).filter(row => row.some(c => c && c !== "—"));
  })();
  if (safeRows.length > 0) {
    dataRows = safeRows.map((row, ri) => {
      const shade = ri % 2 === 1 ? "EFF6FF" : "";
      const cells = [];
      for (let ci = 0; ci < n; ci++) {
        const cellVal = row[ci] != null ? String(row[ci]) : "";
        cells.push(makeCell(cellVal, bRpr, colWidths[ci], shade));
      }
      return `<w:tr><w:trPr><w:trHeight w:val="300" w:type="atLeast"/></w:trPr>${cells.join("")}</w:tr>`;
    }).join("\n");
  }

  return `<w:tbl>
  <w:tblPr>
    <w:tblW w:w="5000" w:type="pct"/>
    <w:tblBorders>${borderXml}</w:tblBorders>
    <w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar>
  </w:tblPr>
  <w:tblGrid>${gridCols}</w:tblGrid>
  ${hdrRow}
  ${dataRows}
</w:tbl>`;
}

function makeColumnsXml(texts, numCols, docStyles) {
  // Render each column's text as sequential paragraphs (vertical, no side-by-side).
  // Uses makeRichParaXml so **bold** / _italic_ markdown renders correctly.
  const n = Math.min(Math.max(numCols || 2, 2), 3);
  const arr = Array.isArray(texts) ? texts : Array(n).fill("");
  return arr.slice(0, n).flatMap(textOrArr => {
    let paras;
    if (Array.isArray(textOrArr)) {
      paras = textOrArr.flatMap(v => Array.isArray(v) ? v.map(String) : [String(v ?? "")]).filter(Boolean);
    } else {
      paras = [String(textOrArr ?? "")];
    }
    if (!paras.length) paras = [""];
    return paras.map(t => makeRichParaXml(t, "paragraph", docStyles));
  }).join("\n");
}

function makeHyperlinkXml(text, url, rId, bold, italic, docStyles) {
  const s = (docStyles || DEFAULT_DOC_STYLES).paragraph || (docStyles || DEFAULT_DOC_STYLES).body || DEFAULT_DOC_STYLES.paragraph;
  const font = s.font || "Times New Roman";
  const szHp = pt2hp(s.size);
  const ls = ls2dxa(s.lineSpacing || 1.5);
  const aft = pt2dxa(s.marginBottom || 8);
  const b = bold ? "<w:b/><w:bCs/>" : "";
  const i = italic ? "<w:i/><w:iCs/>" : "";
  const pPr = `<w:pPr><w:spacing w:line="${ls}" w:lineRule="auto" w:after="${aft}"/></w:pPr>`;
  const rPr = `<w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>${b}${i}<w:sz w:val="${szHp}"/><w:szCs w:val="${szHp}"/><w:color w:val="1155CC"/><w:u w:val="single"/></w:rPr>`;
  const displayText = xmlEsc(text || url || "Link");
  if (!rId) return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${displayText}</w:t></w:r></w:p>`;
  const safeUrl = sanitizeUrl(url);
  if (!safeUrl) return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${displayText}</w:t></w:r></w:p>`;
  return `<w:p>${pPr}<w:hyperlink r:id="${rId}" w:history="1"><w:r>${rPr}<w:t xml:space="preserve">${displayText}</w:t></w:r></w:hyperlink></w:p>`;
}

function makeImagePlaceholderXml() {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="160"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/><w:left w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/><w:bottom w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/><w:right w:val="single" w:sz="4" w:space="1" w:color="9CA3AF"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:pPr><w:r><w:rPr><w:color w:val="9CA3AF"/><w:sz w:val="22"/></w:rPr><w:t>[ Image Placeholder — replace in Word ]</w:t></w:r></w:p>`;
}

function makeImageXml(rId, widthEmu, heightEmu, picId) {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="80"/></w:pPr>
<w:r><w:drawing>
<wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
  <wp:effectExtent l="0" t="0" r="0" b="0"/>
  <wp:docPr id="${picId}" name="Image${picId}"/>
  <wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
  <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
      <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <pic:nvPicPr>
          <pic:cNvPr id="${picId}" name="Image${picId}"/>
          <pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr>
        </pic:nvPicPr>
        <pic:blipFill>
          <a:blip r:embed="${rId}"/>
          <a:stretch><a:fillRect/></a:stretch>
        </pic:blipFill>
        <pic:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </pic:spPr>
      </pic:pic>
    </a:graphicData>
  </a:graphic>
</wp:inline>
</w:drawing></w:r></w:p>`;
}

function buildNumberingXml(bulletCfg) {
  const cfg = bulletCfg || DEFAULT_DOC_STYLES.bullets;
  const def = BULLET_STYLES[cfg.styleName] || BULLET_STYLES["Disc (•)"];
  const indL = cfg.indentLeft || 720;
  const hang = cfg.hanging || 360;
  const subNames = ["Circle (○)", "Square (▪)", "Dash (–)", "Disc (•)"];
  const subName = subNames.find(n => n !== cfg.styleName) || "Circle (○)";
  const sub = BULLET_STYLES[subName];
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="${def.numFmt}"/>
      <w:lvlText w:val="${def.lvlText}"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:ind w:left="${indL}" w:hanging="${hang}"/>
      </w:pPr>
      <w:rPr><w:rFonts w:ascii="${def.font}" w:hAnsi="${def.font}" w:cs="${def.font}"/></w:rPr>
    </w:lvl>
    <w:lvl w:ilvl="1">
      <w:start w:val="1"/>
      <w:numFmt w:val="${sub.numFmt}"/>
      <w:lvlText w:val="${sub.lvlText}"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:ind w:left="${indL + 360}" w:hanging="${hang}"/>
      </w:pPr>
      <w:rPr><w:rFonts w:ascii="${sub.font}" w:hAnsi="${sub.font}" w:cs="${sub.font}"/></w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`;
}

const CONTENT_WIDTH_EMU = 5731510; // A4 content width in EMU (9026 twips × 635)

async function buildDocx(elements, docStyles) {
  const JSZip = window.JSZip;
  if (!JSZip) throw new Error("JSZip not loaded yet.");
  const styles = docStyles || DEFAULT_DOC_STYLES;

  // Collect media elements for relationship building
  const SAFE_IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
  const getSafeExt = (el) => {
    const raw = (el.imageType || "png").toLowerCase().replace(/[^a-z]/g, "");
    return SAFE_IMAGE_EXTS.has(raw) ? raw : "png";
  };
  const imageEls = elements.filter(el => el.type === "image" && el.imageData);
  const hyperlinkEls = elements.filter(el => el.type === "hyperlink" && el.url);

  let nextRId = 3; // rId1=styles, rId2=numbering
  const imgRIdMap = new Map();
  imageEls.forEach(el => imgRIdMap.set(el.id, `rId${nextRId++}`));
  const hlRIdMap = new Map();
  hyperlinkEls.forEach(el => hlRIdMap.set(el.id, `rId${nextRId++}`));

  const paras = [];
  let picIdCounter = 1;

  for (const el of elements) {
    if (el.type === "body" || el.type === "paragraph") {
      // Fix: always iterate array; detect & handle accidentally stringified JSON arrays
      let texts = Array.isArray(el.texts) ? el.texts : [el.text || ""];
      texts = texts.flatMap(t => {
        // Coerce non-strings (e.g. accidentally nested arrays or objects)
        if (Array.isArray(t)) return t.map(v => String(v || "")).filter(Boolean);
        const s = String(t ?? "");
        if (s.trimStart().startsWith("[")) {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
          } catch (_) { }
        }
        return [s];
      });
      texts.forEach(t => paras.push(makeRichParaXml(String(t), "paragraph", styles)));
    } else if (el.type === "bullets") {
      const items = Array.isArray(el.items) ? el.items : [el.text || "Bullet item"];
      paras.push(makeBulletXml(items, styles));
    } else if (el.type === "hr") {
      paras.push(makeHrXml());
    } else if (el.type === "table") {
      if (hasTableData(el.headers || [], el.rows || [])) {
        paras.push(makeTableXml(el.headers || [], el.rows || [], styles));
      }
    } else if (el.type === "columns") {
      paras.push(makeColumnsXml(Array.isArray(el.texts) ? el.texts : [], el.cols || 2, styles));
    } else if (el.type === "hyperlink") {
      const rId = hlRIdMap.get(el.id) || null;
      paras.push(makeHyperlinkXml(el.text || "", el.url || "", rId, el.bold, el.italic, styles));
    } else if (el.type === "image") {
      if (el.imageData) {
        const rId = imgRIdMap.get(el.id);
        const pct = (el.width || 80) / 100;
        const widthEmu = Math.round(CONTENT_WIDTH_EMU * pct);
        const ratio = (el.imgH || 9) / (el.imgW || 16);
        const heightEmu = Math.round(widthEmu * ratio);
        paras.push(makeImageXml(rId, widthEmu, heightEmu, picIdCounter++));
      } else {
        paras.push(makeImagePlaceholderXml());
      }
      if (el.caption && el.caption.trim()) {
        const capFont = (styles.paragraph || styles.body)?.font || "Times New Roman";
        const capSz = pt2hp(((styles.paragraph || styles.body)?.size || 12) - 1);
        paras.push(`<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="${capFont}" w:hAnsi="${capFont}"/><w:i/><w:sz w:val="${capSz}"/><w:color w:val="4B5563"/></w:rPr><w:t xml:space="preserve">${xmlEsc(el.caption)}</w:t></w:r></w:p>`);
      }
    } else {
      // Handle texts array (e.g. body blocks stored with texts instead of text)
      if (Array.isArray(el.texts) && el.texts.length > 0) {
        el.texts.forEach(t => paras.push(makeRichParaXml(String(t ?? ""), el.type, styles)));
      } else {
        paras.push(makeRichParaXml(el.text || "", el.type, styles));
      }
    }
  }

  // Page margins: convert inches → twips (1 inch = 1440 twips)
  // Coerce to float — number inputs can return strings
  const pm = styles.pageMargins || DEFAULT_DOC_STYLES.pageMargins;
  const pmTop = Math.round((parseFloat(pm.top) || 1.0) * 1440);
  const pmBottom = Math.round((parseFloat(pm.bottom) || 1.0) * 1440);
  const pmLeft = Math.round((parseFloat(pm.left) || 1.0) * 1440);
  const pmRight = Math.round((parseFloat(pm.right) || 1.0) * 1440);

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<w:body>
${paras.join("\n")}
<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/>
  <w:pgMar w:top="${pmTop}" w:right="${pmRight}" w:bottom="${pmBottom}" w:left="${pmLeft}" w:header="709" w:footer="709" w:gutter="0"/>
</w:sectPr>
</w:body>
</w:document>`;

  const paraS = styles.paragraph || styles.body || DEFAULT_DOC_STYLES.paragraph;
  const bodyFont = paraS.font || "Times New Roman";
  const bodySz = pt2hp(paraS.size || 12);
  const bodyCol = hexCol(paraS.color || "#000000");
  const bodyLs = ls2dxa(paraS.lineSpacing || 1.5);
  const bodyAft = pt2dxa(paraS.marginBottom || 8);
  const bodyJc = wAlign(paraS.align || "justify");

  const h1s = (docStyles || DEFAULT_DOC_STYLES).h1 || DEFAULT_DOC_STYLES.h1;
  const h2s = (docStyles || DEFAULT_DOC_STYLES).h2 || DEFAULT_DOC_STYLES.h2;
  const titS = (docStyles || DEFAULT_DOC_STYLES).title || DEFAULT_DOC_STYLES.title;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr>
      <w:spacing w:line="360" w:lineRule="auto" w:after="${bodyAft}"/>
    </w:pPr></w:pPrDefault>
  </w:docDefaults>

  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr>
      <w:spacing w:line="${bodyLs}" w:lineRule="auto" w:after="${bodyAft}"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="ProfessionalBody">
    <w:name w:val="ProfessionalBody"/>
    <w:pPr>
      <w:jc w:val="${bodyJc}"/>
      <w:spacing w:line="360" w:lineRule="auto" w:after="${bodyAft}"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:uiPriority w:val="34"/>
    <w:qFormat/>
    <w:pPr>
      <w:ind w:left="${(docStyles || DEFAULT_DOC_STYLES).bullets?.indentLeft || 720}"/>
      <w:contextualSpacing/>
      <w:spacing w:line="${ls2dxa((docStyles || DEFAULT_DOC_STYLES).bullets?.lineSpacing || paraS.lineSpacing || 1.5)}" w:lineRule="auto" w:after="${pt2dxa((docStyles || DEFAULT_DOC_STYLES).bullets?.itemSpacingAfter ?? 6)}"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${bodyFont}" w:hAnsi="${bodyFont}" w:cs="${bodyFont}"/>
      <w:sz w:val="${bodySz}"/><w:szCs w:val="${bodySz}"/>
      <w:color w:val="${bodyCol}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:uiPriority w:val="9"/>
    <w:unhideWhenUsed/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="${pt2dxa(h1s.marginTop || 16)}" w:after="${pt2dxa(h1s.marginBottom || 6)}" w:line="276" w:lineRule="auto"/>
      <w:outlineLvl w:val="0"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${h1s.font || "Arial"}" w:hAnsi="${h1s.font || "Arial"}" w:cs="${h1s.font || "Arial"}"/>
      ${h1s.bold !== false ? "<w:b/><w:bCs/>" : ""}
      <w:sz w:val="${pt2hp(h1s.size || 18)}"/><w:szCs w:val="${pt2hp(h1s.size || 18)}"/>
      <w:color w:val="${hexCol(h1s.color || "#000000")}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:uiPriority w:val="9"/>
    <w:unhideWhenUsed/>
    <w:qFormat/>
    <w:pPr>
      <w:keepNext/>
      <w:spacing w:before="${pt2dxa(h2s.marginTop || 10)}" w:after="${pt2dxa(h2s.marginBottom || 4)}" w:line="276" w:lineRule="auto"/>
      <w:outlineLvl w:val="1"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${h2s.font || "Arial"}" w:hAnsi="${h2s.font || "Arial"}" w:cs="${h2s.font || "Arial"}"/>
      ${h2s.bold !== false ? "<w:b/><w:bCs/>" : ""}
      <w:sz w:val="${pt2hp(h2s.size || 14)}"/><w:szCs w:val="${pt2hp(h2s.size || 14)}"/>
      <w:color w:val="${hexCol(h2s.color || "#000000")}"/>
    </w:rPr>
  </w:style>

  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:uiPriority w:val="10"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="${pt2dxa(titS.marginTop || 0)}" w:after="${pt2dxa(titS.marginBottom || 12)}" w:line="276" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="${titS.font || "Arial"}" w:hAnsi="${titS.font || "Arial"}" w:cs="${titS.font || "Arial"}"/>
      ${titS.bold !== false ? "<w:b/><w:bCs/>" : ""}
      <w:sz w:val="${pt2hp(titS.size || 24)}"/><w:szCs w:val="${pt2hp(titS.size || 24)}"/>
      <w:color w:val="${hexCol(titS.color || "#000000")}"/>
    </w:rPr>
  </w:style>
</w:styles>`;

  // Build dynamic relationships
  const imgRels = imageEls.map(el => {
    const rId = imgRIdMap.get(el.id);
    const ext = getSafeExt(el);
    return `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${el.id}.${ext}"/>`;
  }).join("\n  ");

  const hlRels = hyperlinkEls.map(el => {
    const rId = hlRIdMap.get(el.id);
    const safeUrl = sanitizeUrl(el.url);
    if (!safeUrl) return "";
    return `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${attrEsc(safeUrl)}" TargetMode="External"/>`;
  }).filter(Boolean).join("\n  ");

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  ${imgRels}${hlRels}
</Relationships>`;

  const hasImages = imageEls.length > 0;
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasImages ? '<Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="jpeg" ContentType="image/jpeg"/>' : ""}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;

  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypesXml);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/_rels/document.xml.rels", docRelsXml);
  zip.file("word/document.xml", docXml);
  zip.file("word/styles.xml", stylesXml);
  zip.file("word/numbering.xml", buildNumberingXml((docStyles || DEFAULT_DOC_STYLES).bullets));

  // Embed image files as base64
  for (const el of imageEls) {
    const ext = getSafeExt(el);
    const b64 = el.imageData.includes(",") ? el.imageData.split(",")[1] : el.imageData;
    zip.file(`word/media/${el.id}.${ext}`, b64, { base64: true });
  }

  return zip.generateAsync({ type: "uint8array", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", compression: "DEFLATE", compressionOptions: { level: 6 } });
}


export { buildDocx, hasTableData };
