Good — I have everything I need. Here's the full plan.## The Plan

**What we're building:** A static-frontend, serverless-backend web app (deployable on Vercel) that presents the HFVS dissertation as a live decision-support tool for a stakeholder (e.g. KMRC / State Dept of Housing) — not as an academic PDF, and not as a raw notebook.

I pulled the real numbers straight out of your notebook's executed outputs (not just your summary doc) so the plan is grounded in what actually ran:

- 21,347 households, 47 counties, county names confirmed matching KHS spelling (`Murang'a`, `Elgeyo-Marakwet`, `Taita-Taveta`, etc.) — important for choropleth join.
- Tier 1 champion: S11.2 hurdle renter submodel, **R²=0.6172**, vs Linear 0.2285 → LightGBM 0.5923 → Ensemble 0.6020.
- SHAP top drivers: income bracket (0.0517), tenure type (0.0211), water spend (0.0100), floor area (0.0076), approved building (0.0068).
- Pillar β weights: D1=0.241, D2=0.352 (tenure insecurity dominates), D3=0.129, D4=0.179, D5=0.099.
- Tier 2 DEA: mean θ_CCR 0.832, mean θ_BCC 0.884, 9 CCR-frontier counties (Bungoma, Garissa, Kiambu, Lamu, Migori, Nairobi, Nyeri, Tharaka-Nithi, Wajir), weakest: West Pokot (0.5504), Nyamira (0.5509), Marsabit (0.6187).
- Tier 3 MILP: Regime A (concentration) 19/47 counties, 6,000 units, KSh19.75B; Regime B (universal) 47/47 counties, same cost — the "free" universal coverage finding; at the 200,000-unit official target, the entire 15,365-unit backlog (KSh50.58B) is fundable — **delivery capacity, not levy revenue, is the actual constraint** (1,795 units completed FY24/25). This is your best headline and it needs to be the hero stat on the landing tab.

---

## 1. Architecture (high level)

```
Browser (index.html, vanilla JS + Chart.js + Leaflet)
   │
   ├── Static JSON data files (pre-computed once from your notebook/parquet — no live pandas at runtime)
   │      county_metrics.json, shap.json, model_metrics.json, milp.json, pillars.json
   │
   ├── Real Kenya counties GeoJSON (47 counties, fetched once, bundled locally — not fetched live from client)
   │
   └── fetch('/api/ask') ──► Vercel Serverless Function (Node, /api/ask.js)
                                   │
                                   ├── Loads a small per-tab "context pack" (a slice of the JSON above,
                                   │    not the whole dataset) based on which tab the user is asking from
                                   │
                                   └── Calls Groq API (OpenAI-compatible chat completion, e.g. llama-3.3-70b)
                                        with a system prompt = "You are the HFVS analyst. Only reason over
                                        this context. Answer in plain, non-jargon language. Return markdown."
                                   │
                                   └── Response streamed/returned to browser, rendered as formatted markdown
                                        (not raw JSON, not a hardcoded template)
```

This is a genuine RAG pattern (retrieval = deterministic JSON slice keyed to tab + question keywords, not a vector DB — appropriate at this scale, honest, and free of hallucination risk since the LLM never invents a number, it only explains numbers we hand it) plus real LLM reasoning for the explanation layer.

**Key design decision:** the LLM never computes anything (no live pandas, no notebook re-execution at runtime — that's not something a Vercel serverless function can or should do). It explains, contextualizes, and answers "why/what does this mean" questions about numbers we've already computed and frozen into JSON. This is the correct, honest architecture for a deployed decision-support tool — it's fast, cheap, and never lies about the math.

---

## 2. Data extraction step (must happen before building the UI)

I will run targeted cells against your `master_dirty.parquet` (reconstructing the exact logic already in your notebook — S9.1 DEA, S9.2 MILP, S4.3 pillar weights, S6 SHAP) to produce clean, small JSON artifacts:

| File | Contents |
|---|---|
| `county_metrics.json` | Per county (47 rows): HFVS mean, tier breakdown, θ_CCR, θ_BCC, scale efficiency, frontier flag, MILP units (Regime A & B), MILP cost, population 2026 |
| `model_metrics.json` | R²/MAE per model across S6/S8/S10/S11, quantile band width, standard-vs-spatial CV gap |
| `shap.json` | Top 15 SHAP features + human-readable labels |
| `pillars.json` | D1–D5 β weights, discriminant validity matrix, pillar-vs-HCB correlations |
| `milp.json` | Regime A vs B national totals, aspirational-quota scenario, sensitivity band inputs |
| `national_summary.json` | The headline numbers for the landing tab (47%, of High+Critical vs 4.68% cost-only screen, etc.) |

Each of these is a few KB — small enough to embed directly in the serverless function's context window per tab, no database needed.

**Kenya counties GeoJSON**: I'll pull a standard, accurate 47-county Kenya boundaries GeoJSON (public, commonly used ones exist at admin-1 level keyed by county name) and normalize county name spelling to match your parquet's `county_name` values exactly, so the choropleth join is lossless — this replaces your notebook's bar-chart fallback with a real interactive map.

---

## 3. Tabs (information architecture)

Each tab = one context window for the LLM chat, so questions asked from that tab only see that tab's data (keeps answers grounded, cheap, and fast).

1. **Overview** — the executive story in plain language (Business Question → Decision → What the data says → Bottom line). Headline stat cards (47% vs 4.68%, R²=0.6172, delivery-not-revenue finding).
2. **Household Vulnerability (HFVS)** — tier distribution chart (Chart.js), pillar weight breakdown (tenure dominates), plain-language explanation of what HFVS measures.
3. **What Drives It (Model & SHAP)** — model comparison bar chart (Linear→LightGBM→Ensemble→Hurdle), SHAP driver ranking in plain language ("income bracket matters most, more than tenure or location").
4. **County Map (DEA Efficiency)** — the real interactive Leaflet choropleth, color-coded by θ_CCR or HFVS (toggle), click a county for a popup with its numbers, frontier counties highlighted.
5. **Levy Allocation (MILP)** — Regime A vs Regime B comparison, the "universal coverage is free at this quota" finding, aspirational-quota scenario, per-county allocation table sortable/filterable.
6. **Ask the Analyst** — a general chat tab with access to the national summary + cross-tier consistency data, for questions that span multiple tabs.

Each tab has its own small "Ask about this" chat box pinned to it, using that tab's context pack.

---

## 4. Groq + RAG behavior details

- Model: a fast Groq-hosted model (e.g. Llama 3.3 70B) — good reasoning, cheap, low latency, ideal for a live demo tool.
- System prompt per tab enforces: no jargon, short paragraphs, use bullet points and bold sparingly, never invent a number not present in the provided context, if asked something outside the context politely redirect to the relevant tab.
- Frontend renders the LLM's markdown response properly (headers, bold, bullet lists) rather than dumping raw text — I'll use a small markdown renderer (e.g. `marked.js` from a CDN) rather than hand-rolling regex, so responses look like a real formatted answer, not a wall of text or broken pseudo-markdown.
- API key: stored as a Vercel environment variable (`GROQ_API_KEY`), never exposed client-side — this is why we need the one serverless function.

---

## 5. Folder structure

```
hfvs-dashboard/
├── api/
│   └── ask.js                 # Vercel serverless function → calls Groq
├── data/
│   ├── county_metrics.json
│   ├── model_metrics.json
│   ├── shap.json
│   ├── pillars.json
│   ├── milp.json
│   ├── national_summary.json
│   └── kenya_counties.geojson
├── public/                    # (or just root, since it's one static index.html)
│   ├── index.html             # the entire app: tabs, charts, map, chat UI
│   ├── styles.css
│   └── app.js                 # tab logic, Chart.js setup, Leaflet setup, fetch('/api/ask') calls
├── package.json
├── vercel.json                # routes /api/* to serverless functions, rest is static
└── README.md
```

Single-page (`index.html`) as you requested — tabs are client-side view switches, not separate pages, so it feels like one cohesive app.

---

## 6. Deployment steps (Vercel)

1. `npm init -y` in the project folder, add `groq-sdk` (or plain `fetch` to Groq's OpenAI-compatible endpoint — no SDK needed, keeps it lightweight) as the only real dependency for `api/ask.js`.
2. Set `GROQ_API_KEY` in Vercel project settings → Environment Variables.
3. `vercel.json` — minimal config so `/api/ask` is a Node serverless function and everything else is served statically.
4. `vercel --prod` (or connect the GitHub repo to Vercel for auto-deploy on push).
5. No build step needed since it's vanilla HTML/JS/Chart.js/Leaflet via CDN — deploys in seconds.

---

## 7. Skills I'll use during actualization

- **data-analysis** — for the extraction pass over `master_dirty.parquet` to regenerate the DEA/MILP/SHAP tables cleanly as JSON.
- No docx/pptx/pdf skills needed for this deliverable — output is code files, not documents.
- Frontend built directly (no React needed given single static `index.html` request) — I'll still apply good visual-design judgment (typography, color-coding on the choropleth, spacing) even outside the React `frontend-design` skill's exact scope.

---

### One thing I need from you before I actualize
A Groq API key to place in the Vercel env var (or you can add it yourself right before deploying — I can leave a placeholder and instructions). I don't need it to build the code, only for you to test the live chat once deployed.

Want me to proceed with actualization now — starting with the data-extraction pass against your parquet, then the JSON artifacts, then the full `index.html` app?