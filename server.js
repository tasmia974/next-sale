import express from 'express';
import fetch from 'node-fetch';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import PDFDocument from 'pdfkit';
import morgan from 'morgan';
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* -------- Logging (morgan -> winston) -------- */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});
app.use(morgan('combined', { stream: { write: (s) => logger.info(s.trim()) } }));

/* -------- Security & Middleware -------- */
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(',');
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_WINDOW_MS || 60_000),
  max: Number(process.env.API_RATE_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' }),
});
app.use('/api', apiLimiter);

/* -------- Utilities -------- */
function validateFQDN(domain) {
  if (!domain || typeof domain !== 'string') return false;
  try {
    // Reject if contains scheme or path
    if (domain.includes('://') || domain.includes('/')) return false;
    // Use regex: labels 1-63 chars, overall length <=253, TLD >=2 chars
    const fqdnRe = /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
    if (!fqdnRe.test(domain)) return false;
    // Reject IPv4 addresses
    if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) return false;
    return true;
  } catch (e) {
    return false;
  }
}

async function safeFetchJson(url, opts = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timer);

    const ct = res.headers.get('content-type') || '';
    // allow "application/json" or "application/problem+json"
    if (!ct.includes('json')) {
      return { error: `Unexpected content-type: ${ct}`, status: res.status };
    }
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') return { error: 'Request timeout' };
    return { error: err.message || 'Network error' };
  }
}

/* -------- Polling helpers (with safety) -------- */
async function poll(fn, isDone, opts = { attempts: 12, delayMs: 3000 }) {
  let last;
  for (let i = 0; i < opts.attempts; i++) {
    try {
      last = await fn();
    } catch (e) {
      last = { error: e.message || String(e) };
    }
    if (isDone(last)) return last;
    await new Promise((r) => setTimeout(r, opts.delayMs));
  }
  return last || { error: 'Polling timed out' };
}

/* -------- Specific 3rd-party flows -------- */

// SSL Labs: poll until status READY or ERROR (use fromCache & all=done to speed)
async function pollSslLabs(domain) {
  const fn = () => safeFetchJson(`https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&all=done`, {}, 15_000);
  const isDone = (res) => res && (res.status === 'READY' || res.status === 'ERROR' || res.error);
  return poll(fn, isDone, { attempts: 12, delayMs: 5_000 });
}

// Mozilla Observatory: POST analyze (rescan) then poll until end_time
async function pollMozilla(domain) {
  // trigger scan
  await safeFetchJson(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${encodeURIComponent(domain)}&rescan=true&hidden=true`, {}, 10_000);
  const fn = () => safeFetchJson(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${encodeURIComponent(domain)}`, {}, 10_000);
  const isDone = (res) => res && (res.end_time || res.error);
  return poll(fn, isDone, { attempts: 12, delayMs: 4_000 });
}

// W3C: GET JSON (no Content-Type header on GET)
async function runW3c(domain) {
  return safeFetchJson(`https://validator.w3.org/nu/?doc=https://${encodeURIComponent(domain)}&out=json`, { headers: { 'User-Agent': 'site-checker/1.0' } }, 10_000);
}

// WebPageTest flow (optional) or PSI v5
async function runWebPageTest(domain) {
  const WPT_KEY = process.env.WPT_KEY;
  if (!WPT_KEY) return { error: 'WPT_KEY not configured' };
  // start test
  const start = await safeFetchJson(`https://www.webpagetest.org/runtest.php?url=https://${encodeURIComponent(domain)}&f=json&k=${WPT_KEY}&mobile=1`, {}, 10_000);
  if (start.error) return start;
  const testId = start?.data?.testId;
  if (!testId) return { error: 'WPT did not return testId' };
  // poll jsonResult.php?test=TEST_ID
  const fn = () => safeFetchJson(`https://www.webpagetest.org/jsonResult.php?test=${encodeURIComponent(testId)}`, {}, 10_000);
  const isDone = (res) => res && res.statusCode === 200;
  return poll(fn, isDone, { attempts: 30, delayMs: 5000 });
}

async function runPSI(domain) {
  const API_KEY = process.env.PSI_KEY;
  if (!API_KEY) return { error: 'PSI_KEY not configured' };
  return safeFetchJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${encodeURIComponent(domain)}&strategy=mobile&key=${API_KEY}`, {}, 20_000);
}

/* -------- API: validate-domain (backend proxy async validator) -------- */
app.post('/api/validate-domain', (req, res) => {
  const domain = req?.body?.domain;
  if (!domain) return res.status(400).json({ valid: false, error: 'Domain required' });
  const ok = validateFQDN(domain);
  res.json({ valid: ok });
});

/* -------- API: checks/run (runs multiple checks, returns aggregated result) -------- */
app.post('/api/checks/run', async (req, res) => {
  const { domain, name, phone } = req.body || {};
  if (!domain || !validateFQDN(domain)) return res.status(400).json({ error: 'Invalid domain' });

  const out = {
    submittedBy: { name: name || null, phone: phone || null, domain },
    ssl: null,
    mozilla: null,
    w3c: null,
    pageSpeed: null
  };

  try {
    // parallel start polling where needed; PSI preferred over WPT unless WPT_KEY present
    const tasks = [
      pollSslLabs(domain),
      pollMozilla(domain),
      runW3c(domain),
      process.env.WPT_KEY ? runWebPageTest(domain) : runPSI(domain)
    ];
    const [ssl, mozilla, w3c, psi] = await Promise.all(tasks);
    out.ssl = ssl;
    out.mozilla = mozilla;
    out.w3c = w3c;
    out.pageSpeed = psi;
    return res.json(out);
  } catch (err) {
    logger.error('checks/run failed', { message: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Server error running checks' });
  }
});

/* -------- Secure PDF endpoint (rate-limited + CORS + safe assets) -------- */
const pdfLimiter = rateLimit({
  windowMs: Number(process.env.PDF_RATE_WINDOW_MS || 60_000),
  max: Number(process.env.PDF_RATE_MAX || 5),
  handler: (req, res) => res.status(429).json({ error: 'Too many PDF requests' }),
});
app.post('/api/report', cors({ origin: allowedOrigins }), pdfLimiter, (req, res) => {
  try {
    const { domain, name, phone, status, recommendations } = req.body || {};
    if (!domain || !validateFQDN(domain)) return res.status(400).json({ error: 'Invalid domain' });

    // PDF metadata + streaming
    const doc = new PDFDocument({ margin: 36 });
    const filename = `${domain}-report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Metadata
    doc.info.Title = `Website Report - ${domain}`;
    doc.info.Author = process.env.APP_NAME || 'Site Checker';

    // Logo: resolve absolute path; handle missing asset gracefully
    const logoCandidate = process.env.LOGO_PATH ? path.resolve(process.env.LOGO_PATH) : path.join(__dirname, 'assets', 'logo.png');
    if (fs.existsSync(logoCandidate)) {
      try { doc.image(logoCandidate, 36, 36, { width: 80 }); }
      catch (e) { logger.warn('logo embed failed', { err: e.message }); }
    } else {
      logger.debug('logo not found, skipping', { logoCandidate });
    }

    doc.fontSize(18).text(`Website Report — ${domain}`, 130, 50);
    doc.moveDown(2);

    doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
    doc.text(`Submitted by: ${name || 'N/A'} (${phone || 'N/A'})`);
    doc.moveDown();

    doc.fontSize(14).text('Status', { underline: true });
    doc.fontSize(12).text(status || 'N/A');
    doc.moveDown();

    doc.fontSize(14).text('Top Recommendations', { underline: true });
    (Array.isArray(recommendations) ? recommendations : []).forEach((r, i) => doc.text(`${i + 1}. ${r}`));

    // Footer (page)
    const addFooter = () => {
      const pages = doc.bufferedPageRange ? doc.bufferedPageRange() : null;
      // note: PDFKit needs special logic to add per-page footers after pages are finalized in complex cases.
      // For simplicity, add a minimal footer at the current point:
      doc.moveDown(2);
      doc.fontSize(10).fillColor('gray').text(`${process.env.APP_NAME || 'Site Checker'} — Generated ${new Date().toLocaleDateString()}`, { align: 'center' });
    };
    addFooter();

    doc.end();
    doc.pipe(res);
  } catch (err) {
    logger.error('report endpoint error', { message: err.message, stack: err.stack });
    return res.status(500).json({ error: 'PDF generation failed' });
  }
});

/* -------- Static & SSR serve (if present) -------- */
const distFolder = path.join(__dirname, 'dist', process.env.BROWSER_OUTPUT_DIR || 'browser');
if (fs.existsSync(distFolder)) {
  app.use(express.static(distFolder, { maxAge: '1d' }));
  // If using Angular Universal, you'd plug in the engine here - omitted for plain server.js
  app.get('*', (req, res) => res.sendFile(path.join(distFolder, 'index.html')));
} else {
  app.get('/', (req, res) => res.send('API is running.'));
}

/* -------- Error handler & start -------- */
app.use((err, req, res, next) => {
  logger.error('Unhandled', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
