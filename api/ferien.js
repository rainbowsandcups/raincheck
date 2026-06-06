// Vercel Function: GET/POST vacation day selections for a year.
// Backed by Upstash Redis (Vercel Marketplace integration).
//
// GET  /api/ferien?year=2026 → { year, days: ["2026-05-27", ...] }
// POST /api/ferien?year=2026 with body { days: [...] } → { ok, count }

const MAX_DAYS = 25;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  const year = String(req.query.year || new Date().getFullYear());
  if (!/^\d{4}$/.test(year)) {
    return res.status(400).json({ error: "invalid year" });
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: "kv not configured" });
  }

  const key = `ferien:${year}`;
  const headers = { Authorization: `Bearer ${token}` };

  try {
    if (req.method === "GET") {
      const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers,
      });
      const data = await r.json();
      const stored = data && data.result;
      let days = [];
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) days = parsed;
        } catch {
          // Treat unparseable as empty
        }
      }
      // Browsers should fetch fresh data each time
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ year: Number(year), days });
    }

    if (req.method === "POST") {
      const body = req.body;
      const incoming = Array.isArray(body && body.days) ? body.days : null;
      if (!incoming) {
        return res.status(400).json({ error: "missing days array" });
      }
      if (incoming.length > MAX_DAYS) {
        return res
          .status(400)
          .json({ error: `too many days (max ${MAX_DAYS})` });
      }
      // Validate ISO date format and that all dates belong to the year
      const yearPrefix = `${year}-`;
      const cleaned = [];
      for (const d of incoming) {
        if (typeof d !== "string" || !ISO_DATE.test(d)) {
          return res.status(400).json({ error: `invalid date: ${d}` });
        }
        if (!d.startsWith(yearPrefix)) {
          return res
            .status(400)
            .json({ error: `date ${d} not in year ${year}` });
        }
        cleaned.push(d);
      }
      // De-duplicate
      const unique = [...new Set(cleaned)];

      const payload = JSON.stringify(unique);
      const r = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers,
        body: payload,
      });
      if (!r.ok) {
        const txt = await r.text();
        return res
          .status(502)
          .json({ error: "kv write failed", detail: txt });
      }
      return res.status(200).json({ ok: true, count: unique.length });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("[api/ferien] error:", err);
    return res.status(500).json({ error: "internal error", detail: String(err) });
  }
}
