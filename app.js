/* HFVS Decision Tool — app.js
   Tabs, Chart.js visuals, real Leaflet choropleth, per-tab RAG chat (Groq via /api/ask). */
"use strict";

const fmt = (n, d = 1) => (n == null ? "—" : n.toLocaleString("en-KE", { maximumFractionDigits: d }));
const fmtB = (k) => k == null ? "—" : `KSh ${(k / 1e9).toFixed(2)}B`;
const fmtM = (k) => k == null ? "—" : `KSh ${(k / 1e6).toFixed(0)}M`;
const pct = (n, d = 1) => (n == null ? "—" : `${n.toFixed(d)}%`);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const state = { counties: [], national: null, shap: null, pillars: null, milp: null, geo: null, map: null, chats: {} };
const TIER_COLORS = { Low: "#2e9e6b", Moderate: "#e8c23a", High: "#e8873a", Critical: "#d64541" };

async function boot() {
  const base = "data/";
  const [counties, national, shap, pillars, milp, geo] = await Promise.all([
    fetch(base + "county_metrics.json").then(r => r.json()),
    fetch(base + "national_summary.json").then(r => r.json()),
    fetch(base + "shap.json").then(r => r.json()),
    fetch(base + "pillars.json").then(r => r.json()),
    fetch(base + "milp.json").then(r => r.json()),
    fetch(base + "kenya_counties.geojson").then(r => r.json()),
  ]);
  Object.assign(state, { counties: counties.counties, national, shap: shap.top_features, pillars: pillars.pillars, milp, geo });
  buildTabs();
  renderOverview();
  renderModel();
  renderDrivers();
  renderBudget();
  initMap();
  initChats();
}

function buildTabs() {
  $$("#tabs .tab").forEach(btn => {
    btn.addEventListener("click", () => {
      $$("#tabs .tab").forEach(b => b.classList.toggle("active", b === btn));
      $$(".panel").forEach(p => p.classList.toggle("active", p.id === `panel-${btn.dataset.tab}`));
      if (btn.dataset.tab === "map" && state.map) setTimeout(() => state.map.invalidateSize(), 60);
    });
  });
}

function statGrid(el, items) {
  el.innerHTML = items.map(s => `<div class="stat ${s.tone || ""}"><div class="k">${s.value}</div><div class="l">${s.label}</div></div>`).join("");
}

// ---------- overview ----------
function renderOverview() {
  const n = state.national;
  statGrid($("#overview-stats"), [
    { value: fmt(n.households_surveyed, 0), label: "households analysed across all 47 counties" },
    { value: pct(n.high_critical_share_pct), label: "of households are High or Critical vulnerability", tone: "alert" },
    { value: pct(n.champion_model.r2 * 100, 0), label: "of cost-burden variation explained by the final AI model", tone: "good" },
    { value: fmtB(n.total_levy_budget_ksh), label: "Housing Levy collected in FY2024/25" },
    { value: fmt(n.fy24_25_completions, 0), label: "units actually completed FY2024/25 — the real bottleneck", tone: "alert" },
  ]);

  const tiers = n.tier_distribution;
  new Chart($("#chart-tiers"), {
    type: "doughnut",
    data: { labels: Object.keys(tiers), datasets: [{ data: Object.values(tiers), backgroundColor: Object.keys(tiers).map(t => TIER_COLORS[t]), borderWidth: 2, borderColor: "#fff" }] },
    options: { cutout: "58%", plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${fmt(c.parsed, 0)} households (${pct(c.parsed / n.households_surveyed * 100)})` } } } },
  });

  const cs = [...state.counties].filter(c => c.hfvs_mean != null).sort((a, b) => b.hfvs_mean - a.hfvs_mean);
  new Chart($("#chart-pop-vuln"), {
    type: "bar",
    data: { labels: cs.map(c => c.county), datasets: [{ data: cs.map(c => c.hfvs_mean), backgroundColor: cs.map(c => c.hfvs_mean > 0.25 ? "#d64541" : c.hfvs_mean > 0 ? "#e8873a" : "#2e9e6b") }] },
    options: {
      indexAxis: "y", maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => [`HFVS: ${c.parsed.x.toFixed(3)}`, `2026 population: ${fmt(cs[c.dataIndex].population_2026_est, 0)}`] } } },
      scales: { x: { title: { display: true, text: "Vulnerability score (higher = more vulnerable)" } }, y: { ticks: { font: { size: 9.5 } } } },
    },
  });
}

// ---------- model ----------
function renderModel() {
  const n = state.national;
  statGrid($("#model-stats"), [
    { value: pct(n.champion_model.r2 * 100, 0), label: `variation explained — champion: ${n.champion_model.name}`, tone: "good" },
    { value: "+" + pct(n.ai_advantage_r2 * 100, 0), label: "gain over a simple linear model" },
    { value: n.stage1_classifier.roc_auc.toFixed(3), label: "accuracy (ROC-AUC) of the stage-1 'is this household burdened?' classifier" },
    { value: "15,365", label: "unit shortfall covered if the levy were spent at full official target" },
  ]);

  const chain = n.model_chain;
  new Chart($("#chart-model-chain"), {
    type: "bar",
    data: { labels: chain.map(m => m.stage.replace(/^S[\d.]+\s*/, "")), datasets: [{ data: chain.map(m => m.r2), backgroundColor: chain.map(m => m.r2 === Math.max(...chain.map(x => x.r2)) ? "#2e9e6b" : "#7fb3c8"), borderRadius: 6 }] },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${pct(c.parsed.y * 100)} of variation explained` } } },
      scales: { y: { max: 0.7, ticks: { callback: v => pct(v * 100, 0) } }, x: { ticks: { font: { size: 10 }, maxRotation: 35, minRotation: 20 } } },
    },
  });

  const sh = state.shap.slice(0, 10);
  new Chart($("#chart-shap"), {
    type: "bar",
    data: { labels: sh.map(f => f.label), datasets: [{ data: sh.map(f => f.mean_abs_shap), backgroundColor: "#0b4f6c", borderRadius: 5 }] },
    options: { indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: "Importance (mean |SHAP|)" } } } },
  });
}

// ---------- drivers ----------
const PILLAR_PLAIN = {
  D1: "Financial Stress — how tight the household budget is: low or informal income, heavy spending on housing relative to earnings.",
  D2: "Tenure Insecurity — not being secure in your home: renting without a written lease, living in a building without approval, risk of eviction.",
  D3: "Physical Hazard — exposure to floods, poor drainage, or unsafe neighbourhood conditions around the dwelling.",
  D4: "Dwelling Quality — the physical state of the home: walls, roof, floor, crowding and space per person.",
  D5: "Utility Deprivation — lacking reliable water, sanitation, or electricity services.",
};
const PILLAR_COLORS = ["#0b4f6c", "#d64541", "#e8a13a", "#2e9e6b", "#7a5ea8"];

function renderDrivers() {
  const p = state.pillars;
  new Chart($("#chart-pillars"), {
    type: "bar",
    data: { labels: p.map(x => x.name), datasets: [{ data: p.map(x => x.beta_weight), backgroundColor: PILLAR_COLORS, borderRadius: 6 }] },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` Weight: ${pct(c.parsed.y * 100)} of the score` } } },
      scales: { y: { ticks: { callback: v => pct(v * 100, 0) }, max: 0.4 } },
    },
  });

  $("#pillar-plain").innerHTML = p.map((x, i) =>
    `<li><span class="dot" style="background:${PILLAR_COLORS[i]}">${x.code}</span><b>${x.name} — ${pct(x.beta_weight * 100, 0)} of the score.</b> ${PILLAR_PLAIN[x.code]}</li>`).join("");

  const cs = [...state.counties].filter(c => c.hfvs_mean != null).sort((a, b) => b.hfvs_mean - a.hfvs_mean).slice(0, 12);
  new Chart($("#chart-pillar-county"), {
    type: "bar",
    data: {
      labels: cs.map(c => c.county),
      datasets: [
        { label: "County-average vulnerability", data: cs.map(c => c.hfvs_mean), backgroundColor: "#d64541", borderRadius: 5 },
        { label: "Financial stability deficit", data: cs.map(c => 1 - c.financial_stability_score), backgroundColor: "#e8a13a", borderRadius: 5 },
      ],
    },
    options: {
      plugins: { legend: { position: "bottom" } },
      scales: { x: { ticks: { font: { size: 10 }, maxRotation: 40, minRotation: 30 } }, y: { beginAtZero: true } },
    },
  });
}

// ---------- budget ----------
function renderBudget() {
  const m = state.milp;
  statGrid($("#budget-stats"), [
    { value: fmtB(m.regime_a.total_cost_ksh), label: "cost of the 6,000-unit programme — identical under both regimes", tone: "good" },
    { value: `${m.regime_a.counties_activated}/47`, label: "counties funded under Capital Concentration (Regime A)" },
    { value: `${m.regime_b.counties_activated}/47`, label: "counties funded under Universal Coverage (Regime B)" },
    { value: fmtB(m.total_budget_ksh), label: "total FY2024/25 levy — the programme uses just 27%" },
    { value: fmt(m.aspirational.backlog_units, 0), label: "unit backlog — fully fundable at the official 200,000-unit target", tone: "good" },
  ]);

  new Chart($("#chart-regimes"), {
    type: "bar",
    data: {
      labels: ["Capital Concentration (A)", "Universal Coverage (B)"],
      datasets: [
        { label: "Counties activated", data: [m.regime_a.counties_activated, m.regime_b.counties_activated], backgroundColor: "#e8873a", borderRadius: 6 },
        { label: "Cost (KSh B)", data: [m.regime_a.total_cost_ksh / 1e9, m.regime_b.total_cost_ksh / 1e9], backgroundColor: "#0b4f6c", borderRadius: 6 },
      ],
    },
    options: { plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } },
  });

  new Chart($("#chart-aspirational"), {
    type: "bar",
    data: {
      labels: ["Levy collected", "Backlog cost", "Actual FY24/25 build"],
      datasets: [{
        data: [m.total_budget_ksh / 1e9, m.aspirational.backlog_cost_ksh / 1e9, 0.058],
        backgroundColor: ["#2e9e6b", "#0b4f6c", "#d64541"], borderRadius: 6,
      }],
    },
    options: {
      indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` KSh ${c.parsed.x.toFixed(2)}B` } } },
      scales: { x: { title: { display: true, text: "KSh Billion" } } },
    },
  });

  const rows = [...state.counties].sort((a, b) => (b.milp_units_regime_b || 0) - (a.milp_units_regime_b || 0)).slice(0, 15);
  $("#budget-table").innerHTML = `
    <thead><tr><th>County</th><th class="num">Units (Regime B)</th><th class="num">Spend</th><th class="num">Cost / unit</th><th class="num">Vulnerability</th><th>Efficiency</th></tr></thead>
    <tbody>${rows.map(c => `<tr>
      <td>${c.county}</td>
      <td class="num">${fmt(c.milp_units_regime_b, 0)}</td>
      <td class="num">${fmtB(c.milp_cost_regime_b_ksh)}</td>
      <td class="num">${fmtM(c.unit_cost_ksh)}</td>
      <td class="num">${c.hfvs_mean == null ? "—" : c.hfvs_mean.toFixed(3)}</td>
      <td><span class="pill ${c.is_ccr_frontier ? "frontier" : "inner"}">${c.theta_ccr.toFixed(2)}</span></td>
    </tr>`).join("")}</tbody>`;
}

// ---------- real Leaflet choropleth ----------
const METRICS = {
  hfvs_mean: { label: "Vulnerability score (HFVS)", higherIsWorse: true, fmt: v => v.toFixed(3) },
  theta_ccr: { label: "Delivery efficiency (DEA θ)", higherIsWorse: false, fmt: v => v.toFixed(3) },
  unit_cost_ksh: { label: "Cost per housing unit", higherIsWorse: true, fmt: v => fmtM(v) },
  milp_units_regime_b: { label: "Units allocated (Regime B)", higherIsWorse: false, fmt: v => fmt(v, 0) },
  pct_top_decile_vulnerable: { label: "% in most-vulnerable decile", higherIsWorse: true, fmt: v => pct(v * 100) },
};
const RAMP = ["#2e9e6b", "#8cc63f", "#f5e34f", "#f59a3c", "#d64541"]; // good -> bad
const rampColor = (t) => RAMP[Math.min(4, Math.floor(t * 5))];

function initMap() {
  state.map = L.map("map", { scrollWheelZoom: true }).setView([0.42, 37.9], 6);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 12,
  }).addTo(state.map);

  state.mapLayers = L.geoJSON(state.geo, {
    style: () => ({ weight: 1, color: "#fff", fillOpacity: 0.85 }),
    onEachFeature: (feat, layer) => {
      const c = countyByFeature(feat);
      layer.bindPopup(c ? countyPopup(c) : `<div class="county-tip"><b>${feat.properties.county_name}</b><br>No survey data.</div>`);
      layer.on({
        mouseover: e => e.target.setStyle({ weight: 2.5, color: "#0b3550" }),
        mouseout: e => state.mapLayers.resetStyle(e.target),
      });
    },
  }).addTo(state.map);

  $("#map-metric").addEventListener("change", paintMap);
  paintMap();
}

function paintMap() {
  const key = $("#map-metric").value;
  const cfg = METRICS[key];
  const vals = state.counties.map(c => c[key]).filter(v => v != null);
  const min = Math.min(...vals), max = Math.max(...vals);
  const norm = v => max === min ? 0.5 : (v - min) / (max - min);

  state.mapLayers.eachLayer(layer => {
    const c = countyByFeature(layer.feature);
    const v = c ? c[key] : null;
    let t = v == null ? null : norm(v);
    if (t != null && !cfg.higherIsWorse) t = 1 - t; // green = best
    layer.setStyle({ fillColor: t == null ? "#cccccc" : rampColor(t) });
    if (c) layer.setPopupContent(countyPopup(c, key));
  });

  const steps = [0, .2, .4, .6, .8, 1].map(t => {
    const v = cfg.higherIsWorse ? min + t * (max - min) : max - t * (max - min);
    return `<span class="sw" style="background:${rampColor(t === 1 ? .99 : t)}"></span><span>${cfg.fmt(v)}</span>`;
  });
  $("#map-legend").innerHTML = `<b>${cfg.label}</b> &nbsp; ${cfg.higherIsWorse ? "🟢 lower = better · 🔴 higher = worse" : "🟢 higher = better · 🔴 lower = worse"} &nbsp; ${steps.join(" ")}`;
}

function countyByFeature(f) {
  const n = f.properties.county_name;
  return state.counties.find(c => c.county === n);
}

function countyPopup(c, metricKey) {
  return `<div class="county-tip">
    <b>${c.county}</b><br>
    Vulnerability score: <b>${c.hfvs_mean == null ? "—" : c.hfvs_mean.toFixed(3)}</b><br>
    Delivery efficiency (θ): ${c.theta_ccr.toFixed(3)} ${c.is_ccr_frontier ? "★ on efficient frontier" : ""}<br>
    Households surveyed: ${fmt(c.households_surveyed, 0)}<br>
    2026 projected population: ${fmt(c.population_2026_est, 0)}<br>
    Units allocated (Regime B): ${fmt(c.milp_units_regime_b, 0)}<br>
    Cost per unit: ${fmtM(c.unit_cost_ksh)}<br>
    Water travel: ${c.avg_water_travel_mins ?? "—"} min · Overcrowding: ${c.avg_overcrowding ?? "—"} persons/room
  </div>`;
}


// ---------- per-tab RAG chat ----------
const CHAT_GREETING = "I'm the HFVS analyst. I can explain any of the numbers on this tab — where they come from, what they mean for the Affordable Housing Programme, and how counties compare. What would you like to know?";

function initChats() {
  $$(".chat").forEach(box => {
    const tab = box.dataset.chatTab;
    state.chats[tab] = { history: [] };
    box.innerHTML = `
      <div class="log"></div>
      <div class="chat-input-row">
        <textarea placeholder="Ask a question about this tab…" rows="1"></textarea>
        <button class="chat-send">Ask</button>
      </div>
      <div class="chat-hint">Answers are generated by an AI assistant grounded strictly in this project's pre-computed results.</div>`;
    const log = $(".log", box), ta = $("textarea", box), send = $(".chat-send", box);
    addMsg(log, "bot", CHAT_GREETING);

    const doSend = () => { const q = ta.value.trim(); if (!q) return; ta.value = ""; ask(log, tab, q); };
    send.addEventListener("click", doSend);
    ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } });
    ta.addEventListener("input", () => { ta.style.height = "auto"; ta.style.height = Math.min(130, ta.scrollHeight) + "px"; });
  });

  $$(".sugg").forEach(b => b.addEventListener("click", () => {
    const chat = document.querySelector("#panel-analyst .chat");
    const log = $(".log", chat);
    addMsg(log, "user", b.textContent);
    ask(log, "analyst", b.textContent);
  }));
}

function addMsg(log, role, html, cls = "") {
  const div = document.createElement("div");
  div.className = `msg ${role} ${cls}`;
  div.innerHTML = role === "bot" ? html : html.replace(/</g, "&lt;");
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  return div;
}

async function ask(log, tab, question) {
  addMsg(log, "user", question);
  const typing = addMsg(log, "bot", `<span class="typing"><span></span><span></span><span></span></span>`);
  try {
    const r = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab, question, history: state.chats[tab].history }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || `Request failed (${r.status})`);
    typing.innerHTML = marked.parse(data.answer);
    state.chats[tab].history.push({ role: "user", content: question }, { role: "assistant", content: data.answer });
  } catch (e) {
    typing.className = "msg bot err";
    typing.innerHTML = `<b>Sorry — the assistant is unavailable.</b><br>${e.message}<br><br>If running locally, start with <code>vercel dev</code> and set <code>GROQ_API_KEY</code>.`;
  }
  log.scrollTop = log.scrollHeight;
}

boot();
