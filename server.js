import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import PDFDocument from "pdfkit";

const app = express();
app.use(cors());
app.use(express.json());

// helper: safe fetch with error handling
async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      return { error: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

app.post("/api/checks/run", async (req, res) => {
  const { domain, name, phone } = req.body;

  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  // build base response
  const results = {
    submittedBy: { name: name || null, phone: phone || null, domain },
    ssl: null,
    mozilla: null,
    w3c: null,
    pageSpeed: null
  };

  try {
    results.ssl = await safeFetchJson(
      `https://api.ssllabs.com/api/v3/analyze?host=${domain}`
    );

    results.mozilla = await safeFetchJson(
      `https://http-observatory.security.mozilla.org/api/v1/analyze?host=${domain}`
    );

    results.w3c = await safeFetchJson(
      `https://validator.w3.org/nu/?doc=https://${domain}&out=json`,
      { headers: { "Content-Type": "application/json" } }
    );

    results.pageSpeed = await safeFetchJson(
      `https://www.webpagetest.org/runtest.php?url=https://${domain}&strategy=mobile`,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json(results);
  } catch (err) {
    console.error("Unexpected error in /api/checks/run:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});


app.post("/api/report", (req, res) => {
  const { domain, name, phone, status, recommendations } = req.body;

  // Create PDF
  const doc = new PDFDocument();

  // Stream it back to client instead of saving on disk
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
  doc.pipe(res);

  // --- PDF Content ---
  doc.image("logo.png", 50, 45, { width: 80 }) // Add your logo
    .fontSize(20)
    .text("Website Performance Report", 150, 50);

  doc.moveDown().fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Domain: ${domain}`);
  doc.text(`Submitted by: ${name} (${phone})`);

  doc.moveDown().fontSize(14).text("Status:", { underline: true });
  doc.fontSize(12).text(status || "No status available");

  doc.moveDown().fontSize(14).text("Top Recommendations:", { underline: true });
  (recommendations || []).forEach((rec, i) => {
    doc.fontSize(12).text(`${i + 1}. ${rec}`);
  });

  // Finalize PDF
  doc.end();
});


app.listen(3000, () => console.log("running on http://localhost:3000"));
