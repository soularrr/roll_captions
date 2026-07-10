/**
 * aiService.js
 * ---------------------------------------------------------------------------
 * The ONLY file in this project that knows which AI provider is in use.
 * Every other file calls generateCaptions() and never touches Puter,
 * Anthropic, OpenAI, or Gemini directly. To switch providers later
 * (e.g. to your own Anthropic API key + backend), only this file changes.
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
   * Current provider: Puter.js (free, no API key, user-pays model).
   * Supports an optional image (data URL or hosted URL) for vision-based captions.
   */
  async function generateWithPuter({ description, tone, platform, length, imageDataUrl }) {
    const prompt = buildPrompt({ description, tone, platform, length });

    let response;
    if (imageDataUrl) {
      // Puter's documented image-input signature: chat(prompt, imageUrlOrDataUrl, options)
      response = await puter.ai.chat(prompt, imageDataUrl, { model: "google/gemini-3.5-flash" });
    } else {
      response = await puter.ai.chat(prompt, { model: "claude-sonnet-4-6" });
    }

    const text = typeof response === "string"
      ? response
      : response.message?.content?.[0]?.text ?? response.message?.content ?? "";

    let clean = text.replace(/```json|```/g, "").trim();

    // Defensive: if the model wrapped the array in extra prose, extract just the array.
    const arrayMatch = clean.match(/\[[\s\S]*\]/);
    if (arrayMatch) clean = arrayMatch[0];

    try {
      return JSON.parse(clean);
    } catch (parseErr) {
      console.error("AIService: failed to parse model response as JSON. Raw text was:", text);
      throw new Error("The AI response wasn't valid JSON — see console for raw output.");
    }
  }

  /**
   * Public entry point. This is the ONLY function the rest of the app calls.
   * Swap the body of this function to change providers — nothing else
   * in the codebase needs to change.
   */
  async function generateCaptions(params) {
    return generateWithPuter(params);
  }

  return { generateCaptions };
})();
