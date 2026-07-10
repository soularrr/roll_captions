/**
 * ui.js
 * ---------------------------------------------------------------------------
 * Pure rendering functions for the results area. No AI or upload logic here.
 * ---------------------------------------------------------------------------
 */

const UI = (() => {
  const filmstrip = document.getElementById("filmstrip");
  const resultsCount = document.getElementById("resultsCount");

  function showSkeleton(count = 3) {
    filmstrip.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "skeleton-frame";
      filmstrip.appendChild(el);
    }
    resultsCount.textContent = "developing...";
  }

  function showEmpty(message) {
    filmstrip.innerHTML = `<div class="empty">${message}</div>`;
    resultsCount.textContent = "";
  }

  function renderFrames(captions) {
    filmstrip.innerHTML = "";
    resultsCount.textContent = `${captions.length} frames`;

    captions.forEach((item, i) => {
      const frame = document.createElement("div");
      frame.className = "frame";
      frame.style.animationDelay = `${i * 60}ms`;

      const fullText = item.caption + (item.hashtags ? "\n\n" + item.hashtags : "");

      frame.innerHTML = `
        <div class="frame-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="frame-body">
          <p class="caption-text"></p>
          <div class="frame-foot">
            <div class="frame-meta">
              <span class="hashtags"></span>
              <span class="char-count">${item.caption.length} chars</span>
            </div>
            <div class="frame-actions">
              <button class="icon-btn" data-action="copy-short">Copy short</button>
              <button class="icon-btn" data-action="copy">Copy</button>
            </div>
          </div>
        </div>
      `;

      frame.querySelector(".caption-text").textContent = item.caption + (item.emoji ? "  " + item.emoji : "");
      frame.querySelector(".hashtags").textContent = item.hashtags || "";

      frame.querySelector('[data-action="copy"]').addEventListener("click", (e) => {
        copyToClipboard(fullText, e.target);
      });
      frame.querySelector('[data-action="copy-short"]').addEventListener("click", (e) => {
        copyToClipboard(item.short || item.caption, e.target);
      });

      filmstrip.appendChild(frame);
    });
  }

  function copyToClipboard(text, btnEl) {
    navigator.clipboard.writeText(text);
    const original = btnEl.textContent;
    btnEl.textContent = "Copied ✓";
    btnEl.classList.add("copied");
    setTimeout(() => {
      btnEl.textContent = original;
      btnEl.classList.remove("copied");
    }, 1600);
  }

  return { showSkeleton, showEmpty, renderFrames };
})();
