let _uid = 0;
const uid = () => ++_uid;
const xmlEsc = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attrEsc = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pt2hp = pt => Math.round(pt * 2);
const pt2dxa = pt => Math.round(pt * 20);
const ls2dxa = ls => Math.round(ls * 240);
const hexCol = c => (c || "#000000").replace("#", "").toUpperCase();
const wAlign = a => a === "justify" ? "both" : a === "right" ? "end" : a === "center" ? "center" : "start";

const SAFE_URL_SCHEMES = /^https?:\/\//i;
const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  return SAFE_URL_SCHEMES.test(trimmed) ? trimmed : "";
};

const VALID_TEMPLATE_TYPES = new Set(["title", "h1", "h2", "paragraph", "body", "bullets", "hr", "table", "columns"]);

function toStr(v, fallback = "") {
  if (v === null || v === undefined) return fallback;
  return String(v).trim();
}

function toArr(v) {
  return Array.isArray(v) ? v : [];
}

function uniqueByIdKeepLast(arr) {
  const map = new Map();
  arr.forEach(item => map.set(Number(item.id), item));
  return [...map.values()];
}

function normalizeTemplate(rawTemplate) {
  const input = Array.isArray(rawTemplate) ? rawTemplate : [];
  const normalized = input
    .map((el, idx) => {
      const type = VALID_TEMPLATE_TYPES.has(el?.type) ? (el.type === "body" ? "paragraph" : el.type) : "paragraph";
      const base = { id: uid(), type };

      if (type === "title") return { ...base, text: toStr(el?.text, "Document Title") };
      if (type === "h1") return { ...base, text: toStr(el?.text, `Section ${idx + 1}`) };
      if (type === "h2") return { ...base, text: toStr(el?.text, `Subsection ${idx + 1}`) };
      if (type === "paragraph") return { ...base, text: toStr(el?.text, "Describe what this paragraph covers…") };
      if (type === "hr") return { ...base };
      if (type === "bullets") {
        const items = toArr(el?.items).map(i => toStr(i)).filter(Boolean).slice(0, 8);
        return { ...base, items: items.length ? items : ["First point", "Second point", "Third point"] };
      }
      if (type === "table") {
        const headers = toArr(el?.headers).map(h => toStr(h)).filter(Boolean);
        const rows = toArr(el?.rows).map(row => toArr(row).map(c => toStr(c)));
        const rowCount = Number(el?.rowCount || el?.row_count || el?.numRows || el?.num_rows) || 0;
        const finalRowCount = rowCount > 0 ? Math.min(rowCount, 20) : Math.max(rows.length, 3);
        return { ...base, headers: headers.length ? headers : ["Column 1", "Column 2", "Column 3"], rows, rowCount: finalRowCount };
      }
      if (type === "columns") {
        const cols = Math.min(Math.max(Number(el?.cols) || 2, 2), 3);
        const texts = toArr(el?.texts).map(t => toStr(t)).slice(0, cols);
        while (texts.length < cols) texts.push(`Column ${texts.length + 1} — describe content here`);
        return { ...base, cols, texts };
      }
      return base;
    })
    .filter(el => !!el.type);

  const hasTitle = normalized.some(el => el.type === "title");
  if (!hasTitle) normalized.unshift({ id: uid(), type: "title", text: "Document Title" });

  const firstTitle = normalized.find(el => el.type === "title");
  const withTitleFirst = [firstTitle, ...normalized.filter(el => el !== firstTitle && el.type !== "title")];

  return withTitleFirst.slice(0, 40);
}

function normalizeContentForDoc(template, rawContent) {
  const incoming = uniqueByIdKeepLast(toArr(rawContent));
  const byId = new Map(incoming.map(item => [Number(item.id), item]));

  const asBulletItems = (value, fallbackItems = []) => {
    const arr = Array.isArray(value) ? value : [];
    const fromArray = arr.map(v => toStr(v)).filter(Boolean);
    if (fromArray.length) return fromArray.slice(0, 12);
    if (typeof value === "string") {
      const split = value.split(/\n|•|- /g).map(v => toStr(v)).filter(Boolean);
      if (split.length) return split.slice(0, 12);
    }
    return fallbackItems.length ? fallbackItems : ["Point 1", "Point 2", "Point 3"];
  };

  return template.map(el => {
    const match = byId.get(Number(el.id));
    if (!match) return el;

    // Non-AI-filled structural types — never overwrite with AI content
    if (["title", "h1", "h2", "hr"].includes(el.type)) return el;

    if (el.type === "bullets") {
      return { ...el, items: asBulletItems(match.items, toArr(el.items).map(v => toStr(v)).filter(Boolean)) };
    }
    if (el.type === "table") {
      const n = (el.headers || []).length || 2;
      const expected = el.rowCount || 3;
      const headerSet = new Set((el.headers || []).map(h => String(h).toLowerCase().trim()));

      // Bulletproof cell cleaner: strip surrounding quotes, whitespace, tabs, NBSPs
      const cleanCell = v => String(v ?? "")
        .trim()
        .replace(/^["']|["']$/g, "")   // strip wrapping quotes LLMs sometimes emit
        .replace(/[\t\u00A0]/g, " ")   // tabs and non-breaking spaces → regular space
        .trim();

      // Normalize rows: accept nested arrays, array of CSV strings, OR one big CSV/newline blob
      let rawRows = match.rows;

      // If it's not an array at all, try to coerce from string
      if (!Array.isArray(rawRows)) {
        const s = typeof rawRows === "string" ? rawRows.trim() : "";
        if (s) {
          // Try JSON array first (LLM sometimes sends stringified JSON)
          try {
            const parsed = JSON.parse(s);
            rawRows = Array.isArray(parsed) ? parsed : [parsed];
          } catch (_) {
            // Fall back: split on newlines
            rawRows = s.split("\n").map(r => r.trim()).filter(Boolean);
          }
        } else {
          rawRows = [];
        }
      }

      const normalizedRows = rawRows.map(row => {
        if (Array.isArray(row)) return row.map(cleanCell);
        if (typeof row === "string" && row.trim()) {
          // Split on comma but respect quoted fields (simple greedy split is fine for LLM output)
          return row.split(",").map(cleanCell);
        }
        return [];
      }).filter(row => row.length > 0);

      const aiRows = normalizedRows.map(cells => {
        while (cells.length < n) cells.push("—");
        return cells.slice(0, n).map(c => c.trim() || "—");
      }).filter(row => {
        if (!row.some(c => c !== "—")) return false;
        const allMatchHeader = row.every(c => headerSet.has(c.toLowerCase().trim()));
        return !allMatchHeader;
      });

      // Only pad if we actually got some real rows from AI
      const finalRows = [...aiRows];
      if (finalRows.length > 0) {
        while (finalRows.length < expected) {
          finalRows.push(Array(n).fill("—"));
        }
      }
      return { ...el, rows: finalRows.slice(0, expected) };
    }
    if (el.type === "columns") {
      const numCols = el.cols || 2;
      const aiTexts = toArr(match.texts).map(v => toStr(v));
      // Merge: use AI text per column if present, else keep existing hint
      const merged = Array(numCols).fill(null).map((_, i) =>
        (aiTexts[i] && aiTexts[i].trim()) ? aiTexts[i] : (toStr((el.texts || [])[i]) || `Column ${i + 1}`)
      );
      return { ...el, texts: merged };
    }
    // body and all other AI-fillable text types
    const texts = toArr(match.texts).map(v => toStr(v)).filter(Boolean);
    return { ...el, texts: texts.length ? texts : [toStr(el.text, "Content not generated.")] };
  });
}


export { uid, xmlEsc, attrEsc, pt2hp, pt2dxa, ls2dxa, hexCol, wAlign, sanitizeUrl, VALID_TEMPLATE_TYPES, toStr, toArr, uniqueByIdKeepLast, normalizeTemplate, normalizeContentForDoc };
