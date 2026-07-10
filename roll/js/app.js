/**
 * app.js
 * ---------------------------------------------------------------------------
 * Entry point. Wires up all modules once the DOM is ready.
 * ---------------------------------------------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  UploadManager.init();
  Generator.init();
});
