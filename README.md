# HFVS Housing Vulnerability Decision Tool

A stakeholder-ready dashboard for the **HFVS Vulnerability Chain** dissertation (Kenya Affordable Housing Programme).
Static frontend + one serverless function, deployable on **Vercel**.

## What it shows

| Tab | Content |
|---|---|
| **Overview** | Headline finding (delivery capacity, not levy revenue, is the bottleneck), tier distribution, county vulnerability ranking |
| **County Map** | Real interactive Leaflet choropleth of all 47 counties — colour by vulnerability, DEA efficiency, unit cost, allocations, or vulnerable share; click a county for its full profile |
| **Model Performance** | Model chain (Linear 0.23 → two-stage hurdle 0.62 R²), SHAP drivers |
| **Vulnerability Drivers** | The five learned HFVS pillars (Tenure Insecurity 35% is the largest), plain-language explanations |
| **Budget Allocation** | MILP Regime A vs B, aspirational 200,000-unit scenario, per-county table |
| **Ask the Analyst** | Cross-cutting Groq-powered assistant |

Every tab also has its own **"Ask about this" chat box** using a per-tab RAG context pack.

## Architecture

- `index.html` + `app.js` + `styles.css` — vanilla JS, Chart.js, Leaflet, marked.js (CDN)
- `data/*.json` — pre-computed results frozen from the notebook (regenerate with `python3 build_data.py`)
- `api/ask.js` — Vercel serverless function: builds a per-tab context pack, calls Groq (`llama-3.3-70b-versatile`), returns markdown. **The LLM never computes numbers** — it only explains the frozen JSON, eliminating hallucinated figures.
- `vercel.json` — static serving + function config

## Deploy on Vercel

1. Push this folder to the repo (or `vercel` from this directory).
2. In Vercel → Project → Settings → Environment Variables, add:
   - `GROQ_API_KEY` = your key from https://console.groq.com
   - optional: `GROQ_MODEL` (defaults to `llama-3.3-70b-versatile`)
3. Deploy. No build step; live in seconds.

## Local development

```bash
cd HFVS_DEPLOYMENT
npm i -g vercel        # once
vercel dev             # serves the site + /api/ask with env from .env
```

Put `GROQ_API_KEY=...` in a local `.env` (git-ignored) for chat to work locally.
Without it, everything renders and the chat shows a friendly setup message.

## Data provenance (self-contained folder)

`HFVS_DEPLOYMENT/` needs nothing outside itself. The chain is:

```
(notebook, last cell)  update_master_csvs.py   <- run INSIDE the notebook after S9
        |  writes data/county_dea_efficiency.csv + county_milp_allocation.csv
        v
build_data.py  <- joins the CSVs + county_hfvs_validation.csv + frozen notebook
        |         summary numbers into the JSON artifacts
        v
data/*.json + data/kenya_counties.geojson  <- what the dashboard & api/ask.js read
```

- `update_master_csvs.py` — paste into the notebook (or run as a cell) whenever you
  re-run Tier 2/3; it maps the notebook's live `county_dea` frame onto the CSV
  schema, tolerating column renames and failing loudly if DEA/MILP haven't run.
- `build_data.py` — run locally in this folder to refresh all dashboard JSONs.
- County join: county_code 1..47 = alphabetical county order (notebook S0.6's
  CENSUS_2019 order, 0 unmatched); the 47-county GeoJSON ships here with names
  normalised to KHS spelling.
- National-level numbers (model chain R², SHAP, pillar β, tier counts, MILP regime
  totals) are frozen in `build_data.py` from the notebook's executed outputs —
  update those constants if you re-run S6–S11 with different results.

