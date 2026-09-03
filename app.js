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
    { value: fmt(n.fy24_25_completions, 0), label: "units actually completed FY2024/25 (the real bottleneck)", tone: "alert" },
  ]);

  const tiers = n.tier_distribution;
  new Chart($("#chart-tiers"), {
    type: "doughnut",
    data: { labels: Object.keys(tiers), datasets: [{ data: Object.values(tiers), backgroundColor: Object.keys(tiers).map(t => TIER_COLORS[t]), borderWidth: 2, borderColor: "#fff" }] },
    options: { cutout: "58%", maintainAspectRatio: false, plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${fmt(c.parsed, 0)} households (${pct(c.parsed / n.households_surveyed * 100)})` } } } },
  });

  const cs = [...state.counties].filter(c => c.hfvs_mean != null).sort((a, b) => b.hfvs_mean - a.hfvs_mean);
  new Chart($("#chart-pop-vuln"), {
    type: "bar",
    data: { labels: cs.map(c => c.county), datasets: [{ data: cs.map(c => c.hfvs_mean), backgroundColor: cs.map(c => c.hfvs_mean > 0.25 ? "#d64541" : c.hfvs_mean > 0 ? "#e8873a" : "#2e9e6b") }] },
    options: {
      indexAxis: "y", maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => [`HFVS: ${c.parsed.x.toFixed(3)}`, `2026 population: ${fmt(cs[c.dataIndex].population_2026_est, 0)}`] } } },
      scales: { x: { title: { display: true, text: "Vulnerability score (higher = more vulnerable)" } }, y: { ticks: { font: { size: 8.5 }, autoSkip: false, maxTicksLimit: 47 } } },
    },
  });
}

// ---------- model ----------
function renderModel() {
  const n = state.national;
  statGrid($("#model-stats"), [
    { value: pct(n.champion_model.r2 * 100, 0), label: `variation explained (champion: ${n.champion_model.name})`, tone: "good" },
    { value: "+" + pct(n.ai_advantage_r2 * 100, 0), label: "gain over a simple linear model", tone: "good" },
    { value: n.stage1_classifier.roc_auc.toFixed(3), label: "stage-1 classifier ROC-AUC ('is this household burdened?')", tone: "warn" },
    { value: fmt(n.milp_backlog_units ?? 15365, 0), label: "unit shortfall covered if the levy were spent at full official target", tone: "alert" },
  ]);
  const aucEl = $("#auc-inline"); if (aucEl) aucEl.textContent = n.stage1_classifier.roc_auc.toFixed(3);

  // DEA / SBM validation stats
  if (n.sbm_available) {
    statGrid($("#dea-stats"), [
      { value: n.dea_mean_theta_ccr.toFixed(3), label: "mean radial efficiency θ (CCR)", tone: "warn" },
      { value: n.sbm_mean_rho_bc.toFixed(3), label: "mean non-radial efficiency ρ (SBM, bias-corrected)", tone: "good" },
      { value: "+" + n.sbm_radial_masking_gap.toFixed(3), label: "radial masking gap — slack the radial score hides", tone: "alert" },
      { value: `${n.dea_frontier_counties}/47`, label: "counties on the efficiency frontier", tone: "" },
    ]);
    // biggest θ-vs-ρ divergences
    const div = [...state.counties].filter(c => c.theta_ccr != null && c.rho_sbm_bc != null)
      .sort((a, b) => (b.theta_ccr - b.rho_sbm_bc) - (a.theta_ccr - a.rho_sbm_bc)).slice(0, 10);
    new Chart($("#chart-dea-gap"), {
      type: "bar",
      data: {
        labels: div.map(c => c.county),
        datasets: [
          { label: "Radial θ (CCR)", data: div.map(c => c.theta_ccr), backgroundColor: "#7fb3c8", borderRadius: 5 },
          { label: "Non-radial ρ (SBM, bias-corrected)", data: div.map(c => c.rho_sbm_bc), backgroundColor: "#0b4f6c", borderRadius: 5 },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${c.parsed.y.toFixed(3)}` } } },
        scales: { y: { min: 0, max: 1, ticks: { callback: v => v.toFixed(1) } }, x: { ticks: { font: { size: 10 }, maxRotation: 35, minRotation: 25 } } },
      },
    });
  }

  const chain = n.model_chain;
  new Chart($("#chart-model-chain"), {
    type: "bar",
    data: { labels: chain.map(m => m.stage.replace(/^S[\d.]+\s*/, "")), datasets: [{ data: chain.map(m => m.r2), backgroundColor: chain.map(m => m.r2 === Math.max(...chain.map(x => x.r2)) ? "#2e9e6b" : "#7fb3c8"), borderRadius: 6 }] },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${pct(c.parsed.y * 100)} of variation explained` } } },
      scales: { y: { max: 0.7, ticks: { callback: v => pct(v * 100, 0) } }, x: { ticks: { font: { size: 10 }, maxRotation: 35, minRotation: 20 } } },
    },
  });

  const sh = state.shap.slice(0, 10);
  new Chart($("#chart-shap"), {
    type: "bar",
    data: { labels: sh.map(f => f.label), datasets: [{ data: sh.map(f => f.mean_abs_shap), backgroundColor: "#0b4f6c", borderRadius: 5 }] },
    options: { indexAxis: "y", maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: "Importance (mean |SHAP|)" } } } },
  });
}

// ---------- drivers ----------
const PILLAR_PLAIN = {
  D1: "Financial Stress: how tight the household budget is; low or informal income, heavy spending on housing relative to earnings.",
  D2: "Tenure Insecurity: not being secure in your home; renting without a written lease, living in a building without approval, risk of eviction.",
  D3: "Physical Hazard: exposure to floods, poor drainage, or unsafe neighbourhood conditions around the dwelling.",
  D4: "Dwelling Quality: the physical state of the home; walls, roof, floor, crowding and space per person.",
  D5: "Utility Deprivation: lacking reliable water, sanitation, or electricity services.",
};
const PILLAR_COLORS = ["#0b4f6c", "#d64541", "#e8a13a", "#2e9e6b", "#7a5ea8"];

function renderDrivers() {
  const p = state.pillars;
  new Chart($("#chart-pillars"), {
    type: "bar",
    data: { labels: p.map(x => x.name), datasets: [{ data: p.map(x => x.beta_weight), backgroundColor: PILLAR_COLORS, borderRadius: 6 }] },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` Weight: ${pct(c.parsed.y * 100)} of the score` } } },
      scales: { y: { ticks: { callback: v => pct(v * 100, 0) }, max: 0.4 } },
    },
  });

  $("#pillar-plain").innerHTML = p.map((x, i) =>
    `<li><span class="dot" style="background:${PILLAR_COLORS[i]}">${x.code}</span><b>${x.name}: ${pct(x.beta_weight * 100, 0)} of the score.</b> ${PILLAR_PLAIN[x.code]}</li>`).join("");

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
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      scales: { x: { ticks: { font: { size: 10 }, maxRotation: 40, minRotation: 30 } }, y: { beginAtZero: true } },
    },
  });
}

// ---------- budget ----------
const BINDING_COLORS = { "Capacity": "#d64541", "Budget (revenue)": "#0b4f6c", "National quota": "#e8a13a", "Unconstrained": "#2e9e6b", "Not activated": "#b9c1cc" };
const BINDING_PILL = { "Capacity": "cap", "Budget (revenue)": "rev", "National quota": "quota", "Unconstrained": "good", "Not activated": "off" };
const BINDING_PLAIN = {
  "Capacity": "County cannot absorb more units — its delivery ceiling (permits, completions, financing) binds",
  "Budget (revenue)": "National budget exhausted at the margin — more money would buy more units here",
  "National quota": "National unit quota exhausted — the programme cap, not this county, is the limit",
  "Unconstrained": "Interior optimum — no constraint stops this county from receiving more units",
  "Not activated": "County not activated under this regime",
};

function renderBudget() {
  const m = state.milp;
  const c = m.regime_c || null;
  const bc = m.binding_counts_regime_a || {};
  const capCount = bc["Capacity"] || 0;
  statGrid($("#budget-stats"), [
    { value: fmtB(m.regime_a.total_cost_ksh), label: "cost of the 6,000-unit programme (identical under regimes A and B)", tone: "good" },
    { value: `${m.regime_a.counties_activated}/47`, label: "counties funded under Capital Concentration (Regime A)" },
    { value: `${capCount}/47`, label: "counties where DELIVERY CAPACITY — not money — binds (Regime A)", tone: capCount > 0 ? "alert" : "" },
    { value: c ? `+${fmt((c.total_units || 0) - m.regime_a.total_units, 0)}` : "—",
      label: c ? `extra units unlocked by Option C capacity uplift (+50% ceilings in ${c.counties_uplifted} counties, zero extra levy)` : "", tone: "good" },
    { value: fmtB(m.total_budget_ksh), label: "total FY2024/25 levy (the programme uses just 27%)", tone: "good" },
  ]);
  const _bh = $("#binding-headline");
  if (_bh) _bh.textContent = capCount > 0 ? `${capCount} of 19 funded counties` : "most funded counties";

  new Chart($("#chart-regimes"), {
    type: "bar",
    data: {
      labels: ["Concentration (A)", "Universal (B)"],
      datasets: [
        { label: "Counties activated", data: [m.regime_a.counties_activated, m.regime_b.counties_activated], backgroundColor: "#e8873a", borderRadius: 6 },
        { label: "Cost (KSh B)", data: [m.regime_a.total_cost_ksh / 1e9, m.regime_b.total_cost_ksh / 1e9], backgroundColor: "#0b4f6c", borderRadius: 6 },
      ],
    },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } },
  });

  // NEW: binding-constraint doughnut (Regime A) — the thesis's headline output
  const bLabels = Object.keys(bc).filter(k => bc[k] > 0);
  new Chart($("#chart-binding"), {
    type: "doughnut",
    data: {
      labels: bLabels,
      datasets: [{ data: bLabels.map(k => bc[k]), backgroundColor: bLabels.map(k => BINDING_COLORS[k] || "#999"), borderWidth: 2, borderColor: "#fff" }],
    },
    options: {
      cutout: "55%", maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} counties` } } },
    },
  });

  // Cross-tier consistency check (proposal §3.5): need (HFVS) vs efficiency (SBM ρ),
  // point size = Regime A units — do high-need/low-efficiency counties shift between regimes?
  const cc = state.counties.filter(c => c.hfvs_mean != null && c.rho_sbm_bc != null);
  new Chart($("#chart-consistency"), {
    type: "scatter",
    data: { datasets: [{
      data: cc.map(c => ({ x: c.hfvs_mean, y: c.rho_sbm_bc, c })),
      backgroundColor: cc.map(c => BINDING_COLORS[c.binding_A] || "#b9c1cc"),
      pointRadius: cc.map(c => c.units_A ? 4 + Math.min(10, 10 * Math.sqrt(c.units_A / 960)) : 3),
      pointOpacity: 0.85,
    }]},
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: (t) => { const c = t.raw.c; return [
            `${c.county}`,
            `Vulnerability (HFVS): ${c.hfvs_mean.toFixed(3)}`,
            `Efficiency (SBM ρ): ${c.rho_sbm_bc.toFixed(3)}`,
            `Units A: ${fmt(c.units_A ?? 0, 0)} · Binds: ${c.binding_A ?? "—"}`,
          ]; },
        }},
      },
      scales: {
        x: { title: { display: true, text: "Need (HFVS vulnerability →)" } },
        y: { title: { display: true, text: "Efficiency (SBM ρ →)" }, min: 0, max: 1 },
      },
    },
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
      indexAxis: "y", maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` KSh ${c.parsed.x.toFixed(2)}B` } } },
      scales: { x: { title: { display: true, text: "KSh Billion" } } },
    },
  });

  const rows = [...state.counties].sort((a, b) => (b.units_A || b.milp_units_regime_b || 0) - (a.units_A || a.milp_units_regime_b || 0)).slice(0, 15);
  $("#binding-plain").innerHTML = Object.keys(BINDING_PLAIN)
    .filter(k => (bc[k] || 0) > 0)
    .map(k => `<li><span class="dot" style="background:${BINDING_COLORS[k]}">${bc[k]}</span><b>${k}:</b> ${BINDING_PLAIN[k]}.</li>`)
    .join("");
  $("#budget-table").innerHTML = `
    <thead><tr><th>County</th><th class="num">Capacity ceiling</th><th class="num">Units (A)</th><th>Binding constraint (A)</th><th class="num">Units (C)</th><th class="num">SBM ρ</th><th class="num">Spend (A)</th></tr></thead>
    <tbody>${rows.map(c2 => `<tr>
      <td>${c2.county}</td>
      <td class="num">${c2.capacity_ceiling_units == null ? "—" : fmt(c2.capacity_ceiling_units, 0)}</td>
      <td class="num">${fmt(c2.units_A ?? c2.milp_units_regime_b ?? 0, 0)}</td>
      <td>${c2.binding_A && c2.binding_A !== "—" ? `<span class="pill b-${BINDING_PILL[c2.binding_A] || "off"}">${c2.binding_A}</span>` : "—"}</td>
      <td class="num">${c2.units_C == null ? "—" : fmt(c2.units_C, 0)}</td>
      <td class="num">${c2.rho_sbm_bc == null ? "—" : c2.rho_sbm_bc.toFixed(3)}</td>
      <td class="num">${fmtB(c2.cost_A_ksh ?? c2.milp_cost_regime_b_ksh)}</td>
    </tr>`).join("")}</tbody>`;
}

// ---------- real Leaflet choropleth ----------
const METRICS = {
  hfvs_mean: { label: "Vulnerability score (HFVS)", higherIsWorse: true, fmt: v => v.toFixed(3) },
  rho_sbm_bc: { label: "Delivery efficiency (SBM ρ, bias-corrected)", higherIsWorse: false, fmt: v => v.toFixed(3) },
  theta_ccr: { label: "Delivery efficiency (radial θ, comparator)", higherIsWorse: false, fmt: v => v.toFixed(3) },
  unit_cost_ksh: { label: "Cost per housing unit", higherIsWorse: true, fmt: v => fmtM(v) },
  milp_units_regime_b: { label: "Units allocated (Regime B)", higherIsWorse: false, fmt: v => fmt(v, 0) },
  units_C: { label: "Units allocated (Regime C — capacity-targeted)", higherIsWorse: false, fmt: v => fmt(v, 0) },
  capacity_ceiling_units: { label: "Delivery capacity ceiling (units/yr)", higherIsWorse: false, fmt: v => fmt(v, 0) },
  pct_top_decile_vulnerable: { label: "% in most-vulnerable decile", higherIsWorse: true, fmt: v => pct(v * 100) },
};
const RAMP = ["#2e9e6b", "#8cc63f", "#f5e34f", "#f59a3c", "#d64541"]; // good -> bad
const rampColor = (t) => RAMP[Math.min(4, Math.floor(t * 5))];

function initMap() {
  state.map = L.map("map", { scrollWheelZoom: true }).setView([0.42, 37.9], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 12,
  }).addTo(state.map);

  state.mapLayers = L.geoJSON(state.geo, {
    style: () => ({ weight: 1, color: "#fff", fillOpacity: 0.85 }),
    onEachFeature: (feat, layer) => {
      const c = countyByFeature(feat);
      layer.bindPopup(c ? countyPopup(c) : `<div class="county-tip"><b>${feat.properties.county_name}</b><br>No survey data.</div>`);
      layer.bindTooltip(countyHover(c, feat), { sticky: true, className: "county-hover", opacity: 0.95 });
      layer.on({
        mouseover: e => e.target.setStyle({ weight: 2.5, color: "#0b3550" }),
        mouseout: e => e.target.setStyle({ weight: 1, color: "#fff" }),
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

// compact hover card — quick read, popup carries the full profile
function countyHover(c, feat) {
  if (!c) return `<b>${feat.properties.county_name}</b><br>No survey data`;
  const bind = c.binding_A && c.binding_A !== "Not activated" ? c.binding_A : "not funded (A)";
  return `<div class="county-hover-tip"><b>${c.county}</b><br>` +
    `Vulnerability: <b>${c.hfvs_mean == null ? "—" : c.hfvs_mean.toFixed(3)}</b>` +
    (c.rho_sbm_bc != null ? ` · Efficiency ρ: <b>${c.rho_sbm_bc.toFixed(3)}</b>` : "") + `<br>` +
    `Capacity ceiling: <b>${c.capacity_ceiling_units == null ? "—" : fmt(c.capacity_ceiling_units, 0)}</b> units/yr<br>` +
    `Binds on: <b>${bind}</b><br>` +
    `<span style="opacity:.7">Click for full profile</span></div>`;
}

function countyPopup(c, metricKey) {
  const bind = c.binding_A && c.binding_A !== "—"
    ? `<span class="pill b-${BINDING_PILL[c.binding_A] || "off"}">${c.binding_A}</span>` : "—";
  const sbm = c.rho_sbm_bc == null ? "" :
    `Efficiency (SBM ρ): <b>${c.rho_sbm_bc.toFixed(3)}</b>` +
    (c.rho_sbm_ci_low != null ? ` <span style="opacity:.75">[95% CI ${c.rho_sbm_ci_low.toFixed(2)}–${c.rho_sbm_ci_high.toFixed(2)}]</span>` : "") +
    ` <span style="opacity:.75">(radial θ ${c.theta_ccr.toFixed(3)})</span><br>`;
  return `<div class="county-tip">
    <b>${c.county}</b>${c.policy_quadrant ? ` · <span style="opacity:.75">${c.policy_quadrant}</span>` : ""}<br>
    Vulnerability score: <b>${c.hfvs_mean == null ? "—" : c.hfvs_mean.toFixed(3)}</b><br>
    ${sbm}Delivery capacity ceiling: <b>${c.capacity_ceiling_units == null ? "—" : fmt(c.capacity_ceiling_units, 0)} units/yr</b><br>
    Binding constraint (Regime A): ${bind}<br>
    Units: A ${fmt(c.units_A ?? 0, 0)} · B ${fmt(c.units_B ?? c.milp_units_regime_b ?? 0, 0)} · C ${fmt(c.units_C ?? 0, 0)}<br>
    Households surveyed: ${fmt(c.households_surveyed, 0)}<br>
    2026 projected population: ${fmt(c.population_2026_est, 0)}<br>
    Water travel: ${c.avg_water_travel_mins ?? "—"} min · Overcrowding: ${c.avg_overcrowding ?? "—"} persons/room
  </div>`;
}


// ---------- per-tab RAG chat ----------
const CHAT_GREETING = "I'm the HFVS analyst. I can explain any of the numbers on this tab: where they come from, what they mean for the Affordable Housing Programme, and how counties compare. What would you like to know?";

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
    typing.innerHTML = `<b>Sorry, the assistant is unavailable.</b><br>${e.message}<br><br>If running locally, start with <code>vercel dev</code> and set <code>GROQ_API_KEY</code>.`;
  }
  log.scrollTop = log.scrollHeight;
}

boot();