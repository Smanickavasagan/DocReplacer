const C = {
  white: "#ffffff", bg: "#f8fafc", bgMuted: "#f1f5f9",
  border: "#e2e8f0",
  blue900: "#1e3a8a", blue800: "#1e40af", blue700: "#1d4ed8",
  blue600: "#2563eb", blue500: "#3b82f6", blue400: "#60a5fa",
  blue300: "#93c5fd", blue200: "#bfdbfe", blue100: "#dbeafe", blue50: "#eff6ff",
  black: "#000000", gray900: "#111827", gray800: "#1f2937",
  gray700: "#374151", gray600: "#4b5563", gray500: "#6b7280",
  gray400: "#9ca3af", gray300: "#d1d5db", gray200: "#e5e7eb", gray100: "#f3f4f6",
  text: "#111827", textSub: "#4b5563", textMuted: "#9ca3af",
  ok: "#16a34a", err: "#dc2626", errBg: "#fef2f2", errBorder: "#fca5a5",
  purple: "#7c3aed", purpleBg: "#f5f3ff", purpleBorder: "#ddd6fe",
  teal: "#0d9488", tealBg: "#f0fdfa", tealBorder: "#99f6e4",
};

// Bullet style definitions: name → { numFmt, lvlText, font }
// lvlText values are literal Unicode chars (not HTML entities) for correct XML embedding
const BULLET_STYLES = {
  "Disc (•)": { numFmt: "bullet", lvlText: "\uF0B7", font: "Symbol" }, // Symbol font private-use disc
  "Circle (○)": { numFmt: "bullet", lvlText: "\uF06F", font: "Wingdings" }, // Wingdings hollow circle
  "Square (▪)": { numFmt: "bullet", lvlText: "\uF0A7", font: "Wingdings" }, // Wingdings filled square
  "Dash (–)": { numFmt: "bullet", lvlText: "\u2013", font: "Arial" }, // en-dash, any font
};
const BULLET_STYLE_NAMES = Object.keys(BULLET_STYLES);

const DEFAULT_DOC_STYLES = {
  title: { font: "Arial", size: 24, color: "#000000", align: "center", bold: true, italic: false, marginTop: 0, marginBottom: 12, lineSpacing: 1.15, bgColor: "" },
  h1: { font: "Times New Roman", size: 18, color: "#000000", align: "left", bold: true, italic: false, marginTop: 16, marginBottom: 18, lineSpacing: 1.15, bgColor: "" },
  h2: { font: "Times New Roman", size: 14, color: "#000000", align: "left", bold: true, italic: false, marginTop: 10, marginBottom: 12, lineSpacing: 1.15, bgColor: "" },
  paragraph: { font: "Times New Roman", size: 12, color: "#000000", align: "justify", bold: false, italic: false, marginTop: 0, marginBottom: 8, lineSpacing: 1.5, bgColor: "" },
  table: { font: "Times New Roman", size: 11, color: "#000000", headerBg: "#1e3a8a", headerColor: "#ffffff", rowAltBg: "#eff6ff", borderColor: "#374151", lineSpacing: 1.15 },
  bullets: { styleName: "Disc (•)", indentLeft: 720, hanging: 360, itemSpacingAfter: 6, lineSpacing: 1.5 },
  // Page margins in inches (Word standard: Normal=1", Narrow=0.5", Wide=2")
  pageMargins: { top: 1.0, bottom: 1.0, left: 1.0, right: 1.0 },
};


export const DOC_TYPES = [
  { value: "professional", label: "Professional", icon: "◈" },
  { value: "academic", label: "Academic", icon: "◉" },
  { value: "technical", label: "Technical", icon: "◧" },
  { value: "business", label: "Business", icon: "◆" },
  { value: "report", label: "Report", icon: "◎" },
];

export { C, BULLET_STYLES, BULLET_STYLE_NAMES, DEFAULT_DOC_STYLES };
