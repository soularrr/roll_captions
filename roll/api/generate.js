export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server misconfigured: missing GEMINI_API_KEY" });
    }

    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const parts = body?.parts;

    if (!parts) {
      return res.status(400).json({ error: "Missing 'parts' in request body" });
    }

    const modelsToTry = ["gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError = null;

    for (const model of modelsToTry) {
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const geminiRes = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ role: "user", parts }] })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            return res.status(200).json(data);
          }

          const errText = await geminiRes.text();
          lastError = { status: geminiRes.status, body: errText };

          if (geminiRes.status !== 503 && geminiRes.status !== 404) {
            return res.status(geminiRes.status).json({ error: errText });
          }

          if (geminiRes.status === 404) break;
          if (attempt === 0) await new Promise(r => setTimeout(r, 800));
        } catch (err) {
          lastError = { status: 500, body: err.message };
        }
      }
    }

    return res.status(lastError?.status || 503).json({ error: lastError?.body || "All models unavailable" });

  } catch (fatalErr) {
    console.error("Fatal error in /api/generate:", fatalErr);
    return res.status(500).json({ error: "Function crashed: " + fatalErr.message });
  }
}
