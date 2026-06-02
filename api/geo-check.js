// GEO-fundamentscanner voor supervised.nl.
// Haalt een vaste set bekende paden op een ingevoerd domein op en scoort
// hoe goed dat domein leesbaar is voor AI-assistenten (ChatGPT, Copilot, etc.).
// Bewust beperkt tot vaste paden, dus geen open proxy. Geen opslag, geen capture.

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 512 * 1024; // 512 KB per resource is ruim zat
const USER_AGENT = "SupervisedGEOCheck/1.0 (+https://www.supervised.nl/geo-check/)";

// De AI-crawlers die we in robots.txt verwachten te zien toegelaten.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended",
  "Applebot-Extended",
];

// Hosts die we nooit benaderen (SSRF-mitigatie).
function isBlockedHost(host) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) {
    return true;
  }
  // Ruwe IP-checks voor private/loopback/link-local ranges.
  if (/^127\./.test(h) || /^10\./.test(h) || /^169\.254\./.test(h) || /^0\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)) return true;
  if (h === "[::1]" || h === "::1") return true;
  return false;
}

// Normaliseert vrije invoer naar een schone hostnaam.
function normalizeDomain(input) {
  let raw = String(input || "").trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname;
  if (!host || !host.includes(".")) return null; // moet een echt domein zijn
  if (isBlockedHost(host)) return null;
  return host;
}

// Haalt één URL op met timeout en groottelimiet. Geeft {ok, status, text} terug.
async function safeFetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
    });
    const reader = res.body ? res.body.getReader() : null;
    let received = 0;
    const chunks = [];
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        if (received > MAX_BYTES) {
          controller.abort();
          break;
        }
        chunks.push(value);
      }
    }
    const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  } finally {
    clearTimeout(timer);
  }
}

// --- Analyse per signaal ---

function checkCrawlers(robots) {
  // Geen robots.txt = niets blokkeert, dus crawlers mogen alles.
  if (!robots.ok || !robots.text.trim()) {
    return {
      pass: true,
      detail: "Geen robots.txt gevonden, dus AI-crawlers worden niet geblokkeerd.",
    };
  }
  const text = robots.text;
  // Zoek per crawler of die expliciet wordt geblokkeerd via een eigen User-agent blok.
  const blocked = [];
  const allowedExplicit = [];
  for (const bot of AI_CRAWLERS) {
    const re = new RegExp("user-agent:\\s*" + bot + "\\s*\\n([\\s\\S]*?)(?=\\nuser-agent:|$)", "i");
    const m = text.match(re);
    if (m) {
      if (/disallow:\s*\/\s*(\n|$)/i.test(m[1])) blocked.push(bot);
      else allowedExplicit.push(bot);
    }
  }
  // Globale * Disallow: / die alles dichtzet.
  const starBlock = /user-agent:\s*\*\s*\n([\s\S]*?)(?=\nuser-agent:|$)/i.exec(text);
  const starBlocksAll = starBlock && /disallow:\s*\/\s*(\n|$)/i.test(starBlock[1]);

  if (blocked.length) {
    return { pass: false, detail: "Geblokkeerd voor: " + blocked.join(", ") + "." };
  }
  if (starBlocksAll && allowedExplicit.length === 0) {
    return { pass: false, detail: "robots.txt blokkeert alle bots (Disallow: /) zonder uitzondering voor AI-crawlers." };
  }
  if (allowedExplicit.length) {
    return { pass: true, detail: allowedExplicit.length + " AI-crawlers expliciet toegelaten." };
  }
  return { pass: true, detail: "AI-crawlers worden niet geblokkeerd." };
}

function checkLlms(llms) {
  if (llms.ok && llms.text.trim().length > 50) {
    return { pass: true, detail: "llms.txt aanwezig (" + llms.text.trim().length + " tekens)." };
  }
  return { pass: false, detail: "Geen llms.txt gevonden. Dit bestand vat je bedrijf samen voor AI." };
}

function extractSchemaTypes(html) {
  const types = new Set();
  // Quotes rond attribuutwaarden zijn optioneel: HTML-minifiers (zoals Hugo) strippen ze.
  const re = /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const json = JSON.parse(m[1].trim());
      const collect = (node) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) return node.forEach(collect);
        if (node["@type"]) {
          const t = node["@type"];
          (Array.isArray(t) ? t : [t]).forEach((x) => types.add(x));
        }
        if (node["@graph"]) collect(node["@graph"]);
      };
      collect(json);
    } catch {
      // Stille skip: kapotte JSON-LD telt gewoon niet mee.
    }
  }
  return [...types];
}

function checkSchema(home) {
  if (!home.ok) return { pass: false, detail: "Homepage kon niet worden opgehaald." };
  const types = extractSchemaTypes(home.text);
  if (types.length) {
    return { pass: true, detail: "Schema gevonden: " + types.join(", ") + "." };
  }
  return { pass: false, detail: "Geen gestructureerde data (JSON-LD) op de homepage." };
}

function checkMeta(home) {
  if (!home.ok) return { pass: false, detail: "Homepage kon niet worden opgehaald." };
  // Quotes rond attribuutwaarden zijn optioneel vanwege HTML-minificatie.
  const hasTitle = /<title[^>]*>\s*\S[\s\S]*?<\/title>/i.test(home.text);
  const hasDesc = /<meta\b[^>]*\bname=["']?description["']?[^>]*\bcontent=["']?\S/i.test(home.text);
  if (hasTitle && hasDesc) return { pass: true, detail: "Title en meta-description aanwezig." };
  const missing = [];
  if (!hasTitle) missing.push("title");
  if (!hasDesc) missing.push("meta-description");
  return { pass: false, detail: "Ontbreekt: " + missing.join(" en ") + "." };
}

function checkSitemap(sitemap) {
  if (sitemap.ok && /<urlset|<sitemapindex/i.test(sitemap.text)) {
    return { pass: true, detail: "sitemap.xml aanwezig." };
  }
  return { pass: false, detail: "Geen sitemap.xml gevonden." };
}

// Advies per gemist signaal.
const ADVICE = {
  crawlers: "Laat AI-crawlers toe in robots.txt (GPTBot, PerplexityBot, ClaudeBot, Google-Extended).",
  llms: "Voeg een llms.txt toe: een platte samenvatting van je bedrijf, diensten en gegevens.",
  schema: "Voeg JSON-LD schema toe (Organization of ProfessionalService) zodat AI je feiten vertrouwt.",
  meta: "Zorg voor een duidelijke title en meta-description op elke pagina.",
  sitemap: "Genereer een sitemap.xml zodat zoekmachines en AI je pagina's vinden.",
};

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const domain = normalizeDomain(req.query && req.query.domain);
  if (!domain) {
    res.status(400).json({ error: "Voer een geldig domein in, bijvoorbeeld jouwbedrijf.nl." });
    return;
  }

  const base = "https://" + domain;
  const [robots, llms, home, sitemap] = await Promise.all([
    safeFetch(base + "/robots.txt"),
    safeFetch(base + "/llms.txt"),
    safeFetch(base + "/"),
    safeFetch(base + "/sitemap.xml"),
  ]);

  if (!home.ok && !robots.ok && !llms.ok && !sitemap.ok) {
    res.status(502).json({ error: "Kon " + domain + " niet bereiken. Controleer het domein." });
    return;
  }

  const checks = [
    { key: "crawlers", label: "AI-crawlers toegelaten", weight: 25, ...checkCrawlers(robots) },
    { key: "schema", label: "Gestructureerde data (schema)", weight: 25, ...checkSchema(home) },
    { key: "llms", label: "llms.txt aanwezig", weight: 20, ...checkLlms(llms) },
    { key: "meta", label: "Title en meta-description", weight: 15, ...checkMeta(home) },
    { key: "sitemap", label: "Sitemap", weight: 15, ...checkSitemap(sitemap) },
  ];

  let score = 0;
  for (const c of checks) {
    if (c.pass) score += c.weight;
    if (!c.pass) c.advice = ADVICE[c.key];
  }

  res.status(200).json({ domain, score, checks });
}
