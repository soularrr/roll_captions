/**
 * aiService.js
 * ---------------------------------------------------------------------------
 * The ONLY file in this project that knows which AI provider is in use.
 * Every other file calls generateCaptions() and never touches the
 * underlying provider directly. Currently using Google Gemini's free API
 * (no visitor login required, unlike the earlier Puter version).
 * ---------------------------------------------------------------------------
 */

const AIService = (() => {

  /**
   * Builds the prompt sent to the model. Kept provider-agnostic on purpose.
   */
  function buildPrompt({ description, tone, platform, length }) {
    return `You are a social media caption writer for influencers and content creators. Generate 6 different captions for a ${platform} post.

${description ? `Post description: "${description}"` : "Use the attached photo as the basis for the captions."}
Tone: ${tone}
Length: ${length}

Rules:
- Each caption must be genuinely different in angle/style, not just reworded
- Keep captions native to ${platform} (short and punchy for TikTok/Twitter/X, can be longer for Instagram/LinkedIn)
- Avoid generic filler like "check out this amazing photo"
- For each caption also provide: 5 relevant hashtags, 2-3 fitting emoji, a short version (under 60 characters), and a one-line CTA suggestion
- Respond ONLY with valid JSON, no markdown, no backticks, in this exact array format:
[{"caption": "...", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5", "emoji": "✨🌅", "short": "...", "cta": "..."}]`;
  }

  /**
   * Converts a data URL (e.g. "data:image/jpeg;base64,...") into the
   * { mimeType, data } shape Gemini's API expects for inline images.
   */
  function dataUrlToInlinePart(dataUrl) {
    const [header, base64Data] = dataUrl.split(",");
    const mimeType = header.match(/data:(.*);base64/)[1];
    return { inline_data: { mime_type: mimeType, data: base64Data } };
  }

  /**
   * Current provider: Google Gemini, called through our own /api/generate
   * serverless function. The API key lives only in Vercel's environment
   * variables — never in this file, never in the repo.
   */
  async function generateWithGemini({ description, tone, platform, length, imageDataUrl }) {
    const prompt = buildPrompt({ description, tone, platform, length });

    const parts = [{ text: prompt }];
    if (imageDataUrl) {
      parts.push(dataUrlToInlinePart(imageDataUrl));
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parts })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Backend proxy error:", res.status, errText);
      throw new Error(`Request failed (${res.status})`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let clean = text.replace(/```json|```/g, "").trim();
    const arrayMatch = clean.match(/\[[\s\S]*\]/);
    if (arrayMatch) clean = arrayMatch[0];

    try {
      return JSON.parse(clean);
    } catch (parseErr) {
      console.error("AIService: failed to parse Gemini response as JSON. Raw text was:", text);
      throw new Error("The AI response wasn't valid JSON — see console for raw output.");
    }
  }

  /**
   * Public entry point. This is the ONLY function the rest of the app calls.
   * Swap the body of this function to change providers — nothing else
   * in the codebase needs to change.
   */
  async function generateCaptions(params) {
    return generateWithGemini(params);
  }

  return { generateCaptions };
})();
