# ROLL — AI Caption Generator

A modular, production-quality MVP. Free to run (Puter.js, no API key), two themes,
photo upload, built to extend without a rewrite.

## Structure

```
roll/
  index.html              → landing page + embedded tool
  styles/
    globals.css            → design tokens (both themes), reset, type scale
    components.css         → buttons, chips, cards, nav, theme toggle, FAQ, pricing
    generator.css          → the tool itself: upload, form, result "frames"
  js/
    aiService.js           → ONLY file that knows about Puter. Swap providers here.
    theme.js                → Developed (pastel) / Negative (dark) theme switch
    upload.js               → drag-and-drop photo upload
    ui.js                   → renders result cards
    generator.js            → form logic, calls aiService + ui
    app.js                  → wires everything up on page load
  assets/                  → put your logo/icons here later
```

## Setup (free path — matches what you're already doing)

1. Upload this whole `roll/` folder's contents to your GitHub repo (keep the folder structure —
   don't flatten it, since `index.html` references `styles/` and `js/` by path)
2. Vercel → Import → Deploy (same as before, Framework Preset: Other)
3. Live on your free `.vercel.app` link

## The two themes

- **Developed** (default, pastel/warm) — the "finished print" look
- **Negative** (dark) — the original film-negative look
- Toggle lives top-right in the nav, persists per visitor via localStorage

## Switching AI providers later

Everything AI-related lives in `js/aiService.js`. To move off Puter to your own
Anthropic/OpenAI/Gemini key + backend:

1. Replace the body of `generateWithPuter()` (or add a new function) to call your
   own backend endpoint instead
2. Update `generateCaptions()` to call your new function
3. Nothing in `generator.js`, `ui.js`, or `index.html` needs to change

## Extension points already in place (not built yet, on purpose)

- **Auth**: none yet. When you add accounts, create `js/auth.js` the same way —
  a single module the rest of the app calls into, never touched directly by UI.
- **More tools** (hashtag generator, bio generator, etc.): each can reuse
  `aiService.js` + `components.css` + `generator.css` patterns as a template.
- **Dashboard / saved history / billing**: intentionally not built. Add once you
  have real usage to justify them — the current structure won't need a rewrite
  to add these, just new files following the same module pattern.

## SEO already in place

- Title, meta description, Open Graph, Twitter Card tags in `index.html`
- Basic JSON-LD structured data (SoftwareApplication)
- Semantic sections (`<header>`, `<section>`, `<footer>`) with real text content,
  not just the bare tool — this is what gives Google something to index

**Before going live on a real domain:** replace `rollcaptions.com` in the meta
tags (3 places near the top of `index.html`) with your actual domain.

## What's intentionally NOT in this build yet

Dashboards, billing, saved history, multi-tool suite, authentication — all
deferred until you've validated people actually want this. The architecture
(especially `aiService.js`) is built so adding these later doesn't require
throwing out existing code.
