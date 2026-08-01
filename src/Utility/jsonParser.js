function sanitiseJsonStr(s) {
  return s
    // smart / curly quotes → straight
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // strip actual newlines / tabs inside strings (common LLM mistake)
    .replace(/("(?:[^"\\]|\\.)*")/g, m =>
      m.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
    )
    // remove trailing commas before ] or }
    .replace(/,\s*([}\]])/g, "$1");
}

function repairTruncated(src) {
  // Close any open string, then close open brackets/braces
  let inStr = false, esc = false;
  const stack = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (esc) { esc = false; continue; }
    if (c === "\\" && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (!inStr) {
      if (c === "{" || c === "[") stack.push(c === "{" ? "}" : "]");
      else if (c === "}" || c === "]") stack.pop();
    }
  }
  let result = src;
  if (inStr) result += '"';          // close open string
  result += stack.reverse().join(""); // close open brackets
  return result;
}

function extractObjects(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const s = src.indexOf("{", i);
    if (s === -1) break;
    let depth = 0, inStr = false, esc = false, j = s;
    for (; j < src.length; j++) {
      const c = src[j];
      if (esc) { esc = false; continue; }
      if (c === "\\" && inStr) { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (!inStr) {
        if (c === "{") depth++;
        else if (c === "}") { depth--; if (depth === 0) break; }
      }
    }
    const chunk = src.slice(s, j + 1);
    try { out.push(JSON.parse(sanitiseJsonStr(chunk))); }
    catch (_) {
      try { out.push(JSON.parse(sanitiseJsonStr(repairTruncated(chunk)))); }
      catch (__) {/* skip unparseable object */ }
    }
    i = j + 1;
  }
  return out;
}

function safeParseJSON(raw) {
  // 1. Strip code fences
  let src = raw.replace(/```json[\s\S]*?```/gi, m => m.replace(/```json|```/gi, ""))
    .replace(/```/g, "").trim();

  // 2. Strip leading/trailing text that wraps the JSON (e.g. 'Here is the JSON: [...]')
  // Only keep the portion starting from first [ or {
  const firstBracket = src.search(/[\[{]/);
  if (firstBracket > 0) src = src.slice(firstBracket);

  // 3. Try direct parse
  try { const r = JSON.parse(src); if (Array.isArray(r) && r.length) return r; } catch (_) { }

  // 4. Try sanitised parse
  try { const r = JSON.parse(sanitiseJsonStr(src)); if (Array.isArray(r) && r.length) return r; } catch (_) { }

  // 5. Extract the outermost [...] block
  const arrM = src.match(/\[[\s\S]*\]/);
  if (arrM) {
    const arrStr = arrM[0];
    try { const r = JSON.parse(arrStr); if (Array.isArray(r) && r.length) return r; } catch (_) { }
    try { const r = JSON.parse(sanitiseJsonStr(arrStr)); if (Array.isArray(r) && r.length) return r; } catch (_) { }
    // 6. Truncated array — try repairing then parsing
    try { const r = JSON.parse(sanitiseJsonStr(repairTruncated(arrStr))); if (Array.isArray(r) && r.length) return r; } catch (_) { }
  }

  // 7. Last resort — pull out every {...} object individually
  const objs = extractObjects(src);
  if (objs.length) return objs;

  throw new Error("Could not parse AI JSON after all repair attempts. Raw snippet: " + raw.slice(0, 200));
}


export { sanitiseJsonStr, repairTruncated, extractObjects, safeParseJSON };
