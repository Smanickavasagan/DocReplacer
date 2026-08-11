import { sanitiseJsonStr, repairTruncated, extractObjects, safeParseJSON } from './jsonParser.js';
// API Keys for different agents
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_KEY_PLAN = import.meta.env.VITE_GROQ_API_KEY_PLAN;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";

const GROQ_STATUS_MESSAGES = {
  400: "Bad request. Check your prompt or Groq model name.",
  401: "Invalid API key.",
  403: "API key does not have permission or quota exceeded.",
  429: "rate limit exceeded. Please wait and try again.",
  500: "server error. Please try again.",
  503: "temporarily overloaded. Retrying…",
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function groqRequest(body, retries = 5, onStatus = null, apiKey = GROQ_API_KEY) {
  if (!apiKey) throw new Error("Groq API key is missing. Set VITE_GROQ_API_KEY in your .env file.");
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return res;
    const is429 = res.status === 429;
    const retryable = res.status === 503 || is429;
    if (retryable && attempt < retries) {
      let delay;
      if (is429) {
        const retryAfter = res.headers.get("Retry-After");
        delay = retryAfter
          ? (parseFloat(retryAfter) + 1) * 1000
          : Math.min(5000 * 2 ** attempt + Math.random() * 1000, 65000);
      } else {
        delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 16000);
      }
      const label = is429 ? "Rate limited" : "Server busy";
      const totalSecs = Math.ceil(delay / 1000);
      for (let s = totalSecs; s > 0; s--) {
        onStatus?.(`⏳ ${label} — retrying in ${s}s (attempt ${attempt + 1}/${retries})…`);
        await sleep(1000);
      }
      continue;
    }
    throw new Error(GROQ_STATUS_MESSAGES[res.status] || `Groq request failed (${res.status}).`);
  }
}

async function callOpenAI(_apiKey, prompt, opts = {}) {
  const res = await groqRequest(
    {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens || 4096,
    },
    5,
    opts.onStatus || null
  );
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "";
}

async function callOpenAIJSON(_apiKey, prompt, opts = {}) {
  const apiKeyToUse = GROQ_API_KEY_PLAN || GROQ_API_KEY;
  const res = await groqRequest(
    {
      model: import.meta.env.VITE_GROQ_PLANNING_MODEL || GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.max_tokens || 4096,
      response_format: { type: "json_object" }
    },
    5,
    opts.onStatus || null,
    apiKeyToUse
  );
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "";
}

async function* streamOpenAI(_apiKey, prompt, opts = {}) {
  const res = await groqRequest(
    {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: opts.temperature ?? 0.6,
      max_tokens: opts.max_tokens || 6000,
      stream: true,
    },
    5,
    opts.onStatus || null
  );
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || !cleanLine.startsWith("data: ")) continue;
      const dataStr = cleanLine.slice(6);
      if (dataStr === "[DONE]") return;
      try {
        const json = JSON.parse(dataStr);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch (_) { }
    }
  }
}


export { groqRequest, callOpenAI, streamOpenAI, callOpenAIJSON };
