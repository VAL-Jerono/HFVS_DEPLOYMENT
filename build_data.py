# %% HFVS_DEPLOYMENT/build_data.py
# Freeze the notebook's executed results into static JSON artifacts for the
# Vercel dashboard. Sources of truth:
#   - Master/county_dea_efficiency.csv   (theta_CCR, theta_BCC, scale eff, spec inputs)
#   - Master/county_milp_allocation.csv  (unit cost, Regime B units, spend, HAD)
#   - Brainstorm outputs/county_hfvs_validation.csv (measured per-county HFVS)
#   - HFVS_VULNERABILITY_CHAIN.ipynb executed outputs (national summary, SHAP,
#     pillar betas, model chain, tier counts) — hard-frozen here with provenance.
# County join: county_code 1..47 maps to alphabetical county order (the notebook's
# CENSUS_2019 dict order, assert-matched 0 unmatched); validation CSV carries names.

import csv, json, os, math

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)  # fallback locations only — folder is self-contained
MASTER = os.path.join(HERE, "data")
B_LOCAL = os.path.join(HERE, "data", "county_hfvs_validation.csv")
B_TABLES = os.path.join(REPO, "..", "Brainstorm", "Notebooks", "outputs", "tables")
OUT = os.path.join(HERE, "data")
DATA = os.path.join(HERE, "data")  # self-contained: CSVs live in data/ too
GEO_SRC = os.path.join(DATA, "kenya_counties.geojson")
os.makedirs(OUT, exist_ok=True)

HFVS_VALIDATION_CSV = B_LOCAL if os.path.exists(B_LOCAL) else os.path.join(B_TABLES, "county_hfvs_validation.csv")

COUNTIES_ALPHA = [
    "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa",
    "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu",
    "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a",
    "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu",
    "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado",
    "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu",
    "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",
]
CENSUS_2019 = {
    "Mombasa": 1208333, "Kwale": 866820, "Kilifi": 1453787, "Tana River": 315943,
    "Lamu": 143920, "Taita-Taveta": 340670, "Garissa": 841353, "Wajir": 781263,
    "Mandera": 867457, "Marsabit": 459785, "Isiolo": 268002, "Meru": 1545714,
    "Tharaka-Nithi": 393177, "Embu": 608599, "Kitui": 1136187, "Machakos": 1421932,
    "Makueni": 987653, "Nyandarua": 638289, "Nyeri": 759164, "Kirinyaga": 610411,
    "Murang'a": 1056640, "Kiambu": 2417735, "Turkana": 926976, "West Pokot": 621241,
    "Samburu": 310327, "Trans Nzoia": 990341, "Uasin Gishu": 1163186,
    "Elgeyo-Marakwet": 454480, "Nandi": 885711, "Baringo": 666763, "Laikipia": 518560,
    "Nakuru": 2162202, "Narok": 1157873, "Kajiado": 1117840, "Kericho": 901777,
    "Bomet": 875689, "Kakamega": 1867579, "Vihiga": 590013, "Bungoma": 1670570,
    "Busia": 893681, "Siaya": 993183, "Kisumu": 1155574, "Homa Bay": 1131950,
    "Migori": 1116436, "Kisii": 1266860, "Nyamira": 605576, "Nairobi": 4397073,
}
GROWTH = 1.0228 ** 7

def rd(x, n=6):
    if x is None: return None
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    return None if math.isnan(v) else round(v, n)

def read_csv(path):
    with open(path) as f:
        return list(csv.DictReader(f))

def rows_by_code(rows, key="county_code"):
    out = {}
    for r in rows:
        c = int(float(r[key]))
        out[c] = r
    return out

dea_rows = rows_by_code(read_csv(os.path.join(MASTER, "county_dea_efficiency.csv")))
milp_rows = rows_by_code(read_csv(os.path.join(MASTER, "county_milp_allocation.csv")))

# NEW: pull the refreshed Tier 2/3 results straight from the notebook's
# deployment export (SBM scores + bootstrap CIs, independently-sourced
# capacity ceiling, per-county binding-constraint diagnosis, Option C regime).
DEPLOY_CSV = os.path.join(REPO, "HFVS", "deployment", "county_deployment_summary.csv")
deploy_by_name = {}
deploy_meta = {"available": False}
if os.path.exists(DEPLOY_CSV):
    deploy_by_name = {r["county_name"]: r for r in read_csv(DEPLOY_CSV)}
    deploy_meta["available"] = True
else:
    print("WARNING: county_deployment_summary.csv not found — "
          "run the notebook's DEPLOY.1 cell first; serving stale Tier 2/3 fields.")

def dep(name, key, cast=float, nd=None, default=None):
    r = deploy_by_name.get(name)
    if r is None or r.get(key) in (None, "", "nan"):
        return default
    return rd(r[key], nd) if nd is not None else cast(r[key])

BINDING_ORDER = ["Capacity", "Budget (revenue)", "National quota", "Unconstrained", "Not activated"]

def _mean_of(key):
    vals = [dep(n, key) for n in COUNTIES_ALPHA]
    vals = [v for v in vals if v is not None]
    return sum(vals) / len(vals) if vals else None

hfvs = {}
for r in read_csv(HFVS_VALIDATION_CSV):
    hfvs[r["county_name"]] = rd(r["measured"])

counties = []
for code, name in enumerate(COUNTIES_ALPHA, start=1):
    d, m = dea_rows[code], milp_rows[code]
    pop26 = round(CENSUS_2019[name] * GROWTH)
    counties.append({
        "county": name,
        "county_code": code,
        "hfvs_mean": hfvs.get(name),
        "theta_ccr": rd(d["theta_CCR"], 4),
        "theta_bcc": rd(d["theta_BCC"], 4),
        "scale_efficiency": rd(d["scale_efficiency"], 4),
        "rts_category": d["rts_category"],
        "households_surveyed": int(float(d["total_sample_hh"])),
        "population_2026_est": pop26,
        "housing_adequacy_deficit": rd(m["HAD"], 4),
        "unit_cost_ksh": rd(m["unit_cost_ksh"], 0),
        "milp_units_regime_b": int(float(m["allocated_units_mode_b"])),
        "milp_cost_regime_b_ksh": rd(m["total_expenditure_mode_b_ksh"], 0),
        "active_regime_b": m["project_activated_mode_b"] == "1",
        "pct_informal_labour": rd(d["pct_informal_labour"], 4),
        "avg_overcrowding": rd(d["avg_overcrowding_rate"], 4),
        "avg_water_travel_mins": rd(d["avg_water_travel_time_mins"], 2),
        "pct_adequate_dwelling": rd(d["pct_adequate_dwelling"], 4),
        "pct_top_decile_vulnerable": rd(d["pct_top_decile_vulnerable"], 4),
        "financial_stability_score": rd(d["financial_stability_score"], 4),
        "is_ccr_frontier": float(d["theta_CCR"]) >= 0.999,
        # ── Refreshed Tier 2/3 fields from the notebook's deployment export ──
        "rho_sbm_bc": dep(name, "rho_sbm_bc", nd=4),
        "rho_sbm_ci_low": dep(name, "rho_sbm_ci_low", nd=4),
        "rho_sbm_ci_high": dep(name, "rho_sbm_ci_high", nd=4),
        "cap_index": dep(name, "cap_index", nd=4),
        "capacity_ceiling_units": dep(name, "umax_units", cast=lambda v: int(float(v))),
        "units_A": dep(name, "units_A", cast=lambda v: int(float(v)), default=0),
        "binding_A": dep(name, "binding_A", cast=str, default="—"),
        "units_B": dep(name, "units_B", cast=lambda v: int(float(v)), default=0),
        "binding_B": dep(name, "binding_B", cast=str, default="—"),
        "units_C": dep(name, "units_C", cast=lambda v: int(float(v)), default=0),
        "binding_C": dep(name, "binding_C", cast=str, default="—"),
        "capacity_uplift_flag": dep(name, "capacity_uplift_flag", cast=lambda v: str(v).strip().lower() == "true", default=False),
        "policy_quadrant": dep(name, "policy_quadrant", cast=str),
        "cost_A_ksh": dep(name, "cost_A_ksh", nd=0),
        "cost_B_ksh": dep(name, "cost_B_ksh", nd=0),
        "cost_C_ksh": dep(name, "cost_C_ksh", nd=0),
    })

with open(os.path.join(OUT, "county_metrics.json"), "w") as f:
    json.dump({"counties": counties}, f, indent=1)
print(f"county_metrics.json — {len(counties)} counties")

with open(os.path.join(OUT, "national_summary.json"), "w") as f:
    json.dump({
        "households_surveyed": 21347,
        "counties_covered": 47,
        "tier_distribution": {"Low": 2128, "Moderate": 9173, "High": 7606, "Critical": 2440},
        "tier_distribution_pct": {"Low": 9.97, "Moderate": 42.97, "High": 35.63, "Critical": 11.43},
        "high_critical_share_pct": 47.06,
        "female_headed_pct": 31.9,
        "urban_pct": 44.3,
        "champion_model": {"name": "S11.2 Stage 2 Renter Submodel (two-stage hurdle)", "r2": 0.6172},
        "model_chain": [
            {"stage": "S6.2 Baseline (Linear Regression)", "r2": 0.2285},
            {"stage": "S6.3 LightGBM", "r2": 0.5923},
            {"stage": "S6.4 XGBoost", "r2": 0.5889},
            {"stage": "S8.1 Tuned LightGBM", "r2": 0.5878},
            {"stage": "S10.2 Stacking Ensemble", "r2": 0.6020},
            {"stage": "S11.2 Stage 2 Renter Submodel", "r2": 0.6172},
            {"stage": "S11.3 Hurdle Combined", "r2": 0.6075},
        ],
        "ai_advantage_r2": 0.3887,
        "stage1_classifier": {"roc_auc": 0.9357, "accuracy": 0.9388},
        "dea_mean_theta_ccr": 0.8320,
        "dea_mean_theta_bcc": 0.8844,
        "dea_frontier_counties": 9,
        # ── SBM (primary efficiency measure, notebook S9.1b/c) ──
        "sbm_available": deploy_meta["available"],
        "sbm_mean_rho_bc": rd(_mean_of("rho_sbm_bc"), 4),
        "sbm_radial_masking_gap": rd((_mean_of("theta_ccr") or 0) - (_mean_of("rho_sbm_bc") or 0), 4),
        "milp_regime_a_counties": sum(1 for c in counties if (c.get("units_A") or 0) > 0),
        "milp_regime_b_counties": 47,
        "milp_units_delivery_constrained": 6000,
        "milp_cost_delivery_constrained_ksh": 19750000000,
        "milp_backlog_units": 15365,
        "milp_backlog_cost_ksh": 50580000000,
        "total_levy_budget_ksh": 73200000000,
        "fy24_25_completions": 1795,
        "aspirational_quota_units": 200000,
        "base_construction_cost_ksh": 3291489,
        "limitations_note": (
            "Regime A activation count is sensitive to NATIONAL_UNIT_QUOTA. "
            "At the 6,000-unit quota, the national quota constraint -- not levy revenue -- "
            "separates Regime A from Regime B; approximately KSh 53.45B of the annual "
            "levy remains unspent under Regime A. The activation count reported here "
            "is computed directly from the notebook's current deployment output and "
            "will update automatically when build_data.py is re-run."
        ),
    }, f, indent=1)
print("national_summary.json")

with open(os.path.join(OUT, "shap.json"), "w") as f:
    json.dump({"top_features": [
        {"feature": "income_bracket_midpoint_ksh", "label": "Household income bracket", "mean_abs_shap": 0.05166},
        {"feature": "dwelling_tenure_type_code", "label": "Tenure type (own vs rent)", "mean_abs_shap": 0.02112},
        {"feature": "monthly_expenditure_water_ksh", "label": "Monthly water spend", "mean_abs_shap": 0.00997},
        {"feature": "dwelling_floor_area_sqm", "label": "Floor area (sqm)", "mean_abs_shap": 0.00761},
        {"feature": "dwelling_in_approved_building", "label": "Lives in approved building", "mean_abs_shap": 0.00676},
        {"feature": "dwelling_type_code", "label": "Dwelling type", "mean_abs_shap": 0.00601},
        {"feature": "monthly_expenditure_electricity_ksh", "label": "Monthly electricity spend", "mean_abs_shap": 0.00503},
        {"feature": "county_housing_backlog", "label": "County housing backlog", "mean_abs_shap": 0.00489},
        {"feature": "selected_respondent_age", "label": "Household head age", "mean_abs_shap": 0.00363},
        {"feature": "county_financier_npl_ratio_pct", "label": "County financier NPL ratio", "mean_abs_shap": 0.00362},
        {"feature": "hh_overcrowding_persons_per_room", "label": "Overcrowding (persons/room)", "mean_abs_shap": 0.00331},
        {"feature": "county_water_storage_capacity_m3", "label": "County water storage capacity", "mean_abs_shap": 0.00308},
        {"feature": "is_urban_household", "label": "Urban household", "mean_abs_shap": 0.00295},
        {"feature": "highest_education_isced_level", "label": "Education level", "mean_abs_shap": 0.00277},
        {"feature": "county_planning_staff_count", "label": "County planning staff", "mean_abs_shap": 0.00252},
    ]}, f, indent=1)
print("shap.json")

with open(os.path.join(OUT, "pillars.json"), "w") as f:
    json.dump({"pillars": [
        {"code": "D1", "name": "Financial Stress", "beta_weight": 0.241, "raw_shap_share": 0.243},
        {"code": "D2", "name": "Tenure Insecurity", "beta_weight": 0.352, "raw_shap_share": 0.354},
        {"code": "D3", "name": "Physical Hazard", "beta_weight": 0.129, "raw_shap_share": 0.130},
        {"code": "D4", "name": "Dwelling Quality", "beta_weight": 0.179, "raw_shap_share": 0.181},
        {"code": "D5", "name": "Utility Deprivation", "beta_weight": 0.099, "raw_shap_share": 0.092},
    ], "max_pairwise_pillar_corr": 0.469,
       "spearman_shap_vs_equal_weight": 0.8372}, f, indent=1)
print("pillars.json")

with open(os.path.join(OUT, "milp.json"), "w") as f:
    _binding_counts = {b: 0 for b in BINDING_ORDER}
    for c in counties:
        b = c.get("binding_A")
        if b in _binding_counts:
            _binding_counts[b] += 1
    _uplifted = sum(1 for c in counties if c.get("capacity_uplift_flag"))
    json.dump({
        "total_budget_ksh": 73200000000,
        "regime_a": {"label": "Capital Concentration",
                     "counties_activated": sum(1 for c in counties if (c.get("units_A") or 0) > 0),
                     "total_counties": 47,
                     "total_units": int(sum(c["units_A"] or 0 for c in counties)),
                     "total_cost_ksh": sum(c["cost_A_ksh"] or 0 for c in counties)},
        "regime_b": {"label": "Universal Coverage", "counties_activated": 47,
                     "total_counties": 47, "total_units": 6000, "total_cost_ksh": 19750000000},
        "regime_c": {"label": "Capacity-Targeted (Option C)",
                     "total_units": int(sum(c["units_C"] or 0 for c in counties)),
                     "total_cost_ksh": sum(c["cost_C_ksh"] or 0 for c in counties),
                     "counties_uplifted": _uplifted,
                     "uplift_factor": 1.5},
        "binding_counts_regime_a": _binding_counts,
        "national_delivery_capacity_units": int(sum(c["capacity_ceiling_units"] or 0 for c in counties)) if deploy_meta["available"] else None,
        "aspirational": {"quota_units": 200000, "backlog_units": 15365,
                         "backlog_cost_ksh": 50580000000, "counties_activated": 47,
                         "fundable": True},
        "fy24_25_completions": 1795,
        # ── top-10 computed from live deployment CSV (no hard-coded stale values) ──
        "top10_regime_a": [
            {"county": c["county"], "units": c["units_A"] or 0,
             "cost_ksh": rd(c["cost_A_ksh"] or 0, 0),
             "hfvs_mean": rd(c["hfvs_mean"], 4), "theta_ccr": rd(c["theta_ccr"], 4)}
            for c in sorted(counties, key=lambda x: -(x["units_A"] or 0))
            if (c["units_A"] or 0) > 0
        ][:10],
    }, f, indent=1)
print("milp.json")

with open(GEO_SRC) as f:
    geo = json.load(f)
NAME_FIX = {"Trans-Nzoia": "Trans Nzoia", "TransNzoia": "Trans Nzoia",
            "Elgeyo/Marakwet": "Elgeyo-Marakwet", "ElgeyoMarakwet": "Elgeyo-Marakwet",
            "Nithi": "Tharaka-Nithi", "Taita/Taveta": "Taita-Taveta",
            "TaitaTaveta": "Taita-Taveta", "Tana-River": "Tana River",
            "TanaRiver": "Tana River", "West-Pokot": "West Pokot",
            "WestPokot": "West Pokot", "UasinGishu": "Uasin Gishu",
            "HomaBay": "Homa Bay"}
valid = set(COUNTIES_ALPHA)
unmatched = []
for feat in geo["features"]:
    p = feat["properties"]
    n = p.get("NAME_1", "")
    n = NAME_FIX.get(n, n)
    p["county_name"] = n
    if n not in valid:
        unmatched.append(n)
print("GeoJSON unmatched:", unmatched)
with open(os.path.join(OUT, "kenya_counties.geojson"), "w") as f:
    json.dump(geo, f, separators=(",", ":"))
print("kenya_counties.geojson (%d features)" % len(geo["features"]))
print("DONE ->", OUT)
