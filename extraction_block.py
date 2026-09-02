# %% EXTRACTION BLOCK — dump JSON artifacts for the web dashboard
import json as _json
import os as _os

OUT = "/home/claude/hfvs_build/artifacts"
_os.makedirs(OUT, exist_ok=True)

def _clean(v):
    import numpy as _np
    if isinstance(v, (_np.integer,)):
        return int(v)
    if isinstance(v, (_np.floating,)):
        return None if _np.isnan(v) else round(float(v), 6)
    if isinstance(v, (_np.bool_,)):
        return bool(v)
    if isinstance(v, float):
        return None if v != v else round(v, 6)
    return v

# ---------- 1. county_metrics.json ----------
county_cols_map = {
    "county_name": "county",
    "mean_hfvs": "hfvs_mean",
    "theta_ccr": "theta_ccr",
    "theta_bcc": "theta_bcc",
    "scale_efficiency": "scale_efficiency",
    "units_A": "milp_units_regime_a",
    "units_B": "milp_units_regime_b",
    "cost_A_ksh": "milp_cost_regime_a_ksh",
    "cost_B_ksh": "milp_cost_regime_b_ksh",
    "active_A": "active_regime_a",
    "active_B": "active_regime_b",
    "pop_2026_est": "population_2026_est",
    "vulnerable_population_2026": "vulnerable_population_2026",
    "n_hh": "households_surveyed",
    "mean_hcb": "mean_housing_cost_burden",
    "unit_cost_ksh": "unit_cost_ksh",
    "umax_units": "backlog_capacity_units",
}
county_records = []
for _, r in county_dea.iterrows():
    rec = {}
    for src, dst in county_cols_map.items():
        rec[dst] = _clean(r.get(src))
    rec["is_ccr_frontier"] = bool(r["theta_ccr"] >= 0.999)
    # HFVS tier share for this county (mode / share of High+Critical)
    county_records.append(rec)

with open(f"{OUT}/county_metrics.json", "w") as f:
    _json.dump({"counties": county_records}, f, indent=2)
print(f"Saved county_metrics.json ({len(county_records)} counties)")

# ---------- 2. model_metrics.json ----------
model_chain = [{"stage": k, "r2": _clean(v)} for k, v in MODEL_RESULTS.items()]
model_metrics = {
    "chain": model_chain,
    "champion": {
        "name": _final_best_name,
        "r2": _clean(_final_best_r2),
    },
    "baseline_r2": _clean(MODEL_RESULTS["S6.2 Baseline (Linear Regression)"]),
    "ai_advantage_r2": _clean(_final_best_r2 - MODEL_RESULTS["S6.2 Baseline (Linear Regression)"]),
    "quantile_band_mean_width": _clean(float((q90_test - q10_test).mean())) if "q90_test" in dir() else None,
    "stage1_classifier": {"roc_auc": _clean(auc_score), "accuracy": _clean(acc_score)},
    "stage2_renter_submodel": {"r2": _clean(r2_stage2), "rmse": _clean(rmse_stage2), "mae": _clean(mae_stage2)},
    "hurdle_combined": {"r2": _clean(r2_hurdle_full), "rmse": _clean(rmse_hurdle_full), "mae": _clean(mae_hurdle_full)},
}
with open(f"{OUT}/model_metrics.json", "w") as f:
    _json.dump(model_metrics, f, indent=2)
print("Saved model_metrics.json")

# ---------- 3. shap.json ----------
shap_top15 = [{"feature": feat, "mean_abs_shap": _clean(val)} for feat, val in mean_abs_shap.head(15).items()]
with open(f"{OUT}/shap.json", "w") as f:
    _json.dump({"top_features": shap_top15}, f, indent=2)
print("Saved shap.json")

# ---------- 4. pillars.json ----------
pillar_names = {"d1": "Financial Stress", "d2": "Tenure Insecurity", "d3": "Physical Hazard",
                "d4": "Dwelling Quality", "d5": "Utility Deprivation"}
pillars_out = []
for i in range(1, 6):
    key = f"d{i}"
    pillars_out.append({
        "code": key.upper(),
        "name": pillar_names[key],
        "beta_weight": _clean(BETA_D[key]),
    })
corr_out = {r: {c: _clean(corr_mat.loc[r, c]) for c in corr_mat.columns} for r in corr_mat.index}
tier_dist = df_clean["HFVS_tier"].value_counts(normalize=True).sort_index()
tier_out = {str(k): _clean(v * 100) for k, v in tier_dist.items()}
with open(f"{OUT}/pillars.json", "w") as f:
    _json.dump({"pillars": pillars_out, "correlation_matrix": corr_out, "tier_distribution_pct": tier_out}, f, indent=2)
print("Saved pillars.json")

# ---------- 5. milp.json ----------
milp_out = {
    "total_budget_ksh": _clean(TOTAL_BUDGET_KSH),
    "delivery_constrained_quota": _clean(NATIONAL_UNIT_QUOTA_SCENARIOS["delivery_constrained"]),
    "aspirational_quota": _clean(NATIONAL_UNIT_QUOTA_SCENARIOS["aspirational"]),
    "regime_a": {
        "label": "Capital Concentration",
        "counties_activated": int(county_dea["active_A"].sum()),
        "total_counties": int(n_counties),
        "total_units": _clean(county_dea["units_A"].sum()),
        "total_cost_ksh": _clean(county_dea["cost_A_ksh"].sum()),
    },
    "regime_b": {
        "label": "Universal Coverage",
        "counties_activated": int(county_dea["active_B"].sum()),
        "total_counties": int(n_counties),
        "total_units": _clean(county_dea["units_B"].sum()),
        "total_cost_ksh": _clean(county_dea["cost_B_ksh"].sum()),
    },
    "cost_of_universal_coverage_ksh": _clean(cost_of_universal_coverage),
    "aspirational_scenario": {
        "total_units": _clean(_aspirational_units),
        "counties_activated": int(_aspirational_active),
        "total_cost_ksh": _clean(sum(u * c for u, c in zip(regime_A_aspirational["u"], county_dea["unit_cost_ksh"]))),
        "backlog_units": _clean(_sum_umax),
        "backlog_cost_ksh": _clean(_sum_umax_cost),
    },
    "fy24_25_completions": 1795,
    "base_construction_cost_ksh": _clean(BASE_CONSTRUCTION_COST_KSH),
}
with open(f"{OUT}/milp.json", "w") as f:
    _json.dump(milp_out, f, indent=2)
print("Saved milp.json")

# ---------- 6. national_summary.json ----------
national_summary = {
    "households_surveyed": int(len(df_clean)),
    "counties_covered": int(df_clean["county_code"].nunique()),
    "hfvs_mean": _clean(df_clean["HFVS"].mean()),
    "hfvs_std": _clean(df_clean["HFVS"].std()),
    "tier_distribution_pct": tier_out,
    "high_critical_share_pct": _clean(tier_out.get("High", 0) + tier_out.get("Critical", 0)),
    "cost_only_screen_share_pct": _clean(100 * (df_clean["housing_cost_burden"] > 0.3).mean()),
    "mean_hcb": _clean(df_clean["housing_cost_burden"].mean()),
    "median_hcb": _clean(df_clean["housing_cost_burden"].median()),
    "tenure_split": {
        "owner_occupier_pct": _clean(100 * (df_clean["dwelling_tenure_type_code"] == 1).mean()),
        "renter_pct": _clean(100 * (df_clean["dwelling_tenure_type_code"] == 2).mean()),
    },
    "female_headed_pct": _clean(100 * df_clean["hh_head_gender"].eq(2).mean()) if "hh_head_gender" in df_clean.columns else None,
    "champion_model": {"name": _final_best_name, "r2": _clean(_final_best_r2)},
    "champion_r2_gain_vs_linear": _clean(_final_best_r2 - MODEL_RESULTS["S6.2 Baseline (Linear Regression)"]),
    "dea_mean_theta_ccr": _clean(county_dea["theta_ccr"].mean()),
    "dea_mean_theta_bcc": _clean(county_dea["theta_bcc"].mean()),
    "dea_frontier_counties": int((county_dea["theta_ccr"] >= 0.999).sum()),
    "milp_regime_a_counties": int(county_dea["active_A"].sum()),
    "milp_regime_b_counties": int(county_dea["active_B"].sum()),
    "milp_units_delivery_constrained": _clean(county_dea["units_A"].sum()),
    "milp_cost_delivery_constrained_ksh": _clean(county_dea["cost_A_ksh"].sum()),
    "milp_backlog_units": _clean(_sum_umax),
    "milp_backlog_cost_ksh": _clean(_sum_umax_cost),
    "fy24_25_completions": 1795,
    "total_levy_budget_ksh": _clean(TOTAL_BUDGET_KSH),
}
with open(f"{OUT}/national_summary.json", "w") as f:
    _json.dump(national_summary, f, indent=2)
print("Saved national_summary.json")

print("ALL ARTIFACTS SAVED to", OUT)