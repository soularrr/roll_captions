const AIService = (() => {

  /**
   * Maps the UI's length labels to concrete constraints the model will
   * actually follow — vague labels like "Short" get ignored otherwise.
   */
  function lengthGuidance(length) {
    const map = {
      "Short & punchy": "Each caption's 'caption' field MUST be under 60 characters total. One punchy line, no exceptions.",
      "Medium": "Each caption's 'caption' field should be roughly 60-150 characters — a couple of sentences.",
      "Long & storytelling": "Each caption's 'caption' field should be roughly 150-300 characters — a short story or mini-narrative."
    };
    return map[length] || map["Medium"];
  }

  /**
   * Builds the prompt sent to the model. Kept provider-agnostic on purpose.
   */
  function buildPrompt({ description, tone, platform, length }) {
    return `You are a social media caption writer for influencers and content creators. Generate 6 different captions for a ${platform} post.

${description ? `Post description: "${description}"` : "Use the attached photo as the basis for the captions."}
Tone: ${tone}

STRICT LENGTH REQUIREMENT: ${lengthGuidance(length)}
This length limit applies to the main "caption" field specifically — treat it as a hard constraint, not a suggestion. Count characters before finalizing each caption.

Rules:
- Each caption must be genuinely different in angle/style, not just reworded
- Keep captions native to ${platform} (short and punchy for TikTok/Twitter/X, can be longer for Instagram/LinkedIn) — but the length requirement above always takes priority over this
- Avoid generic filler like "check out this amazing photo"
- For each caption also provide: 5 relevant hashtags, 2-3 fitting emoji, a short version (under 60 characters), and a one-line CTA suggestion
- Respond ONLY with valid JSON, no markdown, no backticks, in this exact array format:
[{"caption": "...", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5", "emoji": "✨🌅", "short": "...", "cta": "..."}]`;
  }

  function dataUrlToInlinePart(dataUrl) {
    const [header, base64Data] = dataUrl.split(",");
    const mimeType = header.match(/data:(.*);base64/)[1];
    return { inline_data: { mime_type: mimeType, data: base64Data } };
  }

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
      if (res.status === 503) {
        throw new Error("The AI is a bit busy right now — try again in a few seconds.");
      }
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

  async function generateCaptions(params) {
    return generateWithGemini(params);
  }

  return { generateCaptions };
})();
