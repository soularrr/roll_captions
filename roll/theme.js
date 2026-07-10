/**
 * theme.js
 * ---------------------------------------------------------------------------
 * Switches between "developed" (pastel, default) and "negative" (dark).
 * Persists the user's choice across visits.
 * ---------------------------------------------------------------------------
 */

const ThemeManager = (() => {
  const STORAGE_KEY = "roll-theme";

  function apply(theme) {
    if (theme === "negative") {
      document.documentElement.setAttribute("data-theme", "negative");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    document.querySelectorAll("[data-theme-btn]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.themeBtn === theme);
    });
  }

  function set(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    apply(theme);
  }

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY) || "developed";
    apply(saved);

    document.querySelectorAll("[data-theme-btn]").forEach(btn => {
      btn.addEventListener("click", () => set(btn.dataset.themeBtn));
    });
  }

  return { init, set };
})();
