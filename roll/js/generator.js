/**
 * generator.js
 * ---------------------------------------------------------------------------
 * Owns the generator form state and orchestrates AIService + UI.
 * Never talks to Puter directly — only through AIService.generateCaptions().
 * ---------------------------------------------------------------------------
 */

const Generator = (() => {
  let activeTone = "Witty & playful";

  function init() {
    document.querySelectorAll(".chip[data-tone]").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chip[data-tone]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        activeTone = chip.dataset.tone;
      });
    });

    document.getElementById("genBtn").addEventListener("click", handleGenerate);
  }

  async function handleGenerate() {
    const genBtn = document.getElementById("genBtn");
    const genLabel = document.getElementById("genLabel");
    const statusEl = document.getElementById("status");
    const description = document.getElementById("desc").value.trim();
    const platform = document.getElementById("platform").value;
    const length = document.getElementById("length").value;
    const imageDataUrl = UploadManager.getImageDataUrl();

    if (!description && !imageDataUrl) {
      statusEl.textContent = "Describe your post or upload a photo first ↑";
      statusEl.classList.add("err");
      return;
    }
    statusEl.classList.remove("err");
    statusEl.textContent = "";

    genBtn.disabled = true;
    genLabel.textContent = "Developing...";
    UI.showSkeleton();

    try {
      const captions = await AIService.generateCaptions({
        description, tone: activeTone, platform, length, imageDataUrl
      });
      UI.renderFrames(captions);
      statusEl.textContent = `Developed ${captions.length} captions`;
    } catch (err) {
      console.error(err);
      UI.showEmpty(err.message || "Something went wrong developing your captions — try again.");
      statusEl.textContent = err.message || "Something went wrong";
      statusEl.classList.add("err");
    } finally {
      genBtn.disabled = false;
      genLabel.textContent = "Develop captions →";
    }
  }

  return { init };
})();
