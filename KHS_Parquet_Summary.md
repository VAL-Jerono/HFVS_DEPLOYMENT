# KHS 2023/24 – Parquet Dataset Summary

**Source:** `Dataset folder` (14 parquet files, Survey Solutions-style exports of the *Kenya Housing Survey 2023/24 – Makao Fiti, Maisha Bora*), read against the questionnaire summary you attached.

**How this was produced:** every file was fully decoded and each row count was checked against the parquet footer. Types, completeness and distinct-value counts are computed from the data. **Column labels are not embedded in the parquet files** (no value labels, no variable labels), so the meaning of a coded column is *inferred* from the questionnaire order, the skip pattern (which share of rows answer it) and the value distribution. Meanings marked ✓ were cross-checked against the data; those marked ~ are best inference and should be confirmed against the Survey Solutions export labels / DDI before they go into a report.

## 0. Overview and how the files fit together

| # | File | Rows | Cols | One row = | Respondent |
|---|---|---:|---:|---|---|
| 1 | `Household_Information_Data.parquet` | 21,347 | 392 | one household | Households |
| 2 | `Individual_Data.parquet` | 80,889 | 97 | one household member | Households |
| 3 | `Dwelling_Units_Data.parquet` | 25,116 | 25 | one dwelling unit (a household can have several) | Households |
| 4 | `Land_Parcels_Data.parquet` | 11,136 | 34 | one land parcel (up to 6 per household) | Households |
| 5 | `KHS_Institutional_Data.parquet` | 348 | 194 | one developer / contractor / agent establishment | Developers, contractors, agents |
| 6 | `Project Information.parquet` | 71 | 211 | one project (up to 13 per establishment) | Developers |
| 7 | `Type of Housing Units.parquet` | 131 | 17 | one housing-unit type within a project | Developers |
| 8 | `Real_Estate_Dataset.parquet` | 7,236 | 300 | one row of a stacked listing roster (see note in §2) | Real-estate agents |
| 9 | `Housing_Financiers_Data.parquet` | 351 | 63 | one financier | Financiers |
| 10 | `Housing_Loans_Data.parquet` | 946 | 10 | one loan product of a financier | Financiers |
| 11 | `Housing_Mortgage_Data.parquet` | 1,644 | 13 | one stacked mortgage roster row (see note in §2) | Financiers |
| 12 | `County_Physical_Planning_Data.parquet` | 47 | 116 | one county government | County governments |
| 13 | `NEMA_Data_Set.parquet` | 48 | 45 | one NEMA county office | NEMA |
| 14 | `Water_Services_Providers_Data.parquet` | 153 | 96 | one water / sewer provider | WSSPs |

Total across files: 149,463 rows. The three large household-side files (Household, Individual, Dwelling) hold 127,352 of them; the institutional files are small (47 to 7,236 rows), so most are better used as context or descriptive tables than as modelling targets.

**Join map (verified on the data):**

- `Household_Information_Data` ← `Individual_Data` on **`interview__key`** (21,346 of 21,347 household keys match; the `interview__id` values in the Individual file are a differently formatted string and match nothing in the Household file, so **do not join on `interview__id`**).
- `Household_Information_Data` ← `Dwelling_Units_Data` on `interview__key` (21,346 of 21,354 dwelling keys match; 8 dwelling keys have no household row and 1 household has no dwelling row).
- `Household_Information_Data` ← `Land_Parcels_Data` on `interview__key` (9,707 of 9,710 keys match).
- `KHS_Institutional_Data` ← `Project Information` on `interview__key` (32 of 32) ← `Type of Housing Units` on `interview__key` + `c3_2__id` (29 of 29 keys).
- `KHS_Institutional_Data` ← `Real_Estate_Dataset` on `interview__id` (235 of 272 agency ids match).
- `Housing_Financiers_Data` ← `Housing_Loans_Data` and `Housing_Mortgage_Data` on `interview__key` (280 of 289 and 351 of 404 keys respectively match).
- **`est_code` is not a shared key.** It restarts at 1 in each institution type (1–348 in KHS_Institutional, 1–351 in Financiers), so it must not be used to link across institution files.
- **County is stored in several different ways**, so county-level joins need a lookup: numeric `a01` plus zero-padded string `countycode` (Household), zero-padded **code string** in `cg00` (County_Physical_Planning, despite the name), integer `nm00` (NEMA), integer in a column called `county_name` (Water_Services_Providers), and real names in `county_name` (Financiers, Loans, Mortgage, KHS_Institutional, Real_Estate; Financiers/Loans mix cases such as `NAIROBI CITY` / `Nairobi City`).

## 1. Number of rows per parquet

| File | Rows |
|---|---:|
| `Household_Information_Data.parquet` | 21,347 |
| `Individual_Data.parquet` | 80,889 |
| `Dwelling_Units_Data.parquet` | 25,116 |
| `Land_Parcels_Data.parquet` | 11,136 |
| `KHS_Institutional_Data.parquet` | 348 |
| `Project Information.parquet` | 71 |
| `Type of Housing Units.parquet` | 131 |
| `Real_Estate_Dataset.parquet` | 7,236 |
| `Housing_Financiers_Data.parquet` | 351 |
| `Housing_Loans_Data.parquet` | 946 |
| `Housing_Mortgage_Data.parquet` | 1,644 |
| `County_Physical_Planning_Data.parquet` | 47 |
| `NEMA_Data_Set.parquet` | 48 |
| `Water_Services_Providers_Data.parquet` | 153 |

## 2. Primary column of each parquet

None of the files carries a declared primary key. The column below is the one that is **verified unique with no missing values** (or the minimal composite that is).

| File | Primary column (verified unique) | Notes |
|---|---|---|
| `Household_Information_Data.parquet` | `interview__key` | 21,347 distinct = rows. `interview__id` and `serial` are also unique alternatives. |
| `Individual_Data.parquet` | `interview__key` + `hhid__id` | `hhid__id` is the member number within the household (1–18). `interview__key` alone repeats (21,347 households, 80,889 members). |
| `Dwelling_Units_Data.parquet` | **none**; use `interview__key` as the foreign key plus a row counter | No unit id column exists, and 112 rows are exact duplicates of another row (probably identical units in one household). Decide whether to drop them before counting units. |
| `Land_Parcels_Data.parquet` | `interview__key` + `land_parcels__id` | Parcel number 1–6 within the household. |
| `KHS_Institutional_Data.parquet` | `interview__key` | 348 distinct; `est_code` and `interview__id` are also unique. |
| `Project Information.parquet` | `interview__key` + `c3_2__id` | Project number 1–13 within the establishment (71 projects across 32 establishments). |
| `Type of Housing Units.parquet` | `interview__key` + `c3_2__id` + `c3_32r__id` | Project number plus unit-type number within the project. |
| `Real_Estate_Dataset.parquet` | `interview__id` + `raid` + `rbid` + `rcid` + `rdid` | The file is four listing rosters (`ra*`, `rb*`, `rc*`, `rd*`) combined side by side, so any one roster id repeats across rows. Only the combination of all five is unique (no duplicates, nulls treated as a value). **Aggregate by roster before analysing**, or the same listing is counted several times. |
| `Housing_Financiers_Data.parquet` | `interview__key` | 351 distinct; `est_code` also unique. |
| `Housing_Loans_Data.parquet` | `interview__key` + `housing_loans__id` | Loan-product number 1–10 within the financier. |
| `Housing_Mortgage_Data.parquet` | `interview__key` + `mortgage_fees__id` + `proportion_mortgage_products__id` + `demand_for_mortgage__id` | Three mortgage rosters stacked (fees, product mix, demand); `proportion_mortgage_products__id` is always filled (1–4), the other two only on some rows. |
| `County_Physical_Planning_Data.parquet` | `interview__key` | 47 distinct. `cg00` (county code as text) is also unique, so it is the natural **county key** here. |
| `NEMA_Data_Set.parquet` | `interview__key` | 48 rows but only 47 distinct `nm00` county codes: county **47** appears twice, so `nm00` is not unique. |
| `Water_Services_Providers_Data.parquet` | `interview__key` | 153 providers over 45 counties, so the county column repeats. |

## 3. Columns available in each parquet, by data type

**How types are shown.** Parquet stores each column as `string`, `int32`, `float32` or `float64`. Many numeric survey codes are stored as `float64` only because they contain missing values, so a stored type alone is misleading. Each column is therefore placed in one of these classes, derived from the stored type and the observed values:

| Class | Rule used |
|---|---|
| **Identifier** | key columns and roster ids (`interview__*`, `est_code`, `serial`, `*__id`, `raid/rbid/rcid/rdid`) |
| **Text** | stored as string: free-text “other (specify)” answers, county names, and a few coded answers kept as text |
| **Binary** | numeric with exactly 2 distinct values (0/1 or 1/2); multi-select checkbox answers appear as `name__code` columns |
| **Categorical code** | integer-valued with 3 to 30 distinct values (nominal or ordinal codes; this heuristic also catches small counts such as rooms) |
| **Categorical code (many levels)** | county codes (47 to 48 levels), identified by name |
| **Numeric – integer** | integer-valued with more than 30 distinct values (counts, ages, years, KSh amounts) |
| **Numeric – decimal** | values with fractional parts (weights, ratios, areas, shares) |
| **Constant / empty** | one value only, or no answers at all, so no analytic use |

Notation: `x__[1-4,96]` means the columns `x__1`, `x__2`, `x__3`, `x__4`, `x__96`. In Survey Solutions code `96` is “other” and `98`/`998` are “don’t know”.

### 3.1 `Household_Information_Data.parquet` (21,347 rows × 392 columns)

Stored types: 315 float64, 40 string, 25 int32, 12 float32. Columns ≥95% filled: 128. Columns <5% filled: 88.

- **Identifier (3):** `interview__key`, `interview__id`, `serial`
- **Text (string) (37):** `countycode`, `c01_1other`, `c01_2other`, `c02_1other`, `c02_2other`, `c03_other`, `c04other`, `c07_1`, `c09_other`, `c10_1`, `c11_other`, `c12_other`, `c13_other`, `e03_1`, `e04_1`, `j06_2_other`, `j12_2other`, `j16_1`, `j19_1`, `j22_1`, `k04_1`, `k11_1`, `k12_1`, `k16_1`, `k22_1`, `k26_other`, `k30_1`, `k32_1`, `k33_other`, `k36_1`, `k39_other`, `l01_1a`, `l01_2a`, `l16_a`, `l19a`, `l22_1a`, `l27_a`
- **Binary (218):** `a07_1`, `c01_3`, `c01_5`, `c02_3`, `c02_5`, `c05`, `c08`, `c09__[1-7,96]`, `c11_1`, `c11_4__[1-7,98]`, `c12_2`, `c13__[1-7,96]`, `d18__[1-8]`, `d20__[1-10]`, `e02__[1-9,96]`, `e09__[1-13]`, `g02`, `g04`, `g05__[1-10]`, `g06__[1-10]`, `i00`, `j02`, `j04_2`, `j05`, `j06_1`, `j06_2__[1-7,96]`, `j07`, `j08`, `j09`, `j10`, `j11`, `j13`, `j14`, `j15`, `j16__[1-5,96]`, `j17`, `j18`, `j19__[1-6,96]`, `j20`, `j21`, `j22__[1-5]`, `k02`, `k06_1`, `k07`, `k08_1`, `k09`, `k13`, `k15`, `k19_1`, `k20`, `k26__[1-8]`, `k29`, `k31`, `k34`, `k35`, `k37`, `l02__[1-7,96]`, `l11`, `l16__[1-13,96]`, `l21`, `l22_1__[1-6,96]`, `l23`, `l25`, `l26`, `l27__[1-6,96]`, `l29`, `l30`, `l16b__[1-13]`, `utilities`
- **Categorical code (3–30 levels) (74):** `a12`, `c01_1`, `c01_2`, `c02_1`, `c02_2`, `c03`, `c04`, `c07`, `c10`, `c10_4`, `c11`, `c11_2`, `c12`, `c12_1`, `c12_3`, `c12_4`, `d01`, `d17`, `d19`, `e01`, `e03`, `e04`, `e06`, `e07`, `e08`, `g03`, `h01`, `h02`, `h03`, `h04`, `h05`, `h06`, `h07`, `h08`, `h09`, `h10`, `h11`, `rnd`, `j03`, `j04_1`, `j12_2`, `j16__6`, `j22__96`, `k01`, `k04`, `k08_2`, `k10`, `k11`, `k12`, `k16`, `k17`, `k21`, `k22`, `k23`, `k24_1`, `k30`, `k32`, `k33`, `k36`, `k38`, `k39`, `l01_1`, `l01_2`, `l09`, `l19`, `l31`, `min_rent`, `ctymin_ut`, `med_brms`, `year_occ`, `pln`, `sf`, `duration`, `bf`
- **Categorical code (many levels) (1):** `a01`
- **Numeric – integer (39):** `c01_4`, `c02_4`, `c06`, `c10_2`, `c10_3`, `c11_2_1`, `c11_3`, `c12_1_1`, `c14_1`, `c14_2`, `c14_3`, `g01c`, `g01e`, `g02_1`, `selectedage`, `j12_1`, `k03`, `k05`, `k06_2`, `k08_3`, `k14`, `k18`, `k19`, `k24`, `k25`, `k27`, `l07`, `l08`, `l10`, `l12`, `l13`, `l14`, `l15`, `l20_a`, `l20_b`, `l20_c`, `l24`, `l28`, `l32`
- **Numeric – decimal (15):** `c12_3_1`, `e05`, `g01a`, `g01b`, `g01d`, `g01f`, `g01g`, `g01h`, `g01i`, `g01j`, `g01k`, `k28`, `prop_util`, `med_prop`, `hhweight`
- **Constant (single value) (5):** `e02_1`, `k26__96`, `l02__8`, `tag`, `internet`

### 3.2 `Individual_Data.parquet` (80,889 rows × 97 columns)

Stored types: 42 float32, 28 float64, 20 int32, 7 string. Columns ≥95% filled: 61. Columns <5% filled: 8.

- **Identifier (3):** `interview__key`, `interview__id`, `hhid__id`
- **Text (string) (5):** `b03_other`, `b09_7other`, `b12_other`, `b13_other`, `b13_2_other`
- **Binary (28):** `b02_1`, `b04`, `b10`, `b11`, `b14_1`, `b14_2`, `b14_3`, `b14_4`, `dsb_aggregate`, `diff_sight`, `diff_hear`, `diff_walk`, `diff_rem`, `diff_self_care`, `diff_comm`, `diff_sight_any`, `diff_hear_any`, `diff_walk_any`, `diff_rem_any`, `diff_self_care_any`, `diff_comm_any`, `any_disability`, `disability_status_unique`, `hhh_sex`, `resid`, `sex`, `agey`, `birthplace`
- **Categorical code (3–30 levels) (38):** `b03`, `b05_monthofbirth`, `b06`, `b07`, `b08_1`, `b08_2`, `b08_3`, `b08_4`, `b08_5`, `b08_6`, `b09_2`, `b09_6`, `b09_7`, `b13_2`, `b13_4`, `b02_length`, `dif_sight`, `dif_hear`, `dif_mobi`, `dif_conc`, `dif_care`, `dif_comm`, `dsb_details`, `disability_d`, `dis_age_5yrbands`, `age_cat_5yrbands`, `age_cat_10yrbands`, `age_cat_aggregate`, `age_cohort`, `ken_edu_isced11`, `ken_edu_attendance`, `edu_attendance`, `relationship_details`, `mrts_details`, `age_dep`, `hhsize`, `size`, `age_group`
- **Categorical code (many levels) (2):** `a01`, `b09_1`
- **Numeric – integer (14):** `b05_years`, `b05_yrofbirth`, `b05_day`, `age_cur`, `b09_3`, `b09_4`, `b09_5`, `b12`, `b13`, `b13_1`, `b13_3`, `b13_5`, `dis_age`, `age_cat`
- **Numeric – decimal (1):** `inw`
- **Constant (single value) (5):** `dummy`, `wap_1`, `youth_age`, `youth_age_k`, `wap`
- **Empty (no answers) (1):** `dsb_aggregate_un`

### 3.3 `Dwelling_Units_Data.parquet` (25,116 rows × 25 columns)

Stored types: 15 float64, 6 string, 4 int32. Columns ≥95% filled: 19. Columns <5% filled: 4.

- **Identifier (2):** `interview__key`, `interview__id`
- **Text (string) (4):** `d03_other`, `d14_other`, `d15_other`, `d16_other`
- **Binary (7):** `a07_1`, `d04`, `d05`, `d06`, `d07`, `d11`, `d11_2`
- **Categorical code (3–30 levels) (10):** `d03`, `d08`, `d08_1`, `d09`, `d10`, `d12`, `d13`, `d14`, `d15`, `d16`
- **Categorical code (many levels) (1):** `a01`
- **Numeric – integer (1):** `d11_1`

### 3.4 `Land_Parcels_Data.parquet` (11,136 rows × 34 columns)

Stored types: 30 float64, 2 string, 2 int32. Columns ≥95% filled: 24. Columns <5% filled: 7.

- **Identifier (3):** `interview__key`, `interview__id`, `land_parcels__id`
- **Binary (17):** `i02__[3-7]`, `i07__[1-11,96]`
- **Categorical code (3–30 levels) (13):** `i01_3`, `i02__[0-2]`, `i04`, `i05`, `i06`, `i08`, `i09`, `i10`, `i11`, `i12`, `i13`
- **Categorical code (many levels) (1):** `i03`

### 3.5 `KHS_Institutional_Data.parquet` (348 rows × 194 columns)

Stored types: 152 float64, 31 string, 8 float32, 3 int32. Columns ≥95% filled: 8. Columns <5% filled: 39.

- **Identifier (3):** `interview__key`, `interview__id`, `est_code`
- **Text (string) (19):** `county_name`, `b2_1__[0-4]`, `b2_8i`, `b2_18ci`, `b2_19ci`, `d4_3`, `e5_1a__[0-6]`, `e5_8i`, `e5_9i`
- **Binary (100):** `identifier_activity__[1-3]`, `b2_1__0c`, `b2_1__2c`, `b2_4a`, `b2_6_1a`, `b2_8__[1-6,96]`, `b2_10b_1a`, `b2_10b_1b`, `b2_10b_1c`, `b2_10b_2a`, `b2_10b_2b`, `b2_10b_2c`, `b2_10b_3a`, `b2_10b_3b`, `b2_10b_3c`, `b2_11__[1-4,96]`, `b2_12a`, `b2_12b`, `b2_12c`, `b2_13a`, `b2_13b`, `b2_13c`, `b2_14a`, `b2_14b`, `b2_14c`, `b2_15a`, `b2_15b`, `b2_15c`, `b2_16__[1-12]`, `b2_18a`, `b2_18b`, `b2_19a`, `b2_19b`, `b2_20__[1-4]`, `d4_1`, `d4_2__[1-7,9,11,13,96]`, `e5_1a__3c`, `e5_4b`, `e5_6_1b`, `e5_8__[1-3,96]`, `e5_10`, `e5_11__[1-7]`, `e5_12`, `e5_13__[1,2]`, `e5_14__[1,2]`, `e5_15__[1-4]`, `re1__[2-5]`
- **Categorical code (3–30 levels) (29):** `activity`, `b2_3`, `b2_5a`, `b2_5b`, `b2_7`, `b2_9`, `b2_17a`, `b2_17b`, `b2_17c`, `b2_17d`, `b2_17e`, `b2_17f`, `b2_17g`, `b2_17h`, `b2_17i`, `b2_17j`, `b2_17k`, `b2_18c`, `b2_19c`, `c3_0`, `e5_1a__0c`, `e5_1a__1c`, `e5_1a__2c`, `e5_3`, `e5_4a`, `e5_5a`, `e5_5b`, `e5_6_1a`, `e5_9`
- **Numeric – integer (2):** `e5_1b`, `e5_7`
- **Numeric – decimal (5):** `b2_1b`, `b2_6_2a`, `b2_6_2b`, `e5_6_2a`, `e5_6_2b`
- **Constant (single value) (27):** `developer`, `b2_1__1c`, `b2_1__3c`, `b2_1__4c`, `b2_1__[5-9]`, `b2_6_1b`, `b2_9i`, `b2_11i`, `d4_2__[10,12]`, `e5_1a__4c`, `e5_1a__5c`, `e5_1a__6c`, `e5_1a__[7-9]`, `e5_11__96`, `re1__1`, `resonly`, `commonly`, `both`, `unique`, `bothonly`
- **Empty (no answers) (9):** `b2_1__5c`, `b2_1__6c`, `b2_1__7c`, `b2_1__8c`, `b2_1__9c`, `b2_4b`, `e5_1a__7c`, `e5_1a__8c`, `e5_1a__9c`

### 3.6 `Project Information.parquet` (71 rows × 211 columns)

Stored types: 130 float64, 67 int32, 14 string. Columns ≥95% filled: 92. Columns <5% filled: 28.

- **Identifier (4):** `interview__key`, `interview__id`, `c3_2__id`, `c3_29b_r__id`
- **Text (string) (5):** `c3_1a`, `c3_2c`, `c3_6a_Other`, `c3_10`, `c3_12`
- **Binary (118):** `c3_1b__[1-3,5,6]`, `c3_3a`, `c3_5a`, `c3_6a`, `c3_7`, `c3_8b__[1-6]`, `c3_9__[1-4,96]`, `c3_13`, `c3_19a`, `c3_19b`, `c3_19c__[1-4]`, `c3_20a__[1-12]`, `c3_20b__[1-9]`, `c3_21__[1-8]`, `c3_22a__[1-6]`, `c3_23__[1-15]`, `c3_25__[2-4]`, `c3_27__[1-4]`, `c3_28a`, `c3_29a__[1,3,4,7-9,11,12,96]`, `c3_29a_1_9`, `c3_31a__[1-3,5]`, `c3_31d__[1-5,96]`, `c3_32__[1-3,7-14,17,18]`
- **Categorical code (3–30 levels) (23):** `c3_2a`, `c3_2b`, `c3_3b`, `c3_4`, `c3_5b`, `c3_8a`, `c3_11`, `c3_14`, `c3_15`, `c3_16`, `c3_17`, `c3_18`, `c3_22b_1_1`, `c3_22b_1_2`, `c3_22b_1_3`, `c3_24`, `c3_26a`, `c3_26b`, `c3_28d`, `c3_29a_1_4`, `c3_29a_1_7`, `c3_29a_1_8`, `c3_31c`
- **Numeric – integer (3):** `c3_22b_2_1`, `c3_22b_2_2`, `c3_22b_2_3`
- **Numeric – decimal (7):** `c3_29a_1_3`, `c3_30b1`, `c3_30b2`, `c3_30b3`, `c3_30b4`, `c3_30b5`, `c3_30b6`
- **Constant (single value) (40):** `c3_1b__4`, `c3_6b`, `c3_9Other`, `c3_25__[1,5,96]`, `c3_28b`, `c3_29a__[2,5,6,10]`, `c3_29a_1_1`, `c3_29a_1_11`, `c3_29b_1`, `c3_29b_2`, `c3_29b__[1-9,96]`, `c3_31a__[4,6]`, `c3_32__[4-6,15,16,19-26]`
- **Empty (no answers) (11):** `c3_18other`, `c3_19bother`, `c3_24other`, `c3_25other`, `c3_26other`, `c3_26b_other`, `c3_28c`, `c3_29a_1_12`, `c3_29a_1_96`, `c3_31b__[1,2]`

### 3.7 `Type of Housing Units.parquet` (131 rows × 17 columns)

Stored types: 13 float64, 2 string, 2 int32. Columns ≥95% filled: 9. Columns <5% filled: 0.

- **Identifier (4):** `interview__key`, `interview__id`, `c3_2__id`, `c3_32r__id`
- **Categorical code (3–30 levels) (5):** `c3_34`, `c3_36b`, `c3_37`, `c3_38`, `c3_40`
- **Numeric – integer (6):** `c3_33`, `c3_35`, `Total_Units_Check`, `c3_36b_1`, `c3_37_1`, `c3_39`
- **Numeric – decimal (2):** `c3_36a`, `c3_36a_1`

### 3.8 `Real_Estate_Dataset.parquet` (7,236 rows × 300 columns)

Stored types: 286 float64, 10 string, 4 float32. Columns ≥95% filled: 2. Columns <5% filled: 144.

- **Identifier (6):** `interview__id`, `raid`, `rbid`, `rcid`, `rdid`, `warehousing_storage__id`
- **Text (string) (4):** `county_name`, `b2_18ci`, `e5_8i`, `e5_9i`
- **Binary (152):** `identifier_activity__[1,2]`, `b2_1__2c`, `b2_6_1a`, `b2_8__[1-6]`, `b2_10b_1a`, `b2_10b_1b`, `b2_10b_1c`, `b2_10b_2a`, `b2_10b_2b`, `b2_10b_2c`, `b2_10b_3a`, `b2_10b_3b`, `b2_10b_3c`, `b2_11__[1-4,96]`, `b2_12a`, `b2_12b`, `b2_12c`, `b2_13a`, `b2_13b`, `b2_13c`, `b2_14a`, `b2_14b`, `b2_14c`, `b2_15a`, `b2_15b`, `b2_15c`, `b2_16__[1-12]`, `b2_18a`, `b2_18b`, `b2_19a`, `b2_19b`, `b2_20__[1-4]`, `d4_1`, `d4_2__[1-4,7,9,11]`, `e5_1a__3c`, `e5_4b`, `e5_6_1b`, `e5_8__[1-3,96]`, `e5_10`, `e5_11__[1-7]`, `e5_12`, `e5_13__[1,2]`, `e5_14__[1,2]`, `e5_15__[1-4]`, `ra4`, `ra5`, `ra7__[1-12]`, `ra12a`, `ra17`, `rb4`, `rb5`, `rb7__[1-12]`, `rb12a`, `rb16_2`, `rb17`, `rb19`, `rb21`, `rc3__[1-8]`, `rc11`, `rc13a`, `rd3__[1-8]`, `rd11`, `rd14`, `rd16__[1-9]`
- **Categorical code (3–30 levels) (76):** `a1_5a`, `a1_5b`, `b2_1b`, `b2_3`, `b2_5a`, `b2_5b`, `b2_6_2a`, `b2_6_2b`, `b2_7`, `b2_9`, `b2_17a`, `b2_17b`, `b2_17c`, `b2_17d`, `b2_17e`, `b2_17f`, `b2_17g`, `b2_17h`, `b2_17i`, `b2_17j`, `b2_17k`, `b2_18c`, `b2_19c`, `c3_0`, `e5_1a__0c`, `e5_1a__1c`, `e5_1a__2c`, `e5_3`, `e5_4a`, `e5_5a`, `e5_5b`, `e5_6_1a`, `e5_9`, `ra2`, `ra3`, `ra9`, `ra14`, `ra14i`, `ra16`, `ra16i`, `ra17i`, `rb2`, `rb3`, `rb8`, `rb9`, `rb14`, `rb14i`, `rb16i`, `rb16_3`, `rb22`, `rc2`, `rc4a`, `rc6`, `rc10a`, `rc10_2`, `rc10_3`, `rc12`, `rc14`, `rc14i`, `rd2`, `rd4a`, `rd5`, `rd6`, `rd10a`, `rd10_3`, `rd12`, `rd13a`, `rd17i`, `re2`, `re3`, `re4`, `re4_check`, `re5a`, `re5b`, `re6a`, `re6b`
- **Categorical code (many levels) (2):** `ra8`, `rc5`
- **Numeric – integer (14):** `e5_1b`, `e5_7`, `ra6`, `ra12b`, `rb6`, `rb13`, `rb16`, `rb16_4`, `rb18`, `rb20`, `rc10b`, `rd4b`, `rd10_2`, `rd17`
- **Numeric – decimal (14):** `e5_6_2a`, `e5_6_2b`, `ra13`, `ra15`, `ra18`, `rb12b`, `rb15`, `rc4b`, `rc9`, `rc13b`, `rd9`, `rd10b`, `rd13b`, `rd15`
- **Constant (single value) (20):** `identifier_activity__3`, `b2_1__0c`, `b2_1__1c`, `b2_1__3c`, `b2_1__4c`, `b2_4a`, `b2_6_1b`, `b2_8__96`, `b2_11i`, `b2_19ci`, `d4_2__[5,6,10,12,13,96]`, `e5_1a__4c`, `e5_1a__5c`, `e5_1a__6c`, `e5_11__96`
- **Empty (no answers) (12):** `b2_1__5c`, `b2_1__6c`, `b2_1__7c`, `b2_1__8c`, `b2_1__9c`, `b2_4b`, `b2_8i`, `b2_9i`, `d4_3`, `e5_1a__7c`, `e5_1a__8c`, `e5_1a__9c`

### 3.9 `Housing_Financiers_Data.parquet` (351 rows × 63 columns)

Stored types: 51 float64, 10 string, 1 float32, 1 int32. Columns ≥95% filled: 32. Columns <5% filled: 3.

- **Identifier (3):** `interview__key`, `interview__id`, `est_code`
- **Text (string) (8):** `county_name`, `se1i`, `se3_other`, `se6i`, `se11i`, `se12i`, `se14i`, `se16i`
- **Binary (28):** `se3a__[1-6,8,9,96]`, `se6__[1-5,96]`, `se9__[1-5]`, `se10__[1-3]`, `se11__[1-4,96]`
- **Categorical code (3–30 levels) (19):** `se1`, `se2__[1-3]`, `se3a__7`, `se5a`, `se8b`, `se11__[5,6]`, `se12`, `se13`, `se14__[1-5,96]`, `se15`, `se16`
- **Numeric – integer (2):** `se5b1`, `se5b2`
- **Numeric – decimal (3):** `se4a`, `se4b`, `se7`

### 3.10 `Housing_Loans_Data.parquet` (946 rows × 10 columns)

Stored types: 4 string, 3 float64, 2 int32, 1 float32. Columns ≥95% filled: 6. Columns <5% filled: 1.

- **Identifier (4):** `interview__key`, `interview__id`, `est_code`, `housing_loans__id`
- **Text (string) (1):** `county_name`
- **Categorical code (3–30 levels) (1):** `se1`
- **Numeric – integer (1):** `se3b`
- **Numeric – decimal (2):** `se3c`, `se3d`
- **Empty (no answers) (1):** `se1i`

### 3.11 `Housing_Mortgage_Data.parquet` (1,644 rows × 13 columns)

Stored types: 6 float64, 4 string, 2 float32, 1 int32. Columns ≥95% filled: 5. Columns <5% filled: 1.

- **Identifier (6):** `interview__key`, `interview__id`, `est_code`, `mortgage_fees__id`, `proportion_mortgage_products__id`, `demand_for_mortgage__id`
- **Text (string) (2):** `county_name`, `se1i`
- **Categorical code (3–30 levels) (2):** `se1`, `se9b`
- **Numeric – decimal (3):** `se6b`, `mean_se6b`, `se8a`

### 3.12 `County_Physical_Planning_Data.parquet` (47 rows × 116 columns)

Stored types: 98 float64, 18 string. Columns ≥95% filled: 8. Columns <5% filled: 4.

- **Identifier (2):** `interview__key`, `interview__id`
- **Text (string) (13):** `cg00`, `cg2i_other_institutions`, `cg6i`, `cg7__[0-3]`, `cg9i`, `cg13i`, `cg15i`, `cg16i`, `cg19i`, `cg22i`
- **Binary (83):** `cg1_1`, `cg1_2`, `cg2__[1-6,96]`, `cg6__[1-8,96]`, `cg8__[1-7]`, `cg9__[1-8,96]`, `cg11`, `cg13__[1-9,96]`, `cg15__[1-4,96]`, `cg16__[1-5,96]`, `cg19__[1-3,96]`, `cg22__[1-8,96]`, `cg25__[1-13,96]`
- **Categorical code (3–30 levels) (6):** `cg1_3`, `cg3`, `cg12`, `cg21a`, `cg21b`, `cg21c`
- **Numeric – integer (4):** `cg1a`, `cg1b`, `cg4a`, `cg4b`
- **Constant (single value) (7):** `cg7__0c`, `cg7__1c`, `cg7__2c`, `cg7__3c`, `cg7__4`, `cg12i`, `cg25i`
- **Empty (no answers) (1):** `cg7__4c`

### 3.13 `NEMA_Data_Set.parquet` (48 rows × 45 columns)

Stored types: 37 float64, 7 string, 1 int32. Columns ≥95% filled: 39. Columns <5% filled: 2.

- **Identifier (2):** `interview__key`, `interview__id`
- **Text (string) (4):** `nema4_others`, `nema5_others`, `nema8_others`, `nema9_others`
- **Binary (30):** `nema4__[1-7,96]`, `nema5__[1-5,96]`, `nema8__[1-7,96]`, `nema9__[1-7,96]`
- **Categorical code (3–30 levels) (1):** `nema6`
- **Categorical code (many levels) (1):** `nm00`
- **Numeric – integer (4):** `nema1a`, `nema1b`, `nema2a`, `nema2b`
- **Constant (single value) (1):** `nema7_1`
- **Empty (no answers) (2):** `nema7_2__0`, `nema7_2__0c`

### 3.14 `Water_Services_Providers_Data.parquet` (153 rows × 96 columns)

Stored types: 63 float64, 29 string, 3 float32, 1 int32. Columns ≥95% filled: 28. Columns <5% filled: 11.

- **Identifier (3):** `interview__key`, `interview__id`, `est_code`
- **Text (string) (22):** `wssp6a__[0-6]`, `wssp6b__[0-4]`, `wssp8_1`, `wssp11_1__[0-4]`, `wssp14_other`, `wssp15_other`, `wssp16`, `wssp17`
- **Binary (27):** `wssp6a__0c`, `wssp6a__1c`, `wssp6a__2c`, `wssp6b__0c`, `wssp6b__1c`, `wssp6b__2c`, `wssp8__[1-5,96]`, `wssp9_unit`, `wssp12`, `wssp13_2`, `wssp14__[1-6,96]`, `wssp15__[1-4,96]`
- **Categorical code (3–30 levels) (10):** `wssp4b`, `wssp5a`, `wssp5b`, `wssp7`, `wssp9`, `wssp10`, `wssp10_unit`, `wssp11b`, `wssp9_new`, `wssp10_new`
- **Categorical code (many levels) (1):** `county_name`
- **Numeric – integer (12):** `wssp1a`, `wssp1b`, `wssp2a`, `wssp2b`, `wssp2c`, `wssp2d`, `wssp3a`, `wssp3b`, `wssp4a`, `wssp11a`, `wssp13_1a`, `wssp13_1b`
- **Constant (single value) (16):** `wssp6a__3c`, `wssp6a__4c`, `wssp6a__5c`, `wssp6a__6c`, `wssp6b__3c`, `wssp6b__4c`, `wssp6b__[5-9]`, `wssp11_1__0c`, `wssp11_1__1c`, `wssp11_1__2c`, `wssp11_1__3c`, `wssp11_1__4c`
- **Empty (no answers) (5):** `wssp6b__5c`, `wssp6b__6c`, `wssp6b__7c`, `wssp6b__8c`, `wssp6b__9c`

## 4. Categorical columns most worth studying

Chosen with housing siting, infrastructure allocation and housing affordability in mind. “Levels” and “Filled” are measured; **Meaning** is ✓ confirmed on the data or ~ inferred (see the note at the top). Where a column is only filled for a sub-group (skip logic) the sub-group is stated.

### 4.1 `Household_Information_Data` (primary analysis table)

| Column | Meaning | Levels | Filled |
|---|---|---:|---:|
| `a01` | County (47 counties; `countycode` is the same as zero-padded text) ✓ | 47 | 100% |
| `a07_1` | Residence stratum (same 60/40 split as `resid` in Individual_Data; presumably urban/rural) ~ | 2 | 100% |
| `c01_1` | Main drinking-water source ~ | 12 | 100% |
| `c02_1` | Water source for other uses ~ | 13 | 100% |
| `c04` | Toilet / sanitation facility type ~ | 14 | 100% |
| `c07` | Handwashing facility ~ | 5 | 100% |
| `c08` | Electricity connection (yes/no) ~ | 2 | 100% |
| `c10` | Main lighting energy ~ | 13 | 100% |
| `c11` | Main cooking energy ~ | 15 | 100% |
| `c12` | Cookstove type ~ | 11 | 99% |
| `d17` | Cultural fit of the dwelling ~ | 3 | 100% |
| `d19` | Perceived adequacy of the dwelling (the barriers block `d20__*` is asked of ~17% of households, matching the share answering the lowest code) ~ | 3 | 100% |
| `e01` | Environmental exposure (flood / hazard block `e01`, `e06`, `e07` are 3-level 0/1/2 items) ~ | 3 | 100% |
| `e03` | Solid-waste disposal method ~ | 11 | 100% |
| `e08` | Pollution / noise rating (4 levels) ~ | 4 | 100% |
| `g03` | Road type or surface (4 levels) ~ | 4 | 100% |
| `h01` | Home accessibility rating (`h01`–`h11` are the accessibility items) ~ | 5 | 100% |
| `j04_1` | Awareness item in the integrated module (0/1/2) ~ | 3 | 100% |
| `k01` | Landlord type (tenant households only) ~ | 9 | 33% |
| `l01_1` | How the owner-occupied unit was acquired (owner households only) ~ | 7 | 62% |
| `l01_2` | How the owner-occupied unit was financed (owner households only) ~ | 7 | 48% |

Multi-select families that are also worth encoding as groups of binary flags: `d18__[1-8]` (discrimination in accessing housing, 8 grounds), `d20__[1-10]` (barriers, asked only if the dwelling is rated inadequate), `e02__[1-9,96]` (proximity to hazards), `e09__[1-13]` (neighbourhood facilities), `g05__[1-10]` (utilities provided) and `g06__[1-10]` (whether they function).

### 4.2 `Dwelling_Units_Data`

| Column | Meaning | Levels | Filled |
|---|---|---:|---:|
| `d03` | Dwelling type (bungalow, flat, maisonette, Swahili/compound, shanty, manyatta, townhouse …) ✓ | 8 | 100% |
| `d12` | Tenure of the unit: owner / renter / rent-free / other (cross-checked: the “renter” code coincides exactly with the tenant module, the “owner” code with the owner-occupied module) ✓ | 4 | 100% |
| `d04` | Attached vs detached ~ | 2 | 100% |
| `d05` | Electricity in the unit ~ | 2 | 100% |
| `d06` | Piped water in the unit ~ | 2 | 100% |
| `d07` | Air conditioning (only 1% yes) ~ | 2 | 100% |
| `d14` | Main floor material ~ | 10 | 100% |
| `d15` | Main wall material ~ | 18 | 100% |
| `d16` | Main roof material (one code covers 86%) ~ | 9 | 100% |
| `a01` | County (47) ✓ | 47 | 100% |

### 4.3 `Individual_Data`

| Column | Meaning | Levels | Filled |
|---|---|---:|---:|
| `b03` | Relationship to household head (same as `relationship_details`) ✓ | 13 | 100% |
| `sex` | Sex (`b04` holds the raw answer) ~ | 2 | 100% |
| `resid` | Residence stratum (matches `a07_1`) ~ | 2 | 100% |
| `b06` | Marital status (asked of a subset, 64% filled; same as `mrts_details`) ~ | 6 | 64% |
| `ken_edu_isced11` | Education level, ISCED-11 recode ~ | 15 | 100% |
| `ken_edu_attendance` | School attendance status (3 levels) ~ | 3 | 100% |
| `any_disability` | Any functional difficulty (derived from the six `b08_*` / `dif_*` items) ✓ | 2 | 100% |
| `age_cat_10yrbands` | Age in 10-year bands (`age_cat_5yrbands`, `age_cat_aggregate`, `age_cohort` are alternative groupings) ~ | 7 | 100% |
| `b09_1` | County of birth (migration) ~ | 48 | 100% |
| `hhh_sex` | Sex of household head (filled only on head rows) ~ | 2 | 26% |

`b08_[1-6]` and `dif_*` are the six functional-difficulty items (seeing, hearing, walking, remembering, self-care, communicating) on a four-point scale.

### 4.4 `Land_Parcels_Data`

| Column | Meaning | Levels | Filled |
|---|---|---:|---:|
| `i01_3` | How the parcel was acquired ~ | 11 | 100% |
| `i03` | County of the parcel ~ | 48 | 98% |
| `i04` | Land category ~ | 3 | 98% |
| `i05` | Tenure system (one code covers 87%) ~ | 5 | 98% |
| `i06` | Type of ownership document ~ | 14 | 98% |
| `i08` | Right to sell (0/1, plus 98 = don’t know) ~ | 3 | 98% |
| `i10` | Right to bequeath (0/1, plus 98) ~ | 3 | 98% |
| `i12` | Perceived likelihood of involuntary loss of rights within 5 years ~ | 6 | 98% |

### 4.5 Institutional and county-level files

These are small (47–7,236 rows), so categorical use is mainly descriptive or as county-level covariates joined to households.

- **`Housing_Financiers_Data`** (351 rows): `se1` financier type (3 observed levels, one covers 86%), `se5a` days-past-due threshold for a non-performing loan (5 levels), `se12` main barrier to mortgage and construction lending (7 levels), `se16` main loan-recovery challenge (7 levels), `se13` and `se15` (3 levels), and the multi-select families `se2__[1-3]`, `se3a__*`, `se9__[1-5]`, `se11__*`, `se14__*`.
- **`Real_Estate_Dataset`**: `county_name` (15 counties), `ra2` (16 levels), `ra14` (12 levels), `rc2` (7 levels), `rc10a` (3 levels), and the amenity-style flags `ra7__[1-12]`, `rc3__[1-8]`. These sit inside one listing roster each, so group first.
- **`County_Physical_Planning_Data`**, **`NEMA_Data_Set`**, **`Water_Services_Providers_Data`**: almost entirely multi-select flag families (`cg2__*`, `cg6__*`, `cg9__*`, `cg13__*`, `cg25__*`; `nema4__*`, `nema5__*`, `nema8__*`, `nema9__*`; `wssp8__*`) plus `nema6` (licence time, 14 levels) and `cg3` (12 levels). They describe the planning, environmental-licensing and water-supply environment per county and are most useful as county covariates.
- **`KHS_Institutional_Data`**, **`Project Information`**, **`Type of Housing Units`**: `activity` (developer / contractor / agent type, 3 levels), `county_name` (17 counties), and project-level code columns `c3_14`–`c3_17`, `c3_24`, `c3_26a/b` (3 to 7 levels). Treat 32 projects and 29 establishments with unit types as exploratory only.

## 5. Weight columns

| File | Weight column | Stored as | Filled | Range | Sum | Use for |
|---|---|---|---:|---|---:|---|
| `Household_Information_Data` | **`hhweight`** | float64 | 100% | 24.9 – 8,162 (median 549; 1,270 distinct) | 13,886,126 | household-level estimates (households represented) |
| `Individual_Data` | **`inw`** | float32 | 100% | 8.4 – 10,608 (median 524; 27,691 distinct) | 51,525,584 | person-level estimates (population represented) |

- These are the only two weight columns in the 14 files; a name search for weight / expansion / factor / stratum / cluster terms found nothing else. `tag` (Household) and `dummy` (Individual) are constants, not weights.
- I identified `inw` as the individual weight from its name and its total (about 51.5 million, consistent with a national population), and `hhweight` from its name and total (about 13.9 million, consistent with the national household count). Neither is documented in the files, so confirm in the survey's Basic Report.
- `Dwelling_Units_Data` and `Land_Parcels_Data` have no weight of their own; bring in `hhweight` through `interview__key` (see the join map) when you need weighted dwelling or parcel estimates. Weights differ by residence stratum (mean household weight about 716 for `a07_1`=1 and 568 for `a07_1`=2).
- The institutional, financier, county, NEMA and WSSP files have **no weights** and look like census-style coverage of establishments, so analyse them unweighted.

## 6. Most complete columns that can serve as a target variable

**Screening rules:** at least 95% filled (so the target is observed for nearly every row, not just a skip-logic sub-group), more than one value, and, for class targets, no single level so dominant that the model learns nothing. Ranked by completeness, usable class balance and relevance to siting, infrastructure and housing allocation. Percentages below are shares of rows.

### 6.1 Classification targets (ranked)

| Rank | File | Target column | Task | Filled | Levels | Distribution (code: share) | Why it works / caveat |
|---:|---|---|---|---:|---:|---|---|
| 1 | `Dwelling_Units_Data.parquet` | `d12` | Tenure of the unit (owner / renter / rent-free / other) | 100% | 4 | 1: 66% / 2: 28% / 3: 5% / 4: 1% | Directly about housing allocation; verified against the tenant and owner modules. Level 4 is ~1%, so merge it with level 3. |
| 2 | `Dwelling_Units_Data.parquet` | `d03` | Dwelling type | 100% | 8 | 1: 54% / 4: 22% / 7: 12% / 2: 5% / 5: 5% | Clean multi-class target; the tail codes are rare, so group them. `d03_other` holds the text for “other”. |
| 3 | `Household_Information_Data.parquet` | `d19` | Perceived adequacy of the dwelling | 100% | 3 | 1: 52% / 2: 31% / 0: 17% | Subjective adequacy on three levels with a usable balance; the closest available outcome measure of housing adequacy. The barrier items `d20__*` appear to be asked only of the group rating the dwelling inadequate, so exclude them from the features (they would leak). |
| 4 | `Household_Information_Data.parquet` | `c01_1` | Main drinking-water source | 100% | 12 | 1: 27% / 10: 18% / 4: 12% / 9: 9% / 2: 7% | Infrastructure access with a spread across 12 levels; collapse into improved / unimproved for a binary version. |
| 5 | `Household_Information_Data.parquet` | `c04` | Toilet facility type | 100% | 14 | 7: 41% / 8: 20% / 6: 10% / 2: 9% / 13: 8% | Sanitation infrastructure; 14 levels, top four hold about 79%. |
| 6 | `Household_Information_Data.parquet` | `c10` | Main lighting energy | 100% | 13 | 1: 56% / 5: 32% / 4: 7% / 8: 3% / 11: 1% | One code covers 56%, the next 32%; works as a 3-class target after grouping the tail. |
| 7 | `Household_Information_Data.parquet` | `c11` | Main cooking energy | 100% | 15 | 9: 54% / 7: 25% / 11: 17% / 1: 1% / 8: 1% | 15 levels, top three about 96%; group the tail. |
| 8 | `Dwelling_Units_Data.parquet` | `d05` | Electricity in the unit (binary) | 100% | 2 | 1: 53% / 0: 47% | Best-balanced binary access target (about 53/47). |
| 9 | `Dwelling_Units_Data.parquet` | `d15` | Main wall material (housing quality) | 100% | 18 | 4: 23% / 12: 21% / 11: 20% / 16: 8% / 10: 6% | 18 levels, three of them around 20% each; quality proxy, group into finished / semi-finished / rudimentary. |
| 10 | `Dwelling_Units_Data.parquet` | `d14` | Main floor material | 100% | 10 | 8: 45% / 1: 33% / 7: 12% / 2: 9% / 9: 1% | Quality proxy; two codes cover 78%. |
| 11 | `Dwelling_Units_Data.parquet` | `d06` | Piped water in the unit (binary) | 100% | 2 | 0: 89% / 1: 11% | 89/11 imbalance: use class weights or resampling, and report PR-AUC / F1. |
| 12 | `Land_Parcels_Data.parquet` | `i06` | Type of land ownership document | 98% | 14 | 1: 62% / 14: 19% / 12: 7% / 11: 5% / 5: 2% | Tenure security target (14 levels, ~98% filled); one parcel per row, so remember the household clustering. |
| 13 | `Land_Parcels_Data.parquet` | `i08` | Right to sell the parcel (binary) | 98% | 3 | 1: 74% / 0: 26% / 98: 0% | 74/26 and 98% filled; 98 = “don’t know” is a negligible class and can be dropped. |
| 14 | `Individual_Data.parquet` | `ken_edu_isced11` | Education level | 100% | 15 | 3: 35% / 6: 24% / 16: 22% / 2: 5% / 7: 5% | 100% filled, 15 levels; a socio-economic outcome rather than a housing one. `any_disability` (93/7) is complete but imbalanced. |

### 6.2 Continuous targets

| File | Column | Meaning | Filled | Median | 1st–99th percentile | Caveat |
|---|---|---|---:|---:|---|---|
| `Household_Information_Data.parquet` | `c14_1` | Average monthly household expenditure (KSh) ~ | 100% | 10,000 | 98 – 60,000 | Complete, but right-skewed (max 800,000); model on the log scale and check zeros. This is the best affordability anchor available on every household. |
| `Dwelling_Units_Data.parquet` | `d11_1` | Floor area of the unit ~ | 100% | 60 | 7 – 1,200 | Complete, but `d11_2` (two levels, 77/23) looks like a measurement-unit flag, so confirm and convert before pooling; maximum 6,004 is an outlier. |
| `Household_Information_Data.parquet` | `g01a` | Distance to the first facility in the `g01a`–`g01k` block (metres, presumably) ~ | 100% | 700 | 20 – 6,000 | Eleven complete distance columns (schools, police, health, bus stop, market and others) are natural siting targets; heavy right tail (max 30,000). |

**Subgroup targets (not complete overall, so use only within the group that answers them):**

- `Household_Information_Data.k05` monthly rent, tenants only (32% filled; 6,932 households; median KSh 3,000), the cleanest rent-affordability target.
- `Household_Information_Data.l15` estimated monthly rental value and `l14` estimated sale value, owner-occupiers only (62% filled). `l14` runs from 0 to 1,000,000,000, so winsorize or use the log scale.
- `Real_Estate_Dataset.ra13` advertised price (89% of rows, 6,409 values, median KSh 17.5 million, maximum 729 million) and `rc10b` (81%): the listing rosters are stacked, so deduplicate to one row per listing first, and note that `rc10b` has one value (9,412,500) covering at least half of its filled rows, which looks like an imputed or defaulted figure.
- `Housing_Financiers_Data.se4a` (86% filled; values from 250,000 to 240 billion, so it is a monetary amount, not a percentage) and `Housing_Loans_Data` `se3b`/`se3c`/`se3d` (73–89% filled): small samples (351 and 946 rows) with extreme skew.

**Structural-missingness warning.** Many household columns are blank because the question was never asked (for example `k*` only for tenants, `l*` only for owners, `d20__*` only when the dwelling is rated inadequate). That is skip logic, not missing data: do not impute it, and do not treat the non-missing indicator as a feature when predicting the variable that controls the skip.

## 7. Data-quality notes to keep in mind

- **Special codes:** `96` = other (specify), `98`/`998` = don’t know, and `-1` appears in some numeric columns (for example `b09_3`, `b13_1`). Recode them to missing or their own class before modelling.
- **Empty or constant columns** carry no information. Examples: `dsb_aggregate_un` (no answers) in Individual_Data, `tag` and `internet` (constant) in Household_Information_Data. The per-file lists in §3 give the full set. Counts: Household_Information_Data: 5; Individual_Data: 6; Dwelling_Units_Data: 0; Land_Parcels_Data: 0; KHS_Institutional_Data: 36; Project Information: 51; Type of Housing Units: 0; Real_Estate_Dataset: 32; Housing_Financiers_Data: 0; Housing_Loans_Data: 1; Housing_Mortgage_Data: 0; County_Physical_Planning_Data: 8; NEMA_Data_Set: 3; Water_Services_Providers_Data: 21.
- **Sparse columns:** Real_Estate_Dataset has 144 of 300 columns under 5% filled, Project Information 28 of 211, and KHS_Institutional_Data 39 of 194, because each roster block only applies to some establishments.
- **Duplicates:** 112 fully duplicated rows in Dwelling_Units_Data (see §2).
- **Text columns** (`*_other`, `*other`) are free-text “other (specify)” answers, mostly empty; they are candidates for recoding rather than modelling.