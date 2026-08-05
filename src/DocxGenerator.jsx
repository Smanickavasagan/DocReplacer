import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_DOC_STYLES, C, BULLET_STYLES, BULLET_STYLE_NAMES, DOC_TYPES } from './Utility/constants.js';
import { streamOpenAI, callOpenAI, groqRequest } from './Utility/groq.js';
import { sanitiseJsonStr, repairTruncated, safeParseJSON, extractObjects } from './Utility/jsonParser.js';
import { buildDocx, hasTableData } from './Utility/docxBuilder.js';


function DocPreviewModal({ uint8, title, onClose }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const run = async () => {
      if (!window.docx) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/docx-preview@0.3.6/dist/docx-preview.min.js";
          // NOTE: unpkg does not provide SRI hashes. To harden this further, self-host
          // docx-preview and add a proper integrity hash.
          s.crossOrigin = "anonymous";
          s.onload = res;
          s.onerror = () => rej(new Error("Failed to load docx-preview"));
          document.head.appendChild(s);
        });
      }
      if (!containerRef.current) return;
      try {
        if (!document.getElementById("dr-preview-css")) {
          const st = document.createElement("style");
          st.id = "dr-preview-css";
          st.textContent = [
            `.dr-modal-wrap * { box-sizing: border-box; margin: 0; padding: 0; }`,
            `.dr-preview { display: flex; flex-direction: column; align-items: center; padding: 24px 16px; background: #f1f5f9; min-height: 100%; }`,
            `.dr-preview section.docx { width: 100% !important; max-width: 800px; margin: 0 auto 20px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.18) !important; border-radius: 4px; background: #fff; }`,
          ].join("\n");
          document.head.appendChild(st);
        }
        const blob = new Blob([uint8], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        await window.docx.renderAsync(blob, containerRef.current, null, {
          className: "dr-preview",
          inWrapper: true,
          ignoreWidth: true,
          ignoreHeight: false,
          breakPages: true,
          useBase64URL: true,
        });
      } catch (e) {
        setError("Preview failed: " + e.message);
      }
      setLoading(false);
    };
    run();
  }, [uint8]);

  const modal = (
    <div
      className="dr-modal-wrap"
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        background: "rgba(15,23,42,0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        position: "relative",
        width: "100%", maxWidth: "860px",
        height: "92vh",
        display: "flex", flexDirection: "column",
        background: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14,
            }}>◈</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1 }}>Document Preview</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginTop: 3, maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: "1.5px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff", fontSize: 20, lineHeight: 1,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >&times;</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", background: "#f1f5f9" }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid #dbeafe", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
              <div style={{ color: "#475569", fontWeight: 700, fontSize: 14 }}>Rendering document…</div>
              <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
            </div>
          )}
          {error && (
            <div style={{ margin: "40px auto", maxWidth: 480, textAlign: "center", color: "#dc2626", padding: 24, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Failed to render</div>
              <div style={{ fontSize: 13 }}>{error}</div>
            </div>
          )}
          <div ref={containerRef} style={{ display: loading ? "none" : "block", width: "100%" }} />
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Press Esc or click outside to close</span>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px", borderRadius: 10,
              background: "#1e293b", color: "#fff",
              border: "none", fontWeight: 700, fontSize: 13,
              cursor: "pointer",
            }}
          >Close ×</button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}




function LoadingOverlay({ phase }) {
  const msg = phase === "template" ? "Streaming from AI…" : phase === "docx" ? "Assembling .docx file…" : "Working…";
  return (
    <div className="fixed inset-0 z-[9000] bg-slate-900/50 backdrop-blur-md flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-[24px] py-10 px-12 flex flex-col items-center gap-5 shadow-[0_24px_64px_rgba(0,0,0,0.2)]">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <div className="text-lg font-bold text-slate-900 tracking-tight">{msg}</div>
        <div className="text-[12px] text-slate-400 font-medium">This may take a moment…</div>
      </div>
    </div>
  );
}





function Step1Prompt({ onDone, setLoadingPhase }) {
  const [prompt, setPrompt] = useState("");
  const [docType, setDocType] = useState("professional");
  const [pages, setPages] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [streamLog, setStreamLog] = useState("");
  const abortRef = useRef(false);
  const understandingRef = useRef(null); // holds Phase 0 result — subject/kind source of truth for all later prompts

  // Words per page on A4 ~350. Each body block = 1 paragraph.
  const wordsPerPara = pages <= 2 ? 120 : pages <= 4 ? 150 : 180;

  // Parse subtopics from prompt: lines/commas after a keyword like "subtopics:", "sections:", or a dash list
  const parsedSubtopics = (() => {
    const t = prompt.trim();
    // Match "subtopics: x, y, z" or "sections: x, y, z" or "topics: x, y, z"
    const kwMatch = t.match(/(?:subtopics?|sections?|topics?)\s*[:=]\s*(.+)/i);
    if (kwMatch) return kwMatch[1].split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
    // Match bullet/dash list lines: "- item" or "* item"
    const dashLines = t.split('\n').filter(l => /^\s*[-*•]\s+\S/.test(l)).map(l => l.replace(/^\s*[-*•]\s+/, '').trim());
    if (dashLines.length >= 2) return dashLines;
    return null;
  })();

  let _nid = 0;
  const nid = () => ++_nid;

  /* ── JSON repair helper (only used for bullets/tables) ── */
  const parseJsonRobust = (raw) => {
    // Step 0: Strip markdown code fences entirely (LLMs sometimes wrap output in ```json ... ```)
    let clean = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    // Strip leading prose before first [ or {
    const fb = clean.search(/[\[{]/);
    if (fb > 0) clean = clean.slice(fb);
    // Also strip anything after the last matching ] or }
    const lastClose = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
    if (lastClose !== -1 && lastClose < clean.length - 1) clean = clean.slice(0, lastClose + 1);
    // 1. Direct parse
    try { return JSON.parse(clean); } catch (_) { }
    // 2. sanitiseJsonStr (handles unescaped newlines/tabs/quotes inside strings + smart quotes + trailing commas)
    try { return JSON.parse(sanitiseJsonStr(clean)); } catch (_) { }
    // 3. Extract outermost [...] or {...}
    const m = clean.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!m) throw new Error("AI returned no JSON. The model may be overloaded — please try again.");
    const s = m[0];
    // 4. sanitise extracted block
    try { return JSON.parse(sanitiseJsonStr(s)); } catch (_) { }
    // 5. repair truncation then sanitise
    try { return JSON.parse(sanitiseJsonStr(repairTruncated(s))); } catch (_) { }
    throw new Error("AI response could not be parsed. Please try again.");
  };

  /* ── PHASE 0: understand the user's raw request before planning anything ── */
  const understandPrompt = async () => {
    const p =
      `You are an intake analyst for a document-generation system. Your ONLY job is to read the user's raw, possibly messy request and extract structured intent. Do NOT write any document content yet.

User's raw request: "${prompt.trim()}"
Selected document style: ${docType}

Extract:
- subject: the real-world subject/entity this document is about, with instruction verbs stripped (e.g. "Coffee Shop", not "create me a proposal for coffee shop")
- documentTitle: a professional title for the finished document. Title Case, 3–8 words, no quotes, no trailing punctuation. Strip command verbs ("create me a", "write", "generate", "make", "I need", "can you", "please") and filler ("a document for", "about", "regarding"). Do NOT copy the user's sentence structure.
- documentKind: the type of document being requested (e.g. "proposal", "report", "business plan", "case study", "SOW", "brief"). Infer it even if the user didn't say it explicitly.
- audience: who this document is likely for (e.g. "prospective client", "internal stakeholders", "investors"). Infer a sensible default if not stated.
- tone: one of "formal" | "professional" | "conversational" | "persuasive" — infer from docType and phrasing.
- keyRequirements: array of explicit asks the user made (e.g. "include a competitor comparison table", "focus on growth strategy"). Empty array if none.

Examples:
Input: "create me a Proposal for Coffee Shop"
Output: {"subject":"Coffee Shop","documentTitle":"Coffee Shop Business Proposal","documentKind":"proposal","audience":"prospective client or investor","tone":"persuasive","keyRequirements":[]}

Input: "write a report about our Q3 marketing performance, include a chart of ad spend by channel"
Output: {"subject":"Q3 Marketing Performance","documentTitle":"Q3 Marketing Performance Report","documentKind":"report","audience":"internal stakeholders","tone":"professional","keyRequirements":["include ad spend by channel data"]}

ONLY valid JSON, no markdown fences, no extra text:
{"subject":"...","documentTitle":"...","documentKind":"...","audience":"...","tone":"...","keyRequirements":[]}
JSON:`;

    let raw = "";
    const gen = streamOpenAI("", p, { max_tokens: 300, temperature: 0.2, onStatus: setStreamLog });
    for await (const chunk of gen) {
      if (abortRef.current) return null;
      raw += chunk;
      setStreamLog("Understanding your request…");
    }

    let understanding = null;
    try { understanding = parseJsonRobust(raw); } catch (_) { }

    // If the model fails to return usable JSON, fall back gracefully instead of blocking the flow —
    // the downstream cleanTitle() safety net still protects the title even in this degraded path.
    if (!understanding || typeof understanding !== "object") {
      understanding = {
        subject: prompt.trim(),
        documentTitle: prompt.trim(),
        documentKind: "document", // generic fallback — NEVER the style selector, that caused the "Documentation" bug
        audience: "",
        tone: docType,
        keyRequirements: [],
      };
    }
    understanding.documentTitle = cleanTitle(understanding.documentTitle, prompt);
    understanding.keyRequirements = Array.isArray(understanding.keyRequirements) ? understanding.keyRequirements.map(String).filter(Boolean) : [];
    return understanding;
  };

  /* ── Defense-in-depth: strip leaked meta-language if the model still echoes the raw prompt ── */
  const cleanTitle = (rawTitle, originalPrompt) => {
    let t = String(rawTitle || "").trim().replace(/^["'“”]+|["'“”]+$/g, "");
    // If the model basically returned the raw prompt back, strip common instruction verbs/fillers
    const leadingCommand = /^(create|write|generate|make|draft|build|prepare|design)\s+(me\s+)?(a|an|the)?\s*/i;
    const fillerPhrases = /\b(for me|please|can you|i need|i want|document for|regarding)\b/gi;
    if (leadingCommand.test(t) || t.toLowerCase() === originalPrompt.trim().toLowerCase()) {
      t = t.replace(leadingCommand, "").replace(fillerPhrases, "").trim();
    }
    // Title-case cleanup + trim trailing punctuation
    t = t.replace(/[.!?]+$/, "").trim();
    if (!t) t = "Document";
    // Cap runaway lengths (model ignoring the 3–8 word guidance)
    const words = t.split(/\s+/);
    if (words.length > 10) t = words.slice(0, 10).join(" ");
    return t;
  };

  /* ── PHASE 1: fast outline (plan), built from the understood intent, not the raw prompt ── */
  const getOutline = async (understanding) => {
    const userSections = parsedSubtopics;
    const targetSectionCount = userSections
      ? userSections.length
      : pages <= 2 ? 3 : pages <= 4 ? 5 : pages <= 6 ? 6 : 8;

    const densityNote = pages <= 2
      ? `SHORT doc (${pages}p): prose only, no columns, minimal bullets, max 1 table.`
      : pages <= 4
        ? `STANDARD doc (${pages}p): 1–2 bullet sections, max 1 table, h2s only where needed.`
        : pages <= 7
          ? `DETAILED doc (${pages}p): h2 subsections, 1 table, 2–3 bullet sections, optionally 1 columns.`
          : `COMPREHENSIVE doc (${pages}p): rich structure — h2s, tables, bullets, columns, hr dividers.`;

    const sectionInstruction = userSections
      ? `Sections: EXACTLY these ${targetSectionCount} h1s in order: ${userSections.map(s => `"${s}"`).join(", ")}. Use them verbatim as headings.`
      : `Sections: EXACTLY ${targetSectionCount} h1s. First="Introduction", last="Conclusion". Choose meaningful headings for the topic.`;

    const p =
      `Expert document architect. Create a section outline JSON for a ${understanding.documentKind} (writing style: ${docType}).

The user's request has already been understood — use this, not raw guesswork:
- Subject: "${understanding.subject}"
- Document kind: ${understanding.documentKind}
- Audience: ${understanding.audience || "general professional audience"}
- Tone: ${understanding.tone || docType}
${understanding.keyRequirements.length ? `- User's explicit requirements — each MUST be reflected in at least one section heading or its extras:\n${understanding.keyRequirements.map(r => `  • ${r}`).join("\n")}` : ""}

${sectionInstruction}
${densityNote}
Extras per section (after body): "h2:Title"|"bullets"|"table"|"columns"(≥5p, max 1 total, truly parallel only)|"hr"(max 2 total)|[]
Rules: vary block types; no generic headings; columns only for Pros/Cons-style contrast; table only for structured data.

ONLY valid JSON. Do NOT include a title field — the title is already finalized:
{"sections":[{"heading":"...","extras":[]},{"heading":"...","extras":["bullets"]}]}
JSON:`;
    let raw = "";
    const gen = streamOpenAI("", p, { max_tokens: 600, temperature: 0.25, onStatus: setStreamLog });
    for await (const chunk of gen) {
      if (abortRef.current) return null;
      raw += chunk;
      setStreamLog("Planning outline: " + raw.slice(-60));
    }
    const outline = parseJsonRobust(raw);
    outline._targetSectionCount = targetSectionCount;
    outline.title = understanding.documentTitle; // finalized in Phase 0 — never re-derived here
    return outline;
  };

  /* ── PHASE 2a: plain-text body paragraphs ── */
  const fillBodySection = async (docTitle, heading, numParas, previousSummary, onProgress) => {
    const contextNote = previousSummary
      ? `Do NOT repeat: ${previousSummary}`
      : `Opening section — set the stage.`;
    const p =
      `${docType} writer working on a ${understandingRef.current?.documentKind || "document"}. Write ${numParas} body paragraph(s).
Doc: "${docTitle}" | Section: "${heading}"
${wordsPerPara}–${wordsPerPara + 50} words each. ${contextNote}
Rules: distinct aspects per para, natural transitions, **bold** key terms (2–4/para), _italic_ for jargon.
NO: "In this section…", closing summaries, filler phrases, fake stats, headings, bullets, JSON, meta-commentary about the document itself (e.g. "Key Takeaways", "Future Implications", "This proposal/report demonstrates…", "In conclusion, this document..."). Write as if the reader is a person reading real content, never as if summarizing your own output.
Paragraphs:`;
    let raw = "";
    const gen = streamOpenAI("", p, {
      max_tokens: Math.min(numParas * (wordsPerPara + 50) * 2, 1200),
      temperature: 0.35,
      onStatus: setStreamLog,
    });
    for await (const chunk of gen) {
      if (abortRef.current) return null;
      raw += chunk;
      onProgress(raw.length);
    }
    // Split on blank lines → array of paragraphs
    const paras = raw.split(/\n\s*\n/).map(p => p.replace(/\n/g, " ").trim()).filter(p => p.length > 40);
    return paras.length ? paras : [raw.trim()];
  };

  /* ── PHASE 2b–d: batched extras (bullets + table + columns in ONE call) ── */
  const fillExtras = async (docTitle, heading, extrasNeeded) => {
    // extrasNeeded: array of "bullets" | "table" | "columns"
    if (!extrasNeeded.length) return {};

    const parts = [];
    if (extrasNeeded.includes("bullets"))
      parts.push(`"bullets": JSON array of exactly 5 strings, each "**Bold Term**: 15–25 word explanation"`);
    if (extrasNeeded.includes("table"))
      parts.push(`"table": {"headers":["H1","H2","H3"],"rows":[4 rows of 3 specific values each]} — meaningful headers for "${heading}", NO generic names`);
    if (extrasNeeded.includes("columns"))
      parts.push(`"columns": array of exactly 2 strings representing genuinely contrasting aspects of "${heading}". Each must start with a meaningful bold label derived from the content (e.g. "**Advantages**: ...", "**Disadvantages**: ...", "**Pros**: ...", "**Cons**: ...", "**Benefits**: ...", "**Drawbacks**: ...") followed by 2–3 sentences. NEVER use the word "Label" as the label.`);

    const p =
      `${docType} writer working on a ${understandingRef.current?.documentKind || "document"}. Doc: "${docTitle}" | Section: "${heading}"
Return ONE JSON object with ONLY these keys: ${extrasNeeded.join(", ")}
${parts.join("\n")}
NO markdown fences, no extra text.
JSON:`;

    let raw = "";
    const gen = streamOpenAI("", p, {
      max_tokens: extrasNeeded.length * 350 + 100,
      temperature: 0.3,
      onStatus: setStreamLog,
    });
    for await (const chunk of gen) { if (abortRef.current) return null; raw += chunk; }

    let obj = null;
    try { obj = parseJsonRobust(raw); } catch (_) { }
    if (!obj) {
      try { obj = parseJsonRobust(raw.slice(raw.search(/\{/))); } catch (_) { }
    }
    if (!obj) return {};

    const result = {};

    if (extrasNeeded.includes("bullets") && Array.isArray(obj.bullets)) {
      result.bullets = obj.bullets.map(String).filter(Boolean).slice(0, 6);
    }

    if (extrasNeeded.includes("table") && obj.table?.headers) {
      const headers = obj.table.headers.map(h => String(h).trim()).filter(Boolean).slice(0, 4);
      const n = headers.length;
      const headerSet = new Set(headers.map(h => h.toLowerCase()));
      const rows = (Array.isArray(obj.table.rows) ? obj.table.rows : [])
        .map(row => {
          const cells = (Array.isArray(row) ? row : []).map(c => String(c || "").trim());
          while (cells.length < n) cells.push("—");
          return cells.slice(0, n).map(c => c || "—");
        })
        .filter(row => {
          const nonEmpty = row.filter(c => c && c !== "—").length;
          if (nonEmpty === 0) return false;
          const allMatchHeader = row.filter(c => c !== "—").every(c => headerSet.has(c.toLowerCase().trim()));
          return !allMatchHeader;
        });
      if (rows.length > 0) result.table = { headers, rows };
    }

    if (extrasNeeded.includes("columns") && Array.isArray(obj.columns) && obj.columns.length >= 2) {
      const cols = obj.columns.slice(0, 2).map(String).filter(Boolean);
      const w0 = cols[0].replace(/\*\*/g, "").trim().split(/\s+/).slice(0, 4).join(" ").toLowerCase();
      const w1 = cols[1].replace(/\*\*/g, "").trim().split(/\s+/).slice(0, 4).join(" ").toLowerCase();
      if (w0 !== w1) result.columns = cols;
    }

    return result;
  };

  /* ── PHASE 2e: batch h2 subsections in one call ── */
  const fillH2Batch = async (docTitle, heading, subHeadings, previousSummary) => {
    const p =
      `${docType} writer working on a ${understandingRef.current?.documentKind || "document"}. Doc: "${docTitle}" | Parent section: "${heading}"
Write one body paragraph per subsection below. ${previousSummary ? `Do NOT repeat: ${previousSummary}` : ""}
${wordsPerPara}–${wordsPerPara + 40} words each. **bold** key terms (2–3/para). No filler, no "In this section…".
Return ONE JSON object keyed by subsection title:
${JSON.stringify(Object.fromEntries(subHeadings.map(s => [s, "paragraph text here"])))}
JSON:`;
    let raw = "";
    const gen = streamOpenAI("", p, {
      max_tokens: Math.min(subHeadings.length * (wordsPerPara + 40) * 2 + 100, 1400),
      temperature: 0.35,
      onStatus: setStreamLog,
    });
    for await (const chunk of gen) { if (abortRef.current) return null; raw += chunk; }
    try {
      const obj = parseJsonRobust(raw);
      if (obj && typeof obj === "object") return obj;
    } catch (_) { }
    return {};
  };

  /* ── MAIN go() ── */
  const go = async () => {
    if (!prompt.trim()) { setError("Please describe your document."); return; }
    if (prompt.trim().length < 10) { setError("Please provide a more descriptive prompt (at least 20 characters)."); return; }
    if (prompt.length > 2000) { setError("Prompt is too long. Please keep it under 2000 characters."); return; }
    setError(""); setLoading(true); setTokens(0); setPhase("understanding");
    setStreamLog("Understanding your request…");
    setLoadingPhase("template");
    abortRef.current = false;
    _nid = 0;

    try {
      // ── Phase 0: understand the user's raw request ──
      const understanding = await understandPrompt();
      if (abortRef.current || !understanding) { setLoading(false); setLoadingPhase(null); setPhase("idle"); return; }
      understandingRef.current = understanding;

      setPhase("structure");
      // ── Phase 1: outline (plan) — built from the understood intent, not the raw prompt ──
      const outline = await getOutline(understanding);
      if (abortRef.current || !outline) { setLoading(false); setLoadingPhase(null); setPhase("idle"); return; }

      // Safety truncation: enforce exactly what was planned
      const rawSections = Array.isArray(outline.sections) ? outline.sections : [];
      const sections = rawSections.slice(0, outline._targetSectionCount || rawSections.length);
      if (!sections.length) throw new Error("Outline empty. Try again.");

      // Compute bodyPerSec dynamically based on actual section count and target pages
      const actualSecCount = sections.length;
      const totalTargetWords = pages * 350;
      const dynamicBodyPerSec = Math.max(1, Math.round((totalTargetWords * 0.75) / (actualSecCount * wordsPerPara)));

      setPhase("content");

      // ── Phase 2: sequential sections ──
      const elements = [];
      elements.push({ id: nid(), type: "title", text: outline.title || "Document" });

      let previousSummary = ""; // contextual memory for amnesia fix

      for (let i = 0; i < sections.length; i++) {
        if (abortRef.current) break;
        const sec = sections[i];
        const heading = sec.heading || `Section ${i + 1}`;
        const extras = Array.isArray(sec.extras) ? sec.extras : [];

        setStreamLog(`Section ${i + 1}/${sections.length}: ${heading}…`);
        setTokens(Math.round((i / sections.length) * 100));

        elements.push({ id: nid(), type: "h1", text: heading });

        // Body paragraphs
        const paras = await fillBodySection(outline.title || "Document", heading, dynamicBodyPerSec, previousSummary, (len) => {
          setStreamLog(`Section ${i + 1}/${sections.length} — ${heading}: ${Math.round(len / 4)} tokens`);
        });
        if (abortRef.current) break;
        if (paras) {
          elements.push({ id: nid(), type: "paragraph", texts: paras });
          previousSummary += (previousSummary ? " " : "") + `Section "${heading}": ${paras[0].slice(0, 100).replace(/\n/g, " ")}...`;
          const summaryParts = previousSummary.split('Section "');
          if (summaryParts.length > 3) previousSummary = 'Section "' + summaryParts.slice(-2).join('Section "');
        }

        // ── Batch 1: all h2 subsections in ONE call ──
        const h2Extras = extras.filter(e => typeof e === "string" && e.startsWith("h2:"));
        if (h2Extras.length > 0) {
          const subHeadings = h2Extras.map(e => e.slice(3).trim() || `${heading} — Details`);
          setStreamLog(`Section ${i + 1}/${sections.length} — ${heading}: writing ${subHeadings.length} subsections…`);
          const h2Results = await fillH2Batch(outline.title || "Document", heading, subHeadings, previousSummary);
          if (abortRef.current) break;
          for (const subHeading of subHeadings) {
            elements.push({ id: nid(), type: "h2", text: subHeading });
            const txt = h2Results?.[subHeading];
            if (txt) {
              elements.push({ id: nid(), type: "paragraph", texts: [String(txt).trim()] });
              previousSummary += ` Subsection "${subHeading}": ${String(txt).slice(0, 80)}...`;
            }
          }
        }

        // ── Batch 2: bullets + table + columns in ONE call ──
        const extrasNeeded = extras.filter(e => e === "bullets" || e === "table" || e === "columns");
        const hasHr = extras.includes("hr");

        if (extrasNeeded.length > 0) {
          setStreamLog(`Section ${i + 1}/${sections.length} — ${heading}: writing ${extrasNeeded.join(", ")}…`);
          const extrasResult = await fillExtras(outline.title || "Document", heading, extrasNeeded);
          if (abortRef.current) break;

          // Preserve outline ordering when inserting results
          for (const extra of extras) {
            if (extra === "bullets" && extrasResult?.bullets?.length) {
              elements.push({ id: nid(), type: "bullets", items: extrasResult.bullets });
            } else if (extra === "table" && extrasResult?.table) {
              elements.push({ id: nid(), type: "table", headers: extrasResult.table.headers, rows: extrasResult.table.rows });
            } else if (extra === "columns") {
              if (extrasResult?.columns?.length >= 2) {
                elements.push({ id: nid(), type: "columns", cols: 2, texts: extrasResult.columns });
              } else {
                // fallback: add as paragraph
                const fallbackParas = await fillBodySection(outline.title || "Document", heading + " (additional context)", 1, previousSummary, () => { });
                if (!abortRef.current && fallbackParas) elements.push({ id: nid(), type: "paragraph", texts: fallbackParas });
              }
            }
          }
        }

        if (hasHr) elements.push({ id: nid(), type: "hr" });
      }

      if (abortRef.current) { setLoading(false); setLoadingPhase(null); setPhase("idle"); return; }
      setPhase("done");
      setLoadingPhase(null);
      onDone({ elements, docTitle: outline.title || "Document", pages });

    } catch (e) {
      setError(e.message);
      setLoading(false);
      setLoadingPhase(null);
      setPhase("idle");
    }
  };

  const cancel = () => { abortRef.current = true; };
  const pageLabel = pages === 1 ? "Short overview" : pages <= 2 ? "Brief report" : pages <= 4 ? "Standard document" : pages <= 6 ? "Detailed report" : "Comprehensive report";

  return (
    <div className="w-full flex flex-col lg:flex-row gap-10">
      {/* Left Column: Context & Prompt */}
      <div className="flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
            Create your document <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">in seconds.</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-xl">
            Describe what you need. The AI will structure, write, and format a native Word document instantly.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col flex-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-50 text-indigo-200 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.41L18.59 9H13V4.41zM18 20H6V4h5v7h7v9z"/></svg>
          </div>
          
          <label className="block text-sm font-bold text-slate-900 mb-3 relative z-10 flex items-center gap-2">
            Document Prompt <span className="text-indigo-600">*</span>
          </label>
          <textarea 
            rows={7} 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            disabled={loading}
            placeholder='e.g. "A comprehensive market analysis report for Q3, targeting stakeholders. Include a competitor comparison table and bullet points for growth strategies."'
            className="w-full flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-y text-base leading-relaxed placeholder:text-slate-400 font-medium relative z-10" 
          />
          <div className="flex items-center justify-between mt-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <p className="text-xs text-slate-500 font-medium">Ready to generate</p>
            </div>
            <p className={`text-xs font-semibold ${prompt.length > 20 ? 'text-indigo-600' : 'text-slate-400'}`}>{prompt.length} chars</p>
          </div>

          <div className="mt-5 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-[13px] leading-relaxed font-medium relative z-10">
            <span className="text-amber-500 shrink-0 mt-0.5">⚠️</span>
            <p><strong>Alpha Demo Warning:</strong> This is a very basic early version of the app, and generated documents are just sample work. Please do <strong>not</strong> add personal names or sensitive data. All issues and other problems will be fixed in the full version, which will also offer private secure generation.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Settings */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Document Type</h3>
              <p className="text-xs text-slate-500">Sets the formatting style</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {DOC_TYPES.map(dt => {
              const a = docType === dt.value;
              return (
                <button key={dt.value} onClick={() => setDocType(dt.value)} disabled={loading}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${a ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <span className={`text-lg ${a ? 'opacity-100' : 'opacity-60'}`}>{dt.icon}</span>
                  {dt.label}
                  {a && <span className="ml-auto text-indigo-600 font-black">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2.41L18.59 9H13V4.41z"/></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Page Length</h3>
              <p className="text-xs text-slate-500">Target output size</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200 mb-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setPages(n)} disabled={loading}
                className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${pages === n ? 'bg-white text-indigo-700 shadow border border-slate-200 scale-105' : 'text-slate-500 hover:bg-slate-100'}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200">
            {[6, 7, 8, 9, 10].map(n => (
              <button key={n} onClick={() => setPages(n)} disabled={loading}
                className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${pages === n ? 'bg-white text-indigo-700 shadow border border-slate-200 scale-105' : 'text-slate-500 hover:bg-slate-100'}`}>
                {n}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-500 font-medium mt-4">Target: {pageLabel} (~{pages * 400} words)</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            <p>{error}</p>
          </div>
        )}

        <div className="mt-auto">
          <button onClick={go} disabled={loading || !prompt.trim()}
            className={`w-full py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${loading || !prompt.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-0.5'
              }`}>
            {loading ? <><span className="animate-spin inline-block text-xl">⟳</span> Building...</> : <>Generate Document <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></>}
          </button>
          
          {loading && (
            <div className="mt-4 flex flex-col items-center">
              <div className="text-sm font-semibold text-indigo-600 animate-pulse">{streamLog || "Initializing generation..."}</div>
              <button onClick={cancel} className="mt-3 text-xs text-slate-500 hover:text-red-500 font-bold uppercase tracking-wider transition-colors">Cancel Generation</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step2Editor({ elements, setElements, docStyles, setDocStyles, onBack, onDone, setLoadingPhase, targetPages }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateEl = (id, k, v) => setElements(t => t.map(el => el.id === id ? { ...el, [k]: v } : el));
  const removeEl = id => setElements(t => t.filter(el => el.id !== id));
  const moveUp = idx => { if (idx === 0) return; const t = [...elements];[t[idx - 1], t[idx]] = [t[idx], t[idx - 1]]; setElements(t); };
  const moveDown = idx => { if (idx === elements.length - 1) return; const t = [...elements];[t[idx], t[idx + 1]] = [t[idx + 1], t[idx]]; setElements(t); };
  const updateElBatch = (id, patches) => setElements(t => t.map(el => el.id === id ? { ...el, ...patches } : el));

  const build = async () => {
    setError(""); setLoading(true); setLoadingPhase("docx");
    try {
      const uint8 = await buildDocx(elements, docStyles);
      const titleEl = elements.find(e => e.type === "title");
      setLoadingPhase(null);
      onDone({ filled: elements, uint8, title: titleEl?.text || "Document" });
    } catch (e) {
      setError(e.message); setLoading(false); setLoadingPhase(null);
    }
  };



  const stats = [
    { label: "Blocks", value: elements.length, icon: "⬡" },
    { label: "Sections", value: elements.filter(e => e.type === "h1").length, icon: "§" },
    { label: "AI Content", value: elements.filter(e => ["paragraph", "body", "bullets", "table", "columns"].includes(e.type)).length, icon: "✦" },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review & Edit Content</h2>
          <p className="text-slate-500 text-sm mt-0.5">Tweak the generated blocks or use the AI wand to rewrite.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200">
            ← Regenerate
          </button>
          <button onClick={build} disabled={loading} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:bg-indigo-700'}`}>
            {loading ? <><span className="animate-spin text-lg">⟳</span> Building...</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Build .docx</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 flex flex-col gap-5 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/40">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Document Stats</h3>
            <div className="flex flex-col gap-4">
              {stats.map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                    <span className="text-xl text-slate-300">{icon}</span>{label}
                  </div>
                  <div className="text-2xl font-black text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/40">
            <StyleEditor docStyles={docStyles} setDocStyles={setDocStyles} />
          </div>
        </div>

        {/* Document Editor Area */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/40 p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Document Blocks ({elements.length})</h3>
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Click any block to edit
            </div>
          </div>
          
          <div className="space-y-4">
            {elements.map((el, idx) => (
              <TemplateBlock key={el.id} el={el} idx={idx} total={elements.length}
                onUpdate={(k, v) => updateEl(el.id, k, v)}
                onUpdateBatch={patches => updateElBatch(el.id, patches)}
                onRemove={() => removeEl(el.id)}
                onMoveUp={() => moveUp(idx)}
                onMoveDown={() => moveDown(idx)} />
            ))}
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm font-medium flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






function Step3Result({ result, onStartOver, onBack }) {
  const { filled, uint8, title } = result;
  const [downloaded, setDownloaded] = useState(false);

  const runFileDownload = () => {
    try {
      if (!uint8 || !uint8.length) throw new Error("No file data");
      const name = (title.slice(0, 40).replace(/[^a-z0-9]/gi, "_") || "document") + ".docx";
      const blob = new Blob([uint8], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setDownloaded(true);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed: " + (err?.message || "unknown error"));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        
        <div className="w-24 h-24 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-3 shadow-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Document Ready!</h2>
        <p className="text-slate-500 text-lg mb-10 max-w-sm mx-auto">Your professionally formatted .docx file has been compiled and is ready for download.</p>
        
        {!downloaded ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
            <button onClick={runFileDownload} className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download Document
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto bg-indigo-50 border border-indigo-100 p-6 rounded-3xl animate-in fade-in zoom-in duration-500">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Want to generate more?</h3>
            <p className="text-sm text-slate-600 mb-6">Join the waitlist for the full version of DocReplacer and get a <strong>lifetime discount</strong> when we launch.</p>
            <a href="/#waitlist" className="block w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              Join Waitlist
            </a>
          </div>
        )}
        
        <div className="mt-12 flex items-center justify-center gap-6 border-t border-slate-100 pt-8">
          <button onClick={onBack} className="text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg> Back to Editor
          </button>
          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          <button onClick={onStartOver} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Start Over
          </button>
        </div>
      </div>
    </div>
  );
}




function Stepper({ step }) {
  const steps = ["Describe", "Review", "Done"];
  return (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto justify-center mb-8">
      {steps.map((s, i) => {
        const done = step > i, active = step === i;
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300 shadow-sm ${done ? "bg-slate-800 text-slate-900" : active ? "bg-indigo-600 text-slate-900 shadow-indigo-500/30 scale-110" : "bg-white border border-slate-200 text-slate-400"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-semibold transition-colors ${active ? "text-indigo-700" : done ? "text-slate-700" : "text-slate-400"} whitespace-nowrap`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 md:w-16 h-0.5 mx-3 md:mx-4 transition-colors ${step > i ? "bg-slate-800" : "bg-slate-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}




const FONTS = ["Arial", "Times New Roman", "Georgia", "Calibri", "Verdana", "Garamond", "Trebuchet MS", "Palatino Linotype", "Helvetica", "Tahoma"];
const ALIGNS = [{ v: "left", l: "Left" }, { v: "center", l: "Center" }, { v: "right", l: "Right" }, { v: "justify", l: "Justify" }];
const SPACINGS = [{ v: 1.0, l: "1.0×" }, { v: 1.15, l: "1.15×" }, { v: 1.5, l: "1.5×" }, { v: 2.0, l: "2.0×" }];

const STYLE_TABS = [
  { key: "title", label: "Title", dot: C.blue900 },
  { key: "h1", label: "Heading 1", dot: C.blue700 },
  { key: "h2", label: "Heading 2", dot: C.blue500 },
  { key: "paragraph", label: "Paragraph", dot: C.gray600 },
  { key: "bullets", label: "Bullets", dot: C.gray700 },
  { key: "table", label: "Table", dot: C.teal },
  { key: "pageMargins", label: "Margins", dot: C.purple },
];

const TYPE_ACCENT_COL = { title: C.blue900, h1: C.blue700, h2: C.blue500, paragraph: C.gray600, body: C.gray600, table: C.teal };

const FL = ({ children }) => (
  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{children}</div>
);

/* color row: swatch + hex input */
const ColorRow = ({ label, value, onChange }) => (
  <div>
    <FL>{label}</FL>
    <div className="flex gap-2 items-center">
      <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
        className="w-9 h-9 border border-slate-200 rounded-lg cursor-pointer p-0.5 shrink-0 bg-transparent" />
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder="#000000"
        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 bg-transparent outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
    </div>
  </div>
);

function StyleEditor({ docStyles, setDocStyles }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("paragraph");

  const set = (type, key, val) => setDocStyles(p => ({ ...p, [type]: { ...p[type], [key]: val } }));
  const reset = (type) => setDocStyles(p => ({ ...p, [type]: { ...DEFAULT_DOC_STYLES[type] } }));

  const s = docStyles[tab] || {};
  const iStClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  /* live preview text */
  const previewText = tab === "title" ? "Document Title — Preview" : tab === "h1" ? "1. Major Section Heading" : tab === "h2" ? "1.1 Sub-section Heading" : tab === "table" ? null : "Body paragraph text appears here. Font, size, colour and spacing all apply.";

  /* table preview */
  const TablePreview = () => {
    const ts = docStyles.table || DEFAULT_DOC_STYLES.table;
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm mt-3">
        <table className="w-full border-collapse" style={{ fontFamily: ts.font || "Times New Roman", fontSize: ts.size || 11 }}>
          <thead>
            <tr>{["Header 1", "Header 2", "Header 3"].map((h, i) => (
              <th key={i} style={{ background: ts.headerBg || "#1e3a8a", color: ts.headerColor || "#ffffff", padding: "8px 12px", border: `1px solid ${ts.borderColor || "#374151"}`, fontWeight: 700, textAlign: "left" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[["Row A value", "Detail text", "123"], ["Row B value", "Another detail", "456"]].map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 1 ? (ts.rowAltBg || "#eff6ff") : "transparent" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "8px 12px", border: `1px solid ${ts.borderColor || "#374151"}`, color: ts.color || "#000000" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* ── Toggle header ── */}
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3.5 border-none cursor-pointer text-left transition-colors outline-none focus:ring-0 ${open ? 'bg-white' : 'bg-white hover:bg-white'
          }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`text-base shrink-0 ${open ? 'text-indigo-600' : 'text-indigo-600'}`}>⚙️</span>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900">Global Style Settings</div>
            <div className="text-[10px] mt-0.5 truncate font-medium text-slate-500">Font · Size · Color · Background · Spacing · Alignment — for all block types</div>
          </div>
        </div>
        <span className={`text-xs shrink-0 ml-2 text-slate-500`}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="bg-transparent">
          {/* ── Tab bar ── */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide py-1">
            {STYLE_TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 min-w-[85px] px-3 py-2.5 border-none bg-transparent cursor-pointer text-xs font-bold whitespace-nowrap transition-all border-b-[3px] ${tab === t.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-900'}`}>
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle shadow-inner shadow-black/20" style={{ background: t.dot }} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ══ TEXT / HEADING / PARAGRAPH tabs ══ */}
            {tab !== "table" && tab !== "bullets" && tab !== "pageMargins" && (
              <>
                {/* Row 1: Font + Size */}
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_100px] gap-4 mb-4">
                  <div>
                    <FL>Font Family</FL>
                    <select value={s.font || "Arial"} onChange={e => set(tab, "font", e.target.value)} className={iStClass}>
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Size (pt)</FL>
                    <input type="number" min={6} max={96} value={s.size || 12} onChange={e => set(tab, "size", Number(e.target.value))} className={iStClass} />
                  </div>
                </div>

                {/* Row 2: Text Color + Background Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Text Color" value={s.color || "#000000"} onChange={v => set(tab, "color", v)} />
                  <ColorRow label="Background Color" value={s.bgColor || ""} onChange={v => set(tab, "bgColor", v)} />
                </div>

                {/* Row 3: Alignment + Line Spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <FL>Alignment</FL>
                    <select value={s.align || "left"} onChange={e => set(tab, "align", e.target.value)} className={iStClass}>
                      {ALIGNS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Line Spacing</FL>
                    <select value={s.lineSpacing || 1.5} onChange={e => set(tab, "lineSpacing", Number(e.target.value))} className={iStClass}>
                      {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4: Space Before + Space After */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <FL>Space Before (pt)</FL>
                    <input type="number" min={0} max={100} value={s.marginTop || 0} onChange={e => set(tab, "marginTop", Number(e.target.value))} className={iStClass} />
                  </div>
                  <div>
                    <FL>Space After (pt)</FL>
                    <input type="number" min={0} max={100} value={s.marginBottom || 8} onChange={e => set(tab, "marginBottom", Number(e.target.value))} className={iStClass} />
                  </div>
                </div>

                {/* Row 5: Bold + Italic toggles */}
                <div className="flex gap-4 mb-5">
                  {[["Bold", "bold"], ["Italic", "italic"]].map(([lb, key]) => (
                    <button key={key} onClick={() => set(tab, key, !s[key])}
                      className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-bold transition-all focus:outline-none ${s[key] ? 'border-indigo-500 bg-indigo-100 text-indigo-600 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-white'}`}
                      style={{ fontStyle: key === "italic" ? "italic" : "normal" }}>
                      {lb} {s[key] ? "✓" : ""}
                    </button>
                  ))}
                </div>

                {/* Live preview */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl mb-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Preview</div>
                  <div style={{
                    fontFamily: s.font, fontSize: s.size, color: s.color, textAlign: s.align,
                    fontWeight: s.bold ? "bold" : "normal", fontStyle: s.italic ? "italic" : "normal",
                    lineHeight: s.lineSpacing, background: s.bgColor || "transparent", padding: s.bgColor ? "6px 8px" : 0, borderRadius: 4,
                  }}>
                    {previewText}
                  </div>
                </div>
              </>
            )}

            {/* ══ BULLETS tab ══ */}
            {tab === "bullets" && (() => {
              const bs = docStyles.bullets || DEFAULT_DOC_STYLES.bullets;
              const setBullet = (key, val) => setDocStyles(p => ({ ...p, bullets: { ...(p.bullets || DEFAULT_DOC_STYLES.bullets), [key]: val } }));
              const previewSymbol = (BULLET_STYLES[bs.styleName] || BULLET_STYLES["Disc (•)"]).lvlText
                .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
              return (
                <>
                  {/* Bullet Style */}
                  <div className="mb-4">
                    <FL>Bullet Style</FL>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BULLET_STYLE_NAMES.map(name => {
                        const sym = (BULLET_STYLES[name].lvlText || "").replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
                        const active = bs.styleName === name;
                        return (
                          <button key={name} onClick={() => setBullet("styleName", name)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${active ? 'border-indigo-500 bg-indigo-100 text-indigo-600 font-black shadow-sm' : 'border-slate-200 bg-white text-slate-500 font-bold hover:bg-white'}`}>
                            <span className={`text-xl w-6 text-center ${active ? 'text-indigo-600' : 'text-slate-500'}`}>{sym}</span>
                            <span>{name}</span>
                            {active && <span className="ml-auto text-indigo-600 font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Indent + Hanging */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <FL>Indent Left (twips)</FL>
                      <input type="number" min={0} max={2880} step={120} value={bs.indentLeft || 720}
                        onChange={e => setBullet("indentLeft", Number(e.target.value))} className={iStClass} />
                      <div className="text-[10px] text-slate-500 mt-1.5 font-medium">Default: 720 (½ inch)</div>
                    </div>
                    <div>
                      <FL>Hanging Indent (twips)</FL>
                      <input type="number" min={0} max={1440} step={120} value={bs.hanging || 360}
                        onChange={e => setBullet("hanging", Number(e.target.value))} className={iStClass} />
                      <div className="text-[10px] text-slate-500 mt-1.5 font-medium">Default: 360 (¼ inch)</div>
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <FL>Space After Each Item (pt)</FL>
                      <input type="number" min={0} max={60} value={bs.itemSpacingAfter ?? 6}
                        onChange={e => setBullet("itemSpacingAfter", Number(e.target.value))} className={iStClass} />
                    </div>
                    <div>
                      <FL>Line Spacing</FL>
                      <select value={bs.lineSpacing || 1.5} onChange={e => setBullet("lineSpacing", Number(e.target.value))} className={iStClass}>
                        {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl mb-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Preview</div>
                    {["First bullet point", "Second bullet point", "Third bullet point"].map((text, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: bs.itemSpacingAfter ?? 6, lineHeight: bs.lineSpacing || 1.5, fontFamily: (docStyles.paragraph || docStyles.body)?.font || "Times New Roman", fontSize: (docStyles.paragraph || docStyles.body)?.size || 12, color: (docStyles.paragraph || docStyles.body)?.color || "#000000", paddingLeft: Math.round((bs.indentLeft || 720) / 20) }}>
                        <span style={{ flexShrink: 0, minWidth: 16 }}>{previewSymbol}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* ══ TABLE tab ══ */}
            {tab === "table" && (
              <>
                {/* Font + Size */}
                <div className="grid grid-cols-2 lg:grid-cols-[1fr_100px] gap-4 mb-4">
                  <div>
                    <FL>Font Family</FL>
                    <select value={s.font || "Times New Roman"} onChange={e => set("table", "font", e.target.value)} className={iStClass}>
                      {FONTS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <FL>Font Size</FL>
                    <input type="number" min={6} max={24} value={s.size || 11} onChange={e => set("table", "size", Number(e.target.value))} className={iStClass} />
                  </div>
                </div>

                {/* Header BG + Header Text Color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Header Background" value={s.headerBg || "#1e3a8a"} onChange={v => set("table", "headerBg", v)} />
                  <ColorRow label="Header Text Color" value={s.headerColor || "#ffffff"} onChange={v => set("table", "headerColor", v)} />
                </div>

                {/* Alt row BG + Body text color */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <ColorRow label="Alt Row Background" value={s.rowAltBg || "#eff6ff"} onChange={v => set("table", "rowAltBg", v)} />
                  <ColorRow label="Body Text Color" value={s.color || "#000000"} onChange={v => set("table", "color", v)} />
                </div>

                {/* Border color + Line spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <ColorRow label="Border Color" value={s.borderColor || "#374151"} onChange={v => set("table", "borderColor", v)} />
                  <div>
                    <FL>Row Spacing</FL>
                    <select value={s.lineSpacing || 1.15} onChange={e => set("table", "lineSpacing", Number(e.target.value))} className={iStClass}>
                      {SPACINGS.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Table live preview */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl mb-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Preview</div>
                  <TablePreview />
                </div>
              </>
            )}

            {/* ══ PAGE MARGINS tab ══ */}
            {tab === "pageMargins" && (() => {
              const pm = docStyles.pageMargins || DEFAULT_DOC_STYLES.pageMargins;
              const setMargin = (key, val) => setDocStyles(p => ({ ...p, pageMargins: { ...(p.pageMargins || DEFAULT_DOC_STYLES.pageMargins), [key]: val } }));
              const inchInput = (label, key) => (
                <div>
                  <FL>{label} (inches)</FL>
                  <input type="number" min={0} max={6} step={0.1}
                    value={pm[key] ?? 1.0}
                    onChange={e => setMargin(key, parseFloat(e.target.value) || 0)}
                    className={iStClass} />
                </div>
              );
              // Preset buttons matching Word's margin presets
              const PRESETS = [
                { label: "Normal", vals: { top: 1.0, bottom: 1.0, left: 1.0, right: 1.0 } },
                { label: "Narrow", vals: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 } },
                { label: "Moderate", vals: { top: 1.0, bottom: 1.0, left: 0.75, right: 0.75 } },
                { label: "Wide", vals: { top: 1.0, bottom: 1.0, left: 2.0, right: 2.0 } },
              ];
              const isActive = (vals) => ["top", "bottom", "left", "right"].every(k => Math.abs((pm[k] ?? 1.0) - vals[k]) < 0.01);
              return (
                <>
                  {/* Presets row */}
                  <div className="mb-5">
                    <FL>Margin Presets</FL>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PRESETS.map(p => {
                        const active = isActive(p.vals);
                        return (
                          <button key={p.label}
                            onClick={() => setDocStyles(prev => ({ ...prev, pageMargins: { ...p.vals } }))}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${active ? 'border-indigo-500 bg-indigo-100 text-indigo-600 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-white'}`}>
                            <div className="font-bold text-sm mb-1">{p.label}</div>
                            <div className={`text-[10px] font-medium tracking-wide ${active ? 'text-indigo-600' : 'text-slate-500'}`}>
                              T:{p.vals.top}" L:{p.vals.left}"
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom margin inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {inchInput("Top", "top")}
                    {inchInput("Bottom", "bottom")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    {inchInput("Left", "left")}
                    {inchInput("Right", "right")}
                  </div>

                  {/* Visual margin preview */}
                  <div className="p-5 bg-white border border-slate-200 rounded-xl mb-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Page Preview</div>
                    <div className="flex justify-center">
                      {/* A4 page mock */}
                      <div className="relative w-[120px] h-[170px] bg-white border border-slate-200 rounded-md shadow-md">
                        {/* Margin guides */}
                        <div style={{
                          position: "absolute",
                          top: `${(pm.top ?? 1) / 11 * 100}%`,
                          bottom: `${(pm.bottom ?? 1) / 11 * 100}%`,
                          left: `${(pm.left ?? 1) / 8.5 * 100}%`,
                          right: `${(pm.right ?? 1) / 8.5 * 100}%`,
                          border: `1.5px dashed #818cf8`,
                          borderRadius: 2,
                        }} />
                        {/* Label badges */}
                        <div className="absolute top-[2px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-500 whitespace-nowrap">T:{pm.top ?? 1}"</div>
                        <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-500 whitespace-nowrap">B:{pm.bottom ?? 1}"</div>
                        <div className="absolute left-[2px] top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold text-indigo-500 whitespace-nowrap">L:{pm.left ?? 1}"</div>
                        <div className="absolute right-[2px] top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-bold text-indigo-500 whitespace-nowrap">R:{pm.right ?? 1}"</div>
                        {/* Content lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} style={{
                            position: "absolute",
                            top: `calc(${(pm.top ?? 1) / 11 * 100}% + ${12 + i * 14}px)`,
                            left: `calc(${(pm.left ?? 1) / 8.5 * 100}% + 4px)`,
                            right: `calc(${(pm.right ?? 1) / 8.5 * 100}% + 4px)`,
                            height: 2, background: "#cbd5e1", borderRadius: 1
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Reset button */}
            <div className="flex justify-end pt-2">
              {tab !== "pageMargins" ? (
                <button onClick={() => reset(tab)}
                  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-white hover:text-slate-900 cursor-pointer text-xs font-bold transition-colors shadow-sm">
                  ↺ Reset {STYLE_TABS.find(t => t.key === tab)?.label} to defaults
                </button>
              ) : (
                <button onClick={() => setDocStyles(p => ({ ...p, pageMargins: { ...DEFAULT_DOC_STYLES.pageMargins } }))}
                  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-white hover:text-slate-900 cursor-pointer text-xs font-bold transition-colors shadow-sm">
                  ↺ Reset Margins to Normal (1")
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}



const TYPE_LABEL = { title: "Title", h1: "H1", h2: "H2", paragraph: "Paragraph", body: "Paragraph", bullets: "Bullets", hr: "Divider", table: "Table", columns: "Columns" };
const TYPE_BADGE = { title: { bg: C.blue900, text: C.white }, h1: { bg: C.blue700, text: C.white }, h2: { bg: C.blue100, text: C.blue800 }, paragraph: { bg: C.gray200, text: C.gray700 }, body: { bg: C.gray200, text: C.gray700 }, bullets: { bg: C.gray700, text: C.white }, hr: { bg: C.gray300, text: C.gray700 }, table: { bg: C.blue800, text: C.white }, columns: { bg: C.blue600, text: C.white } };
const TYPE_BG = { title: C.blue900, h1: C.blue50, h2: C.bgMuted, paragraph: C.gray100, body: C.gray100, bullets: C.gray100, hr: C.gray100, table: C.blue50, columns: C.blue50 };

function TemplateBlock({ el, idx, total, onUpdate, onUpdateBatch, onRemove, onMoveUp, onMoveDown }) {
  const badge = TYPE_BADGE[el.type] || TYPE_BADGE.paragraph;
  const bgColor = TYPE_BG[el.type] || C.gray100;
  const isTitle = el.type === "title", isHeading = el.type === "h1" || el.type === "h2";
  const isBody = el.type === "body" || el.type === "paragraph", isBullets = el.type === "bullets";
  const isHr = el.type === "hr", isTable = el.type === "table", isColumns = el.type === "columns";

  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const inpClass = "w-full border border-slate-200 bg-white text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400";
  const badgeClasses = {
    title: "bg-indigo-600 text-slate-900", h1: "bg-slate-800 text-slate-900",
    hr: "bg-slate-200 text-slate-500", default: "bg-slate-100 text-slate-600"
  };
  const getBadgeStyle = (t) => badgeClasses[t] || badgeClasses.default;

  // Safety: hide table blocks with no real data on the review page
  if (isTable && !hasTableData(el.headers || [], el.rows || [])) return null;

  /* ── current content snapshot for AI context ── */
  const currentContentStr = () => {
    if (isBody) return (el.texts || []).join("\n\n");
    if (isBullets) return (el.items || []).join("\n");
    if (isTable) return `Headers: ${(el.headers || []).join(", ")}\nRows:\n${(el.rows || []).map(r => r.join(" | ")).join("\n")}`;
    if (isColumns) return (el.texts || []).join("\n---\n");
    return el.text || "";
  };

  /* ── AI edit handler ── */
  const runAiEdit = async () => {
    if (!aiPrompt.trim()) { setAiError("Enter a prompt."); return; }
    setAiError(""); setAiLoading(true);
    try {
      const blockType = TYPE_LABEL[el.type] || el.type;
      const sectionTitle = el.text || (isBody && el.texts?.[0]?.slice(0, 60)) || blockType;
      const content = currentContentStr();
      const instruction = aiPrompt.trim();

      /* ── shared formatting reference ── */
      const fmtRef = `Inline formatting you may use (only where it genuinely improves clarity):
- **bold** → key terms, critical concepts, important phrases (2–4 per paragraph max)
- _italic_ → titles of works, technical jargon, subtle emphasis (use sparingly)
- [link text](https://url) → hyperlinks only when a real relevant URL fits naturally
- Never bold or italic random words — only where it meaningfully helps the reader`;

      /* ── detect intent to guide preservation rules ── */
      const isAddIntent = /(add|append|include|insert|more|extra|additional|another|\+)/i.test(instruction);
      const isReplaceIntent = /(replace|rewrite|redo|regenerate|change all|completely|from scratch)/i.test(instruction);
      const preserveNote = isAddIntent && !isReplaceIntent
        ? "IMPORTANT: The instruction is asking to ADD content. Keep ALL existing content intact and append the new content after it."
        : isReplaceIntent
          ? "The instruction is asking to fully replace or rewrite the content. You may discard the existing content."
          : "Preserve any existing content that the instruction does not explicitly ask to change.";

      let prompt = "";

      if (isTitle || isHeading) {
        prompt = `You are a professional editor refining a document ${blockType}.

Current ${blockType}: "${content}"

Edit instruction: "${instruction}"

Requirements:
- Apply the edit precisely — keep the same professional tone unless told otherwise
- The result must be concise and suitable as a document ${blockType}
- Do NOT add quotes, punctuation decoration, or commentary

Return ONLY the updated ${blockType} text on a single line:`;

      } else if (isBody) {
        prompt = `You are a professional editor working on a body section of a document.

Section topic: "${sectionTitle}"

Current content:
---
${content}
---

${fmtRef}

Edit instruction: "${instruction}"

${preserveNote}

Output rules:
- Return ONLY the final paragraph(s), separated by a blank line between each
- Each paragraph must be detailed, well-structured prose (minimum 80 words unless shortening was requested)
- Do NOT include headings, bullet points, JSON, preamble, or sign-off text
- Maintain the professional tone of the original unless the instruction changes it

Updated paragraphs:`;

      } else if (isBullets) {
        prompt = `You are a professional editor working on a bullet-point list in a document.

Section topic: "${sectionTitle}"

Existing bullets:
${content}

${fmtRef}

Edit instruction: "${instruction}"

${preserveNote}
- If adding: append new bullets AFTER all existing ones — never remove or alter existing bullets
- If replacing/rewriting: you may discard existing content
- Each bullet: start with **Bold Key Term**: then 15–25 words of specific explanation
- All bullets must be distinct with no overlapping content

Return ONLY a valid JSON array of all bullet strings (no markdown fences, no extra text):
["**Term**: explanation","**Term**: explanation",...]
JSON:`;

      } else if (isTable) {
        prompt = `You are a professional editor working on a data table in a document.

Section topic: "${sectionTitle}"

Current table:
${content}

Edit instruction: "${instruction}"

${preserveNote}
- All column values must be specific and meaningful — no placeholder text like "value1" or "N/A"
- Maintain consistent column count across all rows
- If adding rows: keep existing rows and append new ones after them

Return ONLY valid JSON in this exact format (no markdown fences, no extra text):
{"headers":["Header 1","Header 2","Header 3"],"rows":[["specific value","specific value","specific value"]]}
JSON:`;

      } else if (isColumns) {
        prompt = `You are a professional editor working on a ${el.cols || 2}-column layout in a document.

Section topic: "${sectionTitle}"

Current column content:
${content}

${fmtRef}

Edit instruction: "${instruction}"

${preserveNote}
- Each column must contain full, readable prose — not just a heading or a single sentence
- Maintain the ${el.cols || 2}-column structure

Return ONLY a valid JSON array with exactly ${el.cols || 2} strings (no markdown fences, no extra text):
["full column 1 text here","full column 2 text here"]
JSON:`;
      }

      const raw = await callOpenAI("", prompt, { max_tokens: 2000, temperature: 0.65 });

      /* parse & apply */
      if (isTitle || isHeading) {
        onUpdate("text", raw.replace(/^["']|["']$/g, "").trim());
      } else if (isBody) {
        const paras = raw.split(/\n\s*\n/).map(p => p.replace(/\n/g, " ").trim()).filter(p => p.length > 10);
        const newParas = paras.length ? paras : [raw.trim()];
        const finalParas = (isAddIntent && !isReplaceIntent)
          ? [...(el.texts || []), ...newParas]
          : newParas;
        onUpdate("texts", finalParas);
      } else if (isBullets) {
        try {
          const arr = safeParseJSON(raw);
          if (Array.isArray(arr)) onUpdate("items", arr.map(String).filter(Boolean));
          else throw new Error("not array");
        } catch (_) {
          const lines = raw.split("\n").map(l => l.replace(/^[-•*\d.]+\s*/, "").trim()).filter(l => l.length > 5);
          onUpdate("items", lines.length ? lines : (el.items || []));
        }
      } else if (isTable) {
        try {
          const obj = safeParseJSON(raw);
          if (obj && obj.headers) onUpdateBatch({ headers: obj.headers, rows: obj.rows || [] });
          else throw new Error("no headers");
        } catch (_) { setAiError("AI returned invalid table JSON. Try again."); }
      } else if (isColumns) {
        try {
          const arr = safeParseJSON(raw);
          if (Array.isArray(arr)) onUpdate("texts", arr.map(String));
          else throw new Error("not array");
        } catch (_) { setAiError("AI returned invalid columns JSON. Try again."); }
      }

      setAiOpen(false); setAiPrompt("");
    } catch (e) {
      setAiError(e.message || "AI edit failed.");
    }
    setAiLoading(false);
  };

  return (
    <div className="mb-5 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-shadow">
      {/* ── Header row ── */}
      <div className={`flex items-center gap-3 px-5 py-3.5 ${isTitle ? 'bg-indigo-50' : 'bg-white'} ${!isHr ? 'border-b border-slate-200' : ''}`}>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 font-mono ${getBadgeStyle(el.type)}`}>
          {TYPE_LABEL[el.type] || el.type}
        </span>

        {(isTitle || isHeading || isBody) && (
          <input value={el.text || ""} onChange={e => onUpdate("text", e.target.value)}
            placeholder={isBody ? "Body topic hint…" : "Heading text…"}
            className={`flex-1 bg-transparent outline-none ${isTitle ? 'text-lg font-bold text-slate-900 placeholder:text-indigo-600' : isHeading ? 'text-base font-bold text-slate-900' : 'text-sm font-semibold text-slate-500 placeholder:text-slate-400'} w-0`} />
        )}

        {(isBullets || isTable || isColumns) && (
          <span className="flex-1 text-xs italic text-slate-500 font-medium">
            {isBullets ? `${(el.items || []).length} points` : isTable ? `${(el.headers || []).length} cols · ${(el.rows || []).length} rows` : `${el.cols || 2}-column`}
          </span>
        )}

        <div className="flex gap-1.5 ml-auto shrink-0">
          {!isHr && (
            <button onClick={() => { setAiOpen(o => !o); setAiError(""); }} title="Edit with AI"
              className={`px-2.5 h-7 rounded-md text-xs font-bold transition-colors shadow-sm ${aiOpen ? 'bg-indigo-500 text-slate-900' : isTitle ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
              ✦ AI
            </button>
          )}
          <button onClick={onMoveUp} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 shadow-sm transition-opacity">↑</button>
          <button onClick={onMoveDown} disabled={idx === total - 1} className="w-7 h-7 flex items-center justify-center border border-slate-200 rounded-md bg-white text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 shadow-sm transition-opacity">↓</button>
          {!isTitle && <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center border border-red-500/30 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shadow-sm font-bold text-xs">✕</button>}
        </div>
      </div>

      {/* ── AI Edit Panel ── */}
      {aiOpen && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100 transition-all">
          <div className="text-xs font-bold text-indigo-600 mb-2.5">✦ Edit with AI — describe the change</div>
          <div className="flex gap-2">
            <input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && runAiEdit()}
              placeholder="e.g. Make it more formal, add 2 more rows, shorten to 3 bullets…"
              disabled={aiLoading}
              className={`flex-1 px-3 py-2 text-sm font-medium ${inpClass} ${aiLoading ? 'bg-white text-slate-500' : 'bg-white text-slate-900'}`}
            />
            <button onClick={runAiEdit} disabled={aiLoading}
              className={`px-5 py-2 rounded-lg text-sm font-bold text-slate-900 shadow-sm transition-colors ${aiLoading ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
              {aiLoading ? "⟳ …" : "Apply"}
            </button>
            <button onClick={() => { setAiOpen(false); setAiPrompt(""); setAiError(""); }}
              className="px-4 py-2 bg-white text-slate-500 border border-slate-200 rounded-lg text-sm font-semibold hover:border-slate-200 hover:bg-white hover:text-slate-900 transition-colors shadow-sm">
              Cancel
            </button>
          </div>
          {aiError && <div className="mt-2 text-xs font-semibold text-red-500">{aiError}</div>}
        </div>
      )}

      {/* ── Manual edit areas ── */}
      {isBullets && (
        <div className="p-4">
          {(el.items || []).map((item, i) => (
            <div key={i} className="flex gap-2.5 mb-2.5 items-center">
              <span className="text-slate-500 shrink-0 text-xl leading-none mb-1">•</span>
              <input value={item} onChange={e => { const items = [...el.items]; items[i] = e.target.value; onUpdate("items", items); }} className={`flex-1 px-3 py-2 text-sm ${inpClass}`} />
              <button onClick={() => { const items = [...el.items]; items.splice(i, 1); onUpdate("items", items); }} className="text-red-400 hover:text-red-600 shrink-0 text-lg mx-1 flex items-center justify-center p-1 rounded transition-colors">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate("items", [...(el.items || []), "New point"])} className="text-sm font-bold text-indigo-600 hover:text-indigo-600 transition-colors pt-2 pb-1 ml-6">+ Add point</button>
        </div>
      )}
      {isBody && Array.isArray(el.texts) && el.texts.length > 0 && (
        <div className="p-4 space-y-3">
          {el.texts.map((t, i) => (
            <textarea key={i} value={t} rows={3} onChange={e => { const texts = [...el.texts]; texts[i] = e.target.value; onUpdate("texts", texts); }}
              className={`w-full px-4 py-3 text-sm leading-relaxed resize-y ${inpClass}`} />
          ))}
        </div>
      )}
      {isTable && (
        <div className="p-4 overflow-x-auto">
          {/* Header inputs */}
          <div className="flex gap-1.5 mb-2">
            {(el.headers || []).map((h, ci) => (
              <input key={ci} value={h} onChange={e => { const hs = [...el.headers]; hs[ci] = e.target.value; onUpdate("headers", hs); }}
                className={`flex-1 px-2.5 py-2 text-xs font-bold bg-indigo-100 border border-indigo-200 rounded-md focus:outline-none focus:border-indigo-500 text-indigo-100 placeholder:text-indigo-600/50`} />
            ))}
          </div>
          {/* Row inputs */}
          {(el.rows || []).map((row, ri) => (
            <div key={ri} className="flex gap-1.5 mb-1.5">
              {(el.headers || []).map((_, ci) => (
                <input key={ci} value={(row[ci]) || ""} onChange={e => {
                  const rows = el.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? e.target.value : c) : r);
                  onUpdate("rows", rows);
                }} className={`flex-1 px-2.5 py-2 text-xs ${inpClass}`} />
              ))}
              <button onClick={() => onUpdate("rows", el.rows.filter((_, i) => i !== ri))}
                className="text-red-400 hover:text-red-600 shrink-0 text-lg px-2 flex items-center justify-center hover:bg-red-50 rounded transition-colors">&times;</button>
            </div>
          ))}
          <button onClick={() => onUpdate("rows", [...(el.rows || []), Array((el.headers || []).length).fill("")])}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-600 transition-colors mt-3 pb-1.5">+ Add row</button>
        </div>
      )}
      {isColumns && (
        <div className="p-4 space-y-4">
          {Array(el.cols || 2).fill(null).map((_, i) => (
            <div key={i}>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Column {i + 1}</div>
              <textarea value={(el.texts || [])[i] || ""} rows={2}
                onChange={e => { const t = [...(el.texts || [])]; t[i] = e.target.value; onUpdate("texts", t); }}
                className={`w-full px-3 py-2.5 text-sm resize-y leading-relaxed ${inpClass}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}







export default function DocxGenerator() {
  const [step, setStep] = useState(0);
  const [elements, setElements] = useState([]);
  const [targetPages, setTargetPages] = useState(3);
  const [result, setResult] = useState(null);
  const [docStyles, setDocStyles] = useState({
    title: { ...DEFAULT_DOC_STYLES.title },
    h1: { ...DEFAULT_DOC_STYLES.h1 },
    h2: { ...DEFAULT_DOC_STYLES.h2 },
    paragraph: { ...DEFAULT_DOC_STYLES.paragraph },
    table: { ...DEFAULT_DOC_STYLES.table },
    bullets: { ...DEFAULT_DOC_STYLES.bullets },
    pageMargins: { ...DEFAULT_DOC_STYLES.pageMargins },
  });
  const [loadingPhase, setLoadingPhase] = useState(null);



  useEffect(() => {

  }, []);

  useEffect(() => {
    if (!window.JSZip) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s.integrity = "sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==";
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
    const st = document.createElement("style");
    st.textContent = `button:hover:not(:disabled){filter:brightness(1.06);}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}@keyframes drSpin{to{transform:rotate(360deg)}}input[type=number]::-webkit-inner-spin-button{opacity:.7;}`;
    document.head.appendChild(st);
  }, []);

  const startOver = () => {
    setStep(0); setElements([]); setResult(null); setTargetPages(3);
    setDocStyles({ title: { ...DEFAULT_DOC_STYLES.title }, h1: { ...DEFAULT_DOC_STYLES.h1 }, h2: { ...DEFAULT_DOC_STYLES.h2 }, paragraph: { ...DEFAULT_DOC_STYLES.paragraph }, table: { ...DEFAULT_DOC_STYLES.table }, bullets: { ...DEFAULT_DOC_STYLES.bullets }, pageMargins: { ...DEFAULT_DOC_STYLES.pageMargins } });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navbar with Progress */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-200 shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg> <span className="hidden sm:inline">Home</span>
            </a>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl shadow-sm bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <img src="/Logo.ico" alt="DocReplacer Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight brand-font hidden md:block">DocReplacer Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {[ 
              { s: 0, label: 'Setup' }, 
              { s: 1, label: 'Editor' }, 
              { s: 2, label: 'Export' } 
            ].map((st, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= st.s ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {st.s + 1}
                  </div>
                  <span className={`text-sm font-semibold hidden sm:block ${step >= st.s ? 'text-slate-900' : 'text-slate-400'}`}>{st.label}</span>
                </div>
                {i < 2 && <div className="w-4 sm:w-8 h-[2px] rounded-full bg-slate-200"></div>}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
        {loadingPhase && <LoadingOverlay phase={loadingPhase} />}
        
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out flex flex-col">
          {step === 0 && (
            <Step1Prompt
              setLoadingPhase={setLoadingPhase}
              onDone={({ elements: els, docTitle, pages, prompt }) => {
                setElements(els);
                setTargetPages(pages);
                setStep(1);
              }} />
          )}

          {step === 1 && (
            <Step2Editor
              elements={elements}
              setElements={setElements}
              docStyles={docStyles}
              setDocStyles={setDocStyles}
              targetPages={targetPages}
              setLoadingPhase={setLoadingPhase}
              onBack={() => setStep(0)}
              onDone={r => { setResult(r); setStep(2); }} />
          )}

          {step === 2 && result && (
            <Step3Result
              result={result}
              onBack={() => setStep(1)}
              onStartOver={() => { setStep(0); setElements([]); setResult(null); }} />
          )}
        </div>
      </main>
    </div>
  );
}