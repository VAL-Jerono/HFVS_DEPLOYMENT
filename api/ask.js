// api/ask.js — Vercel serverless function: per-tab RAG context pack -> Groq
// The LLM never computes numbers. It only reasons over the JSON slice we hand it.
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
}

let CACHE = {};
function cached(name) {
  if (!CACHE[name]) CACHE[name] = load(name);
  return CACHE[name];
}

// ---- Context packs: one per tab, kept small so prompts stay focused & cheap ----
function buildContext(tab) {
  const nat = cached("national_summary.json");
  const counties = cached("county_metrics.json").counties;
  const pack = { national_summary: nat, note: "All numbers below are pre-computed from the executed HFVS notebook. Never invent or calculate new numbers; only explain, compare and contextualise these." };

  if (tab === "overview") {
    pack.county_table = counties.map(c => ({ county: c.county, hfvs_mean: c.hfvs_mean, population_2026_est: c.population_2026_est, households_surveyed: c.households_surveyed }));
  } else if (tab === "map") {
    // give full county detail for the map tab
    pack.county_table = counties;
  } else if (tab === "model") {
    pack.shap_top_features = cached("shap.json").top_features;
  } else if (tab === "drivers") {
    pack.pillars = cached("pillars.json");
    pack.shap_top_features = cached("shap.json").top_features.slice(0, 10);
  } else if (tab === "budget") {
    pack.milp = cached("milp.json");
    pack.county_budget = counties.map(c => ({ county: c.county, unit_cost_ksh: c.unit_cost_ksh, milp_units_regime_b: c.milp_units_regime_b, milp_cost_regime_b_ksh: c.milp_cost_regime_b_ksh, active_regime_b: c.active_regime_b, theta_ccr: c.theta_ccr, hfvs_mean: c.hfvs_mean }));
  } else { // analyst — cross-tier
    pack.pillars = cached("pillars.json");
    pack.milp = cached("milp.json");
    pack.county_summary = counties.map(c => ({ county: c.county, hfvs_mean: c.hfvs_mean, theta_ccr: c.theta_ccr, unit_cost_ksh: c.unit_cost_ksh, milp_units_regime_b: c.milp_units_regime_b, is_ccr_frontier: c.is_ccr_frontier }));
  }
  return pack;
}

const TAB_TITLES = {
  overview: "Overview",
  map: "County Map",
  model: "Model Performance",
  drivers: "Vulnerability Drivers",
  budget: "Budget Allocation",
  analyst: "Ask the Analyst",
};

const SYSTEM_PROMPT = (tab) => `You are the HFVS Analyst — the explanation layer of a housing-vulnerability decision-support tool built from a dissertation on Kenya's Affordable Housing Programme (AHP) and the Housing Levy.

You are currently answering questions in the "${TAB_TITLES[tab] || "Analyst"}" tab. You will receive a JSON context pack containing ONLY pre-computed numbers from the analysis.

RULES (strict):
1. NEVER invent, estimate, or calculate new numbers. Only use figures present in the context pack. If a question needs a number you don't have, say so and point the user to the right place.
2. Write for a non-technical stakeholder (e.g. a housing official). NO jargon: say "the model explains 62% of the variation" not "R²=0.6172" — you may give the technical figure in brackets after the plain-language one.
3. Format your answer in clean markdown: short paragraphs, bullet points where helpful, **bold** for the key takeaway. Start with a one-sentence direct answer.
4. When comparing counties, name them explicitly.
5. Be honest about limitations (e.g. survey data, delivery-constrained scenarios).
6. Keep answers under ~250 words unless the question clearly needs more.`;

export default async function handler(req, res) {
  // CORS for local dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { tab = "analyst", question, history = [] } = req.body || {};
  if (!question || typeof question !== "string" || question.length > 2000) {
    return res.status(400).json({ error: "Provide a 'question' (max 2000 chars)." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not set. Add it in Vercel Project Settings → Environment Variables (or a local .env with `vercel dev`)." });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT(tab) },
    { role: "system", content: "CONTEXT PACK (the only data you may use):\n" + JSON.stringify(buildContext(tab)) },
    ...history.slice(-6).filter(m => m.role && m.content).map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
    { role: "user", content: question },
  ];

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages,
        temperature: 0.3,
        max_tokens: 900,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      return res.status(r.status).json({ error: `Groq API error: ${t.slice(0, 300)}` });
    }
    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) return res.status(502).json({ error: "Empty response from Groq." });
    return res.status(200).json({ answer });
  } catch (e) {
    return res.status(502).json({ error: `Upstream error: ${e.message}` });
  }
}
