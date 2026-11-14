"use strict";

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const crypto = require("node:crypto");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "project-briefs.jsonl");
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY = 32 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;
const requestLog = new Map();

const serviceTypes = new Set([
  "Cloud Infrastructure",
  "App Deployment",
  "Managed Database",
  "Storage",
  "Network & Security",
  "Project Consultation",
  "Custom",
]);
const plans = new Set(["Starter", "Professional", "Business", "Custom"]);
const regions = new Set(["Jakarta", "Singapore", "Tokyo", "Not sure yet"]);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function send(res, status, body, contentType = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
  res.end(body);
}

function json(res, status, payload) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
}

function clean(value, max) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function validEmail(email) {
  return email.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

function rateLimited(req) {
  const key = req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

async function readJson(req) {
  let total = 0;
  const chunks = [];
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY) throw Object.assign(new Error("Request body too large."), { status: 413 });
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw Object.assign(new Error("Invalid JSON body."), { status: 400 });
  }
}

async function saveProjectBrief(req, res) {
  if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    return json(res, 415, { ok: false, error: "Content-Type must be application/json." });
  }
  if (rateLimited(req)) {
    return json(res, 429, { ok: false, error: "Too many submissions. Try again later." });
  }

  try {
    const input = await readJson(req);
    // Honeypot field: silently accept bots without storing the payload.
    if (clean(input.website, 120)) {
      return json(res, 202, { ok: true, id: `sf_${crypto.randomUUID().slice(0, 8)}`, receivedAt: new Date().toISOString() });
    }

    const name = clean(input.name, 80);
    const email = clean(input.email, 160).toLowerCase();
    const company = clean(input.company, 120);
    const service = clean(input.service, 80);
    const plan = clean(input.plan, 40) || "Custom";
    const preferredRegion = clean(input.preferredRegion, 40) || "Not sure yet";
    const message = clean(input.message, 4000);
    const consent = input.consent === true;

    if (!consent) return json(res, 400, { ok: false, error: "Consent is required before submitting a project brief." });
    if (name.length < 2) return json(res, 400, { ok: false, error: "Name must be at least 2 characters." });
    if (!validEmail(email)) return json(res, 400, { ok: false, error: "Enter a valid email address." });
    if (!serviceTypes.has(service)) return json(res, 400, { ok: false, error: "Choose a valid service type." });
    if (!plans.has(plan)) return json(res, 400, { ok: false, error: "Choose a valid plan." });
    if (!regions.has(preferredRegion)) return json(res, 400, { ok: false, error: "Choose a valid region." });
    if (message.length < 20) return json(res, 400, { ok: false, error: "Project description must be at least 20 characters." });

    const receivedAt = new Date().toISOString();
    const id = `sf_${receivedAt.slice(0, 10).replaceAll("-", "")}_${crypto.randomUUID().slice(0, 8)}`;
    const record = {
      id,
      receivedAt,
      name,
      email,
      company,
      service,
      plan,
      preferredRegion,
      message,
      source: "skyforge-website",
    };

    await fsp.mkdir(DATA_DIR, { recursive: true });
    await fsp.appendFile(SUBMISSIONS_FILE, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
    return json(res, 201, { ok: true, id, receivedAt });
  } catch (error) {
    console.error("Project brief error:", error);
    return json(res, error.status || 500, { ok: false, error: error.status ? error.message : "Unable to save project brief." });
  }
}

async function serveStatic(req, res, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return send(res, 400, "Bad request", "text/plain; charset=utf-8");
  }
  let relative = decoded.replace(/^\/+/, "");
  if (!relative) relative = "index.html";
  if (relative.endsWith("/")) relative += "index.html";

  // Never expose stored consultation submissions or hidden project metadata.
  const firstSegment = relative.split("/")[0];
  if (firstSegment === "data" || firstSegment.startsWith(".")) {
    return send(res, 404, "Not found", "text/plain; charset=utf-8");
  }

  const candidate = path.resolve(ROOT, relative);
  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${path.sep}`)) {
    return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
  }

  let file = candidate;
  try {
    const stat = await fsp.stat(file);
    if (stat.isDirectory()) file = path.join(file, "index.html");
    const finalStat = await fsp.stat(file);
    if (!finalStat.isFile()) throw new Error("not a file");
  } catch {
    const notFound = path.join(ROOT, "404.html");
    try {
      const body = await fsp.readFile(notFound);
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff" });
      return res.end(body);
    } catch {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
  }

  const ext = path.extname(file).toLowerCase();
  const contentType = mime[ext] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/project-brief") {
    if (req.method === "POST") return saveProjectBrief(req, res);
    if (req.method === "OPTIONS") {
      res.writeHead(204, { Allow: "POST, OPTIONS" });
      return res.end();
    }
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }
  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`SKYFORGE running at http://${HOST}:${PORT}`);
  console.log(`Project briefs will be stored in ${SUBMISSIONS_FILE}`);
});
