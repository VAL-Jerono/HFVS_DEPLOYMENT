# Beyond the Levy: A Capacity-Aware Framework for Affordable Housing Allocation in Kenya


## Abstract

Kenya’s Affordable Housing Programme has generated substantial levy revenue and documented completed, commissioned and handed-over units, but the public evidence does not yet provide one reconciled chain connecting revenue collection to allocation, land readiness, construction, service connection, handover, occupation and sustained affordability. This proposal develops a transparent, evidence-reconciled and capacity-aware decision-support framework for allocating Affordable Housing Fund resources across Kenya’s 47 counties. The study proposes a secondary-data design organised through CRISP-DM. It will reconcile statutory, financial, audit and project records; measure household housing need and affordability using the 2023/24 Kenya Housing Survey; develop a spatially validated machine-learning model of housing vulnerability; benchmark county and project delivery readiness using transparent indicators and, where data are adequate, conditional data-envelopment analysis; and simulate deterministic, equity-constrained, robust and two-stage allocation scenarios using mixed-integer optimisation. The study will keep housing need, affordability, readiness, efficiency and equity analytically separate. It will evaluate predictive error, geographic generalisation, subgroup fairness, frontier sensitivity, scenario regret and consistency with independent project evidence. The anticipated contribution is not a legally binding beneficiary list or a causal claim that money or capacity is the observed bottleneck. It is a reproducible evidence register, a set of validated need and readiness measures, transparent allocation scenarios and an accountability framework showing what is known, estimated, benchmarked and simulated.

**Keywords:** affordable housing; Housing Levy; Kenya; CRISP-DM; machine learning; spatial validation; data-envelopment analysis; optimisation; housing affordability; public accountability.

## 1. Introduction

Adequate housing is both a basic human need and a condition for participating in social and economic life. Housing affects health, safety, education, employment access, household expenditure, tenure security and exposure to environmental risk. For this reason, the right to accessible and adequate housing is recognised in Article 43(1)(b) of the Constitution of Kenya, while Sustainable Development Goal 11.1 calls for access to adequate, safe and affordable housing for all. The policy challenge is not simply to construct more physical structures. It is to ensure that public resources are converted into housing that is appropriately located, serviced, affordable to the intended households, and capable of remaining occupied and maintained over time.[21] [22]

Governments have responded to housing shortages through a range of instruments, including direct construction, land development, subsidised finance, employer contributions, provident funds and earmarked housing levies. International evidence shows that a dedicated revenue stream can support large-scale housing delivery, but it does not guarantee equitable or efficient outcomes. Brazil’s experience with the National Housing Bank illustrates how substantial financial activity can coexist with a relatively limited share of low-income subsidised housing. Evidence on compulsory savings and housing funds also shows that benefits can be concentrated among formal workers when informal workers are not adequately incorporated into the financing and allocation system.[23] [24] The relevant policy question is therefore not only how much money a housing fund raises. It is how reliably the fund converts revenue into appropriate and occupied housing, for which households, in which places, and at what public cost.

This question is especially important in Sub-Saharan Africa. Rapid urbanisation, limited mortgage access, high land and infrastructure costs, insecure tenure, weak planning systems and constrained construction capacity mean that formal housing supply often fails to meet demand. Many households are housed through incremental self-construction, informal rental markets, community finance and other arrangements that are not captured by formal-unit targets. A public programme that counts only constructed units can therefore overlook overcrowding, poor services, insecure tenure, unaffordable rent, long commuting distances and the needs of households that cannot access formal ownership products.[25] [26]

Kenya’s housing programme must be understood within this wider housing system. The Affordable Housing Act, 2024 establishes an Affordable Housing Levy of 1.5 percent of gross income, with a matching employer contribution for employment income, and creates the Affordable Housing Fund and Affordable Housing Board. The legal framework provides for housing development, infrastructure, long-term financing, maintenance and county participation. The 2025 Regulations further establish procedures relating to applications, savings, eligibility, payment capacity, allocation, default and appeals.[27] [28] The programme is therefore not only a construction initiative. It is a national fiscal, institutional and allocation system operating through the interaction of the Kenya Revenue Authority, the National Treasury, the Affordable Housing Board, the State Department responsible for housing, county governments, contractors, developers, utilities, financiers and households.

The available evidence shows that the programme has generated both substantial revenue and completed or commissioned housing. The Auditor-General reported KSh 114.522 billion collected by the Kenya Revenue Authority between June 2023 and April 2025, of which KSh 111.316 billion was reported as remitted to programme accounts. That audit also recorded a large portfolio of projects at different implementation stages. Its April 2025 physical verification of the category it classified as 142 Affordable Housing Projects found 60 ongoing projects, 78 not started and four not independently verified. Those findings cannot be interpreted as evidence that no houses had been completed anywhere in the programme or in Mukuru; they describe the status of the audited category at a specific verification date.[29]

Subsequent official records confirm that some units were completed or handed over. The 2026 Budget Policy Statement reports 605 completed units in Bondeni, 1,080 in Mukuru, 110 in Homa Bay and 390 institutional units across various counties, producing an official subtotal of 2,185 units.[30] The Affordable Housing Board later reported that 4,536 studio apartments were delivered to new homeowners in Mukuru Phase II. It also reported the commissioning of 220 units at Emgwen, described as complete and ready for occupancy, and the commissioning of a 220-unit Vihiga Estate project.[31] [32] [33] These announcements support a reconciled official-claim subtotal of at least 6,081 units when the 1,080 Mukuru units already included in the Budget Statement are counted only once.

That subtotal must be interpreted carefully. It is not an independently audited national total of occupied homes. Official sources use different status terms, including completed, commissioned, ready for occupancy, delivered to new homeowners and keys issued. The Boma Yangu page for the broader Mukuru Met Site project still labels the 13,248-unit development as ongoing, suggesting that the AHB announcements refer to completed phases or call-offs within a larger estate. The Ministry portal also presents project categories such as active and ongoing alongside unit counts. The evidence therefore establishes that Kenya has completed and handed-over housing, but it does not yet provide one public, reconciled register connecting every project phase and contract call-off to completion certification, service readiness, keys issued, actual occupation, beneficiary identity and affordability.[34] [35]

The central business problem is consequently more precise than an alleged absence of completed houses. Kenya has a housing programme that is collecting revenue, constructing projects and handing over some units, but the public evidence does not yet show whether resources are being allocated in a transparent, needs-responsive and capacity-aware manner across the 47 counties. It is not possible to determine consistently whether a county’s poor output reflects inadequate funding, land and infrastructure constraints, procurement and contractor limitations, weak institutional coordination, unsuitable housing products, or an incomplete evidence record. Nor is it possible to establish from headline unit counts how many completed units are serviced, affordable to the intended households, occupied and sustained.

The 2023/24 Kenya Housing Survey creates an important basis for addressing this problem. The survey covered all 47 counties, sampled 25,900 households and completed 21,347 interviews. It provides information on tenure, crowding, dwelling quality, water, sanitation, energy, rent, land security, disability, household composition, employment and income.[36] These data can support a more grounded description of housing need and affordability, but they cannot by themselves identify programme beneficiaries, prove causal programme effects or measure project delivery capacity. They must therefore be linked carefully to legal, financial, administrative, project and audit records.

This study proposes a decision-support framework that keeps these questions separate before bringing them together for policy simulation. First, it will reconcile the available levy, Fund, project and completion records into a dated evidence register. Secondly, it will estimate household-level housing vulnerability and affordability using the Kenya Housing Survey, while recognising the survey’s sampling design and uncertainty. Thirdly, it will benchmark relative county and project delivery performance using comparable inputs and outputs, without treating a relative efficiency score as an absolute or causal measure of capacity. Finally, it will simulate alternative funding and unit-allocation scenarios under legal, budgetary, equity and delivery constraints. The intended contribution is not a single ranking of counties. It is a transparent framework that helps policymakers distinguish housing need from affordability, production feasibility from efficiency, and model-based allocation scenarios from observed causal effects.

## 2. Research Problem

Kenya’s Affordable Housing Programme has moved beyond the stage at which it can reasonably be described as producing no completed houses. Official records document at least 6,081 units as completed, commissioned, ready for occupancy or handed over, although the precise national total and the number actually occupied remain unreconciled. The existence of completed units does not, however, resolve the allocation problem. The central difficulty is that Kenya lacks a common, public and source-dated evidence chain linking levy assessment and collection to Fund receipt, allocation decision, county or project commitment, cash release, land readiness, procurement, construction, service connection, completion, beneficiary allocation, occupation, affordability and maintenance. The problem is therefore not merely how many houses have been built. It is whether public resources can be traced to the housing outcomes they were intended to produce.

**Firstly**, the financial and physical records are not consistently reconciled. The Kenya Revenue Authority, National Treasury, Affordable Housing Board, State Department and Auditor-General report different quantities for collection, remittance, investment, project activity, completion and construction progress. These differences may arise from different reporting dates, accounting scopes, project categories and status definitions, but the public record does not yet provide a reliable crosswalk between them. Consequently, a policymaker cannot determine for each county how much funding has been received, how much has been committed or spent, which projects it supports, and how many units have reached completion, handover or occupation. A headline national figure can therefore conceal both genuine delivery and unresolved reporting discrepancies.

**Secondly**, the current evidence does not adequately distinguish housing need, affordability and delivery capacity. A county may have severe overcrowding, poor structural conditions, inadequate water and sanitation, insecure tenure or high rent burdens but lack serviced land, infrastructure, project-management capacity or suitable financing arrangements. Another county may have strong construction capacity but lower housing need or housing products that are unaffordable to its intended population. Allocating resources using population, revenue contribution, project presence or unit targets alone cannot identify these differences. It may reward readiness without correcting underlying disadvantage, or allocate construction funds to sites that require land, infrastructure, upgrading, rental housing or technical assistance before units can be delivered.

**Thirdly**, household-level need is not systematically connected to county- and project-level delivery evidence. The Kenya Housing Survey can describe patterns of housing deprivation and affordability across households and counties, but it does not record every Affordable Housing Programme applicant, beneficiary, completion certificate or occupied unit. Conversely, project and audit records can describe construction activity and implementation risk, but they do not show whether completed units reach households with the greatest need or whether the selected housing products are financially sustainable. Without joining these evidence types carefully, Kenya cannot assess whether an allocation is both socially justified and operationally feasible.

**Fourthly**, the public record does not consistently distinguish a completed unit from a serviced, allocated, occupied and affordable home. A project may be commissioned while beneficiary allocation is incomplete. Keys may be issued while occupancy, defects or utility reliability remain uncertain. A unit may be physically complete but unaffordable after deposits, monthly payments, utilities, transport and maintenance are included. The official record is therefore strongest for some output claims and weaker for outcome claims. Treating all such claims as equivalent would overstate programme performance and would make it impossible to evaluate whether housing has improved household welfare.

**Fifthly**, no validated allocation framework currently combines housing need, affordability, delivery feasibility, equity safeguards and uncertainty for Kenya’s 47 counties. Existing discussions often move between poverty, legal eligibility, housing need, financial vulnerability, county readiness, production efficiency and allocation priority as though they were the same construct. They are not. Each requires a different definition, data source and validation strategy. A machine-learning model may estimate household vulnerability; it does not establish county construction capacity. A relative efficiency model may benchmark observed project portfolios; it does not prove why a project underperformed. An optimisation model may show the allocation produced by specified objectives and constraints; it does not establish that its binding constraint is the observed cause of a real-world delay.

**Finally**, the absence of a common allocation and accountability framework limits learning from the programme. When a project is delayed or a unit remains unoccupied, the current public evidence does not reliably show whether the cause was inadequate funding, land and title problems, infrastructure, procurement, contractor performance, affordability, beneficiary targeting, institutional coordination or data quality. Without that diagnosis, additional funding may be directed toward the wrong bottleneck. The research problem is therefore to develop and evaluate an evidence-first, county-sensitive decision-support framework that reconciles what is known, separates what must not be conflated, and simulates how resources could be allocated under explicit legal, financial, equity and delivery constraints.

## 3. Research Objectives

### 3.1 Main objective

To develop and evaluate a transparent, evidence-reconciled and capacity-aware decision-support framework for allocating Kenya’s Affordable Housing Fund resources across the 47 counties, while distinguishing household housing need and affordability from county and project delivery feasibility.

### 3.2 Specific objectives

1. **To establish a source-dated housing programme evidence register** by reconciling levy collection, Fund receipt, investment, county and project allocation, expenditure, land readiness, construction progress, completion, commissioning, handover and occupation records, while retaining unresolved discrepancies rather than averaging them away.

2. **To measure household housing need and affordability** using the 2023/24 Kenya Housing Survey, with indicators covering dwelling quality, overcrowding, tenure security, water and sanitation, rent or housing-cost burden, household resources and vulnerability, while accounting for the survey’s complex sampling design and estimation uncertainty.

3. **To develop a validated household-level housing vulnerability model** that estimates the distribution of housing-related financial and material vulnerability across counties and tests how well the estimates generalise across geographic areas not used for model training.

4. **To construct a county- and project-level delivery-capacity benchmark** using comparable land, infrastructure, procurement, financial, construction and implementation indicators, and to report relative efficiency and uncertainty without interpreting the results as absolute capacity ceilings or causal explanations.

5. **To formulate constrained allocation scenarios** that distribute available Affordable Housing Fund resources and housing-unit targets across counties under statutory, budgetary, equity, affordability, readiness and delivery-capacity constraints.

6. **To evaluate the stability, fairness and policy usefulness of the allocation scenarios** by testing alternative definitions, weights, missing-data treatments, cost assumptions and capacity specifications, and by comparing model outputs with independent project or case-study evidence.

## 4. Research Questions

### 4.1 Main research question

How can Kenya allocate Affordable Housing Fund resources across its 47 counties in a way that is transparent, responsive to household housing need, sensitive to affordability and delivery capacity, and auditable from revenue collection to occupied housing?

### 4.2 Specific research questions

1. What does the available official evidence show about the movement of Affordable Housing resources from levy collection and Fund receipt through allocation, project implementation, completion, commissioning, handover and occupation, and where do material discrepancies remain?

2. How is housing need and affordability distributed across Kenya’s 47 counties when measured through dwelling quality, overcrowding, tenure security, water and sanitation, housing-cost burden, household resources and vulnerability in the 2023/24 Kenya Housing Survey?

3. How accurately and fairly can household housing vulnerability be estimated from the Kenya Housing Survey, and how does model performance change when validation is designed to test generalisation across counties rather than relying only on random household splits?

4. Which land, infrastructure, procurement, finance, construction and governance indicators are associated with relative housing-delivery performance across counties and projects, and how sensitive are the resulting benchmarks to the selected inputs, outputs and environmental conditions?

5. How do alternative allocation rules—such as population-based, need-based, affordability-based, readiness-based, need-plus-capacity, staged and robust allocation—change the distribution of resources and units across counties?

6. Which allocation results remain stable across plausible assumptions about budget size, construction cost, capacity, housing-product mix, missing data and equity weights, and which results are artefacts of one model specification?

7. To what extent do the allocation scenarios correspond to independently documented project completion, handover, service-readiness or occupancy outcomes, and what additional data would be required to make a causal claim about whether revenue or delivery capacity is the binding constraint?

## 5. Significance and Justification

### 5.1 Policy significance

This study is significant because Kenya has already created the financial and institutional architecture for a large national housing programme, yet the public evidence does not provide a sufficiently integrated basis for deciding where additional resources should go or what form those resources should take. The study will not treat the presence of completed units as evidence that the programme has solved housing need. Instead, it will establish how far the programme can currently be traced from revenue to physical output and where evidence breaks down between completion, handover, occupation and affordability. This distinction is essential for responsible public reporting and for deciding whether a county requires construction finance, serviced land, infrastructure, technical support, rental housing, upgrading, incremental finance or a different housing product.

The study will also support more credible national and county planning. A transparent allocation framework can show how alternative rules affect counties and population groups before resources are committed. It can identify whether a proposed allocation favours counties that are already administratively ready, whether it excludes informal-sector households, whether it produces a concentration of units in high-demand areas, and whether it directs construction resources to projects that are unlikely to become occupied and affordable homes. The framework will therefore support deliberation rather than replace policy judgement.

### 5.2 Scientific and methodological significance

The scientific contribution lies in connecting three analytical tasks that are often conducted separately. The first task is measuring household housing need and affordability. The second is benchmarking relative delivery performance. The third is simulating constrained public-resource allocation. The study will connect these tasks only after defining their boundaries and documenting the assumptions that link them. This is important because a vulnerability prediction is not a capacity measure, an efficiency score is not a causal explanation, and an optimisation result is not an observed policy effect.

The study will also contribute a reconciliation-first approach to public-sector data science. Rather than treating administrative records as a clean outcome variable, it will preserve source, date, scope and status definition for each figure. This approach is particularly important in Kenya’s housing programme because official sources document completed, commissioned, ongoing and planned projects through different systems. A reproducible evidence register will make it possible to distinguish a genuine programme discrepancy from a difference caused by reporting period, project scope or terminology.

### 5.3 Social and equity significance

The study is socially significant because the households most affected by inadequate housing are not necessarily the households most able to access formal ownership products. A housing allocation rule that relies only on formal income, savings, mortgage eligibility or documented title may exclude informal workers, tenants, people living in informal settlements, persons with disabilities and households facing severe overcrowding or service deprivation. Measuring need and affordability separately can expose these risks and allow the policy simulation to compare ownership, rental, upgrading, incremental and infrastructure-support options rather than assuming that one product is suitable for every household.

The study will also make distributional consequences visible. It will report how alternative allocation scenarios affect counties and relevant household groups, including differences between urban and rural settings and between households with different tenure, income, disability and housing-quality characteristics. This is more informative than reporting only a national unit total or a county ranking.

### 5.4 Institutional and accountability significance

The framework will be useful to the State Department for Housing and Urban Development, the Affordable Housing Board, the National Treasury, county governments, the National Construction Authority, public auditors and other institutions involved in housing delivery. Its value will lie in enabling each institution to see what evidence supports a decision, what remains uncertain, and what corrective action follows from a weak result. For example, a low-readiness score caused by unresolved land documentation should trigger a different intervention from a low affordability score or a construction-productivity problem.

The study will also strengthen accountability by specifying the minimum data required to trace public funds to housing outcomes. These data include project and phase identifiers, county and site, planned and certified completed units, service readiness, cash releases, contract variations, keys issued, allocations, occupancy, beneficiary characteristics and maintenance status. The study does not assume that a model can replace statutory oversight. Its purpose is to make the evidence used in planning, allocation and review more coherent, visible and reproducible.

### 5.5 Justification for the proposed analytical approach

A purely descriptive review is necessary but insufficient. It can show that official sources report different figures and that projects occupy different implementation stages, but it cannot compare household need across counties, assess relative delivery conditions or simulate the consequences of alternative allocation rules. A purely predictive model is also insufficient because predicting household vulnerability does not reveal whether a county can convert funding into housing. A purely efficiency-based model is insufficient because relative production performance does not measure social need and can penalise counties facing structural land or infrastructure constraints. An optimisation model without validated need and capacity inputs would merely produce precise allocations from uncertain or inappropriate data.

The proposed combination is justified because each component addresses a different part of the decision problem. The evidence register establishes what is observed and what remains unresolved. The household model estimates need and affordability with survey-weighted and geographically aware validation. The capacity benchmark provides a relative diagnostic of delivery conditions rather than an unsupported causal claim. The optimisation model then makes the policy trade-offs explicit by showing how resources and units would be distributed under stated legal, budgetary, equity and feasibility constraints. Evaluation across alternative specifications will show which conclusions are robust and which depend on contestable assumptions.

The framework is therefore justified not because it promises a single mathematically optimal answer, but because it can make Kenya’s housing choices more explicit, testable and accountable. Its most important output will be a decision-support system that distinguishes what the evidence demonstrates from what the model estimates, what the policy scenario assumes from what the administrative record observes, and what has been physically completed from what has become an occupied and affordable home.


## 6. Literature Review

### 6.1 Review orientation and selection standard

This review treats affordable housing as a **linked allocation-and-delivery system**, not as a construction-counting exercise. The relevant evidence must therefore cover housing need, affordability, land and infrastructure, housing finance, institutional delivery, participation, predictive targeting, subnational efficiency and constrained resource allocation. The review is global in scope but is interpreted for Kenya’s Affordable Housing Programme (AHP), whose statutory architecture combines a national levy and Fund with county participation, public land, private and public delivery actors, digital applications and housing products intended for households with different income and tenure positions.

The scientific review prioritises peer-reviewed or scholarly journal literature published between 2020 and 2025. **Fifteen scientific sources are discussed below, and each DOI has been verified through DOI resolution and Crossref and/or publisher metadata.** Official legislation, audits, surveys and programme portals are included where they establish Kenya-specific facts, but they are not presented as scientific DOI sources. Business Africa and other non-peer-reviewed commentary are excluded from the scientific evidence base.

The review asks four questions of each source. First, what problem did the source address? Secondly, what method did it use? Thirdly, what did it find, and what was its policy or scientific impact? Fourthly, what has this study already done, how will the proposed Kenya study use the concept, and what additional contribution will it make? This final distinction is important: the proposed study should not claim to reproduce work that has already been done elsewhere.

### 6.2 Housing supply, land, infrastructure and spatial affordability

#### 6.2.1 Housing policy and affordability are institutional problems

Agayi and Karakayacı (2020) examine changing housing policies and housing affordability and accessibility in Kenya.[1] Their problem is that housing remains unaffordable and inaccessible despite repeated government interventions. Their method is a policy and literature review rather than a causal evaluation. The source retrieves the interaction of rural–urban migration, housing finance, land tenure, policy design and institutional implementation. Its central contribution is to show that affordability cannot be reduced to the number of structures constructed or to a single price-to-income ratio.

What has already been done is a conceptual diagnosis of Kenya’s housing-policy failure. The post-2024 Kenyan context now provides a statutory Fund, Board, county committees, housing products and administrative regulations, but the public record does not yet provide a reproducible county allocation formula or an allocation-to-occupation ledger. This study will use the source to define affordability, accessibility, land readiness and institutional capacity as separate constructs. Its extra contribution will be to convert the institutional diagnosis into a versioned county/project data model and a transparent comparison of allocation rules for the post-2024 programme.

#### 6.2.2 Land tenure changes both housing supply and welfare

Bird and Venables (2020) study land tenure and land use in Kampala using a quantitative spatial model.[2] The problem is that tenure institutions influence where housing is built, how informality develops and how urban welfare is distributed. The method models spatial equilibrium and simulates a counterfactual shift from mailo tenure towards leasehold. The reported counterfactual produces aggregate real-income gains of approximately 2–6.7%, but this is a modelled scenario rather than an observed reform effect.

The source demonstrates that tenure is not merely a legal-document variable. It changes land-use decisions, the location of housing and the welfare consequences of urban development. The proposed Kenya study will use this insight by coding registered title, allotment, official searches, community or public land, recognised occupancy, encumbrances, disputes, regularisation time and serviceability. It will not assume that formal title automatically produces affordability. The extra contribution will be to test whether an allocation rule systematically favours sites with clear title and therefore rewards readiness while underinvesting in high-need, low-readiness counties. Such counties should not simply be excluded; they should be identified for a separate capacity-building or land-readiness pathway.

#### 6.2.3 Physical infrastructure can be mapped, but cannot determine eligibility

Bettencourt and Marchio (2025) address the difficulty of measuring infrastructure deficits and informal settlements across Sub-Saharan Africa.[3] Their method analyses approximately 9.8 million blocks and more than 415 million building footprints across 50 countries and 2,190 urban areas, combining building, street-network, population and social indicators. The study shows that street-block-scale analysis can identify infrastructure deficits and settlement informality at a continental scale. It also warns that street accessibility is a physical proxy, not a legal definition of informality.

The work has already established a scalable geospatial screening method. The proposed study will use analogous indicators for road access, service proximity, built-up context, hazard exposure and employment access where data permit. Its extra sauce is the explicit separation between **site readiness** and **household eligibility**. Remote sensing can help identify whether a site is connected, dense, accessible or exposed to hazard; it cannot determine tenure, consent, income, household need or lawful beneficiary status. Geospatial variables will therefore inform a readiness and access layer, not replace survey or administrative evidence.

### 6.3 Housing finance and the meaning of affordability

#### 6.3.1 Housing finance is not automatically inclusive

Nguena, Tchana Tchana and Zeufack (2021) examine housing finance and inclusive growth across 48 Sub-Saharan African countries.[4] Their panel analysis studies relationships among housing-finance development, growth and inequality. The study reports that housing finance is not necessarily inequality-reducing at early stages of financial development and identifies a possible threshold above which distributional effects may improve. Its impact is to caution against treating a larger mortgage or levy-finance market as evidence that low-income or informal households benefit.

The proposed study will use the source to separate contributors from beneficiaries and finance depth from finance access. It will analyse whether households with irregular income, informal employment, limited documentation, disability or insecure tenure can access the housing products being funded. The extra contribution is a Kenya-specific distributional audit of a statutory levy: who contributes, who applies, who qualifies, who receives, who occupies and who bears the repayment or housing-cost burden.

#### 6.3.2 A nominally affordable unit may remain unaffordable

Uwayezu and de Vries (2020) evaluate affordable housing in Kigali through sale prices, household incomes and a 30% affordability standard.[5] Their problem is whether units labelled affordable are affordable to intended low-income households. Their method uses price-to-income analysis and affordability thresholds. They find that scheme units are seriously or severely unaffordable for many target beneficiaries, particularly the lowest-income households. They discuss upgrading, affordable rental, rent-to-own, incremental construction, local materials and tax measures as alternative policy responses.

The study has already demonstrated the gap between a programme label and a household affordability outcome. Kenya’s Act and Regulations use a 30% income rule and payment-capacity assessment, but the public evidence does not yet establish affordability after utilities, service charges, transport, maintenance, deposits, irregular income and essential non-housing expenditure. The proposed study will calculate a statutory housing-cost ratio and a residual-income measure:

\[
HCB_i = \frac{C_i}{M_i},
\]

where \(C_i\) is the household’s total monthly housing cost and \(M_i\) is monthly income or a validated income proxy. It will also estimate residual resources:

\[
RI_i = Y_i - C_i - E_i,
\]

where \(Y_i\) is household resources and \(E_i\) is essential non-housing expenditure. The extra contribution is to compare allocations under the statutory 30% rule, residual-income adequacy and stress scenarios for income and cost escalation.

#### 6.3.3 Incremental and cooperative housing can scale while producing exclusion

Smith, Brown and Owen (2024) compare low-income housing delivery in Kenya and the Philippines.[4] Their mixed-method case study uses beneficiary, construction-worker and supplier surveys, key-informant interviews, project evidence, SPSS and NVivo. The Kenyan case is linked to cooperative and SACCO-based delivery. The authors report that the Kenyan model enabled larger-scale delivery but offered beneficiaries limited direct control over design and construction. It also produced tensions around unit selection, service delays, dissatisfaction and mixed livelihood outcomes after relocation.

This source has already documented the social and livelihood consequences of scaling one Kenya-linked delivery model. It is not an evaluation of the national AHP levy. The proposed study will use its indicators for participation, relocation, service quality, travel-to-work burden, livelihood disruption, cooperative governance and beneficiary satisfaction. Its extra contribution will be a nationally structured equity audit that tests whether completed units remain affordable, serviced and occupied without imposing unmeasured displacement or livelihood harm.

### 6.4 Participation, governance and programme learning

#### 6.4.1 Participation is not equivalent to attendance

Wainaina, Truffer and Lüthi (2022) analyse participation across fifteen Kenyan informal settlements.[5] Their problem is how state, programme, professional and community institutional logics shape participation in upgrading. The comparative qualitative method examines the interaction among these logics and the conditions under which participation occurs. The result is that participation is shaped by actor identity, rules of engagement and implementation context. A meeting or committee is not evidence that residents influenced the decision.

The proposed study will retrieve a process-based participation construct: who participated, what was proposed, what was accepted or rejected, why, and whether the decision was followed up. Its extra contribution is to turn participation from a binary compliance field into an auditable influence and inclusion measure that can be compared across projects and county types.

#### 6.4.2 Large programmes need organisational learning, not only expenditure

Wainaina, Truffer, Lüthi and Mang’ira (2023) study organisational learning in the Kenya Informal Settlement Improvement Programme from 2011 to 2020.[4] Their method examines coordination, communication, information synthesis, incentives and programme management. They find that participation, coordination and communication are necessary but insufficient. Growing numbers of actors, deteriorating commitment, inequitable incentives and inadequate learning tools constrained programme success.

The study has already identified a mechanism through which a national programme may generate activities without producing consistent local outcomes. The proposed study will use variables such as approval dates, procurement stages, contractor history, variation orders, utility dependencies, reporting timeliness, audit findings and corrective-action closure. The extra contribution is to add organisational readiness and learning to an allocation model while avoiding the assumption that higher expenditure equals better delivery.

#### 6.4.4 Housing outcomes require a theory of change

Mvuyana (2023) applies Theory of Change to monitoring and evaluation of sustainable human settlements in South Africa.[9] The case study combines policy and municipal documents with interviews with seven officials. It finds that a focus on unit numbers can obscure deficiencies in services, mobility, livelihoods, institutional capacity and long-term settlement outcomes. The study argues that a Theory of Change can make assumptions and causal pathways explicit, but that monitoring alone cannot compensate for weak planning, financial management or implementation capacity.

The proposed study will use Theory of Change to connect levy and Fund resources to land readiness, procurement, construction, services, allocation, occupation, affordability, livelihood and maintenance. The extra contribution is to triangulate officials’ accounts with administrative, audit, survey and beneficiary evidence and to build a finding-to-action closure matrix rather than treating a monitoring framework as proof of impact.

### 6.5 Targeting and machine learning for allocation

Aiken and colleagues (2022) test whether mobile-phone data and machine learning can improve humanitarian targeting.[10] They train gradient-boosting models on survey and phone data and compare geographic targeting, phone-based prediction and a hypothetical comprehensive social registry. The phone-based method produces fewer exclusion errors than the geographic methods considered, but more exclusion errors than the hypothetical registry. The study’s impact is therefore two-sided: machine learning can supplement weak administrative data, but it is not ground truth and introduces privacy, re-identification and fairness risks.

The proposed study will use this work to define prediction as decision support rather than automatic eligibility determination. It will compare transparent baselines with gradient-boosted models, report calibration and subgroup errors, preserve reason codes, use spatial and county-aware validation, and require human review and appeal for any eventual administrative use. The extra contribution is to apply these safeguards to housing need and affordability in Kenya while separating predictive vulnerability from legal eligibility and allocation authority.

### 6.6 Subnational efficiency and optimisation under uncertainty

Thapa and colleagues (2024) provide a Kenyan precedent for evaluating targeted intergovernmental transfers.[11] Their county-year difference-in-differences design compares fourteen marginalised counties receiving targeted transfers with thirty-three comparison counties over 2006–2019. They report a reduction in diarrhoea incidence but no detected effect on HIV incidence. The source demonstrates both the feasibility and limits of county-panel causal analysis: effects vary by outcome and mechanism.

The proposed study will use the design as a warning against causal overclaiming. It will attempt quasi-experimental analysis only if treatment timing, comparison groups, pre-trends and outcomes are defensible. Otherwise, it will report descriptive allocation alignment and policy simulation rather than programme impact.

Li and Grossmann (2021) review two-stage and multistage stochastic programming, scenario trees, non-anticipativity, chance constraints and risk-sensitive optimisation.[12] Their contribution is methodological: decisions can be made before uncertainty resolves and revised through recourse after new information arrives. The proposed Kenya model will use this structure for volatile levy receipts, construction costs, land clearance, utility connection, contractor performance, applicant demand and occupancy. The extra contribution is to compare a transparent deterministic allocation with robust or two-stage scenarios and report downside risk, unspent funds, delayed units, high-need households forgone and the price of robustness.

### 6.7 Spatial validation and model-transfer risk

Wang, Khodadadzadeh and Zurita-Milla (2023) propose Spatial+ cross-validation for geospatial machine learning.[15] Their problem is that random folds can place geographically close or feature-similar observations in both training and test sets, overstating generalisation. Their method combines spatial blocking with clustering of locations, covariates and target values, and compares random, block and Spatial+ folds in two experiments. Spatial+ was closer to reference prediction error than random validation. The proposed study will use this principle to compare random, county-blocked, buffered and feature-aware validation for household vulnerability. Its extra contribution is to test the issue on a socially consequential Kenyan housing target and to report how much the apparent model performance changes when predictions are made for new counties or communities.

### 6.8 Singapore as an institutional benchmark, not a template

Singapore provides a useful comparator for integrated public-housing allocation, but it is not directly transferable to Kenya. Tan (2023) uses census and transaction data to examine Singapore’s Ethnic Integration Policy and finds that ethnic and socio-economic segregation can move in opposite directions.[13] Ti and See (2024) compare Singapore and England and argue that Singapore’s policy is administratively feasible partly because the state retains strong control over leasehold public housing.[14] These works show that allocation must be assessed across ethnicity, income, location, tenure and resale effects, and that rules depend on land control, institutional capacity and enforceability.

The proposed study will retrieve three lessons. First, a policy can reduce one form of segregation while reproducing another. Secondly, formal quotas or priorities require administrative systems capable of enforcing them fairly. Thirdly, allocation rules can produce unintended resale and access effects. The extra contribution is a Kenyan transferability test: a national levy operating through constitutional counties, multiple land regimes, private contractors and a large informal labour market cannot simply import Singapore’s institutional model. The transferable lesson is narrower: integrate finance, land, construction, allocation, occupation and maintenance into one accountable information chain.

### 6.9 Synthesis and scientific gap

The literature establishes five gaps.

**First, a data gap remains.** No reviewed source provides a public, source-dated panel linking levy assessment and collection to Fund receipt, county allocation, project land readiness, procurement, construction milestones, completion, service connection, handover, occupation, affordability, maintenance and audit closure. The study will create a versioned crosswalk among Fund transactions, counties, projects, sites, units, applicants and beneficiaries.

**Secondly, a construct gap remains.** Need, affordability, payment capacity, delivery readiness, efficiency and equity are often conflated. The study will keep them separate. Need will describe deprivation and vulnerability. Affordability will describe sustainable total housing cost after essential non-housing expenditure. Readiness will describe the ability to convert resources into a legally usable and serviced project. Efficiency will be a conditional relative benchmark. Equity will describe who receives benefits and bears costs.

**Thirdly, a methodological gap remains.** Existing studies usually stop at one stage: a vulnerability score, an efficiency benchmark, a project case study or an optimisation model. The proposed study will chain evidence reconciliation, household need and affordability estimation, delivery-readiness benchmarking and constrained allocation, while preserving the limits of each method.

**Fourthly, an accountability gap remains.** The literature and official evidence do not yet show a public versioned allocation formula, complete decision logs, participation influence, subgroup error rates, appeal outcomes or audit-finding closure for Kenya’s AHP. The study will treat governance as data and include decision-maker, rule, evidence, participation, grievance and corrective-action fields.

**Fifthly, a transferability gap remains.** Singapore, Kigali, Kampala, Nairobi, Ethiopia and South Africa demonstrate different institutional arrangements. None can be imported wholesale. The proposed study will compare modular mechanisms and test them against Kenyan county types rather than assuming that a successful instrument elsewhere will work under Kenya’s land, finance, devolution and informality conditions.

The researchable lines therefore include: a public allocation-to-outcome data architecture; housing-sensitive vulnerability prediction; residual-income affordability; tenure- and infrastructure-aware readiness; conditional efficiency benchmarking; robust and two-stage allocation; participatory and governance auditing; subgroup fairness; occupation and maintenance outcomes; and, if a defensible panel becomes available, causal evaluation of phased or targeted delivery. This study will pursue the integrated, evidence-first line because it addresses the decision problem most directly: **given a finite and uncertain Fund envelope, which counties and projects should be prioritised, under what conditions, and how can the public verify that allocation produces affordable, serviced, occupied and equitable housing?**

### 6.9 Summary of the literature review

The literature does not support the claim that Kenya’s housing problem is simply a shortage of completed structures. It shows instead that housing outcomes are produced by the interaction of land tenure, planning, infrastructure, finance, affordability, institutional coordination, participation, targeting and governance. International experience demonstrates that compulsory finance may fail to reach low-income households, nominally affordable units may remain unaffordable, public housing may reduce one form of segregation while reproducing another, and construction scale may coexist with weak administration or poor livelihood outcomes.

The remaining gap is an auditable, Kenya-specific framework that connects household need to delivery readiness and then to transparent resource allocation. This study addresses that gap through a reconciled evidence register, survey-weighted housing-vulnerability and affordability analysis, spatially aware validation, county/project readiness benchmarking, constrained allocation scenarios and explicit equity and governance diagnostics. It will report what is observed, what is predicted, what is benchmarked and what is simulated; it will not present a model-implied constraint as a proven causal bottleneck.

## 7. Methodology

### 7.1 Overall approach

This study proposes a secondary-data, mixed-methods decision-support design organised through the **Cross-Industry Standard Process for Data Mining (CRISP-DM)**. CRISP-DM is appropriate because the study is not only a modelling exercise. It must first define the policy decision, establish what the available evidence can support, reconcile incompatible administrative records, prepare a defensible analytical dataset, develop linked predictive and optimisation models, evaluate their performance and limitations, and specify how validated results could be used without exposing household data or turning a model into an automatic legal decision-maker.

The proposed design is sequential but iterative. The Business Understanding stage defines the decision and constructs. Data Collection and Data Understanding establish provenance and coverage. Data Cleaning creates a versioned analytical ledger. Modelling estimates household vulnerability and affordability, benchmarks readiness and delivery conditions, and simulates allocations. Evaluation tests predictive performance, frontier sensitivity, optimisation robustness, fairness and external consistency. Deployment specifies a conceptual, versioned decision-support workflow for authorised institutional use. No live deployment link is part of this proposal.

![Proposed CRISP-DM workflow for the Kenya housing-allocation study](https://private-us-east-1.manuscdn.com/sessionFile/aPs5I6t4RxOijgPpap33l3/sandbox/DDLnVb9FesQtdQ9mWstHP9-images_1789664193870_na1fn_L2hvbWUvdWJ1bnR1L2NyaXNwLWRtLWhvdXNpbmctd29ya2Zsb3c.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvYVBzNUk2dDRSeE9pamdQcGFwMzNsMy9zYW5kYm94L0RETG5WYjlGZXNRdGRROW1Xc3RIUDktaW1hZ2VzXzE3ODk2NjQxOTM4NzBfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyTnlhWE53TFdSdExXaHZkWE5wYm1jdGQyOXlhMlpzYjNjLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5MjAyMjQwMH19fV19&Key-Pair-Id=K2QY5QTL8JSY6C&Signature=MEYCIQD-V69yhw1kA38fpCi56016aLoLfBcpsSkPhKd~D-xFPwIhAOE6yi2z7C~jAOIM2eifVjlQDH3qlQpFYHyUasoxCxvt)

**Figure 1.** Proposed CRISP-DM workflow. The feedback arrow indicates that evaluation findings, corrected records and appeals inform the next version of the evidence base; it does not imply automatic model retraining or automatic eligibility decisions.

### 7.2 CRISP-DM stages and the questions they answer

| CRISP-DM stage | Question answered | Proposed output |
|---|---|---|
| Business Understanding | What decision must be improved, for whom, and what would count as a defensible housing outcome? | Problem definition, constructs, objectives, constraints, risks and success criteria |
| Data Understanding | What evidence exists, at what unit, with what coverage, date, status definition and uncertainty? | Data inventory, provenance register, missingness map and source-reconciliation plan |
| Data Collection | Which secondary sources will be assembled and how will they be legally and technically linked? | Numbered source register, data dictionary, identifier crosswalk and acquisition log |
| Data Cleaning and Preparation | Can records be made comparable without silently changing their meaning? | Clean survey file, project/fund-flow ledger, status taxonomy and analytical panels |
| Modelling | What are household need and affordability, what is relative delivery readiness, and what allocation follows under explicit assumptions? | Calibrated ML model, county indicators, readiness benchmark and allocation scenarios |
| Performance Evaluation | Are the estimates accurate, geographically transferable, fair, stable and policy-relevant? | Error, calibration, sensitivity, fairness, robustness and external-consistency report |
| Deployment | How could authorised users inspect evidence, assumptions, scenarios and appeals without automating legal eligibility? | Versioned decision-support design, model card, audit log, access controls and review protocol |

### 7.3 Business Understanding

The business problem is to improve the transparency and defensibility of allocating Affordable Housing Fund resources when housing need, affordability and delivery readiness differ across counties and projects. A high-need location may lack serviced land or implementation capacity. A high-readiness location may be easier to build in but may not contain the households facing the greatest deprivation. A completed unit may still be unaffordable, unoccupied, poorly serviced or associated with livelihood loss. The model must therefore preserve these distinctions.

Potentially useful variables fall into five groups. **Need variables** include overcrowding, structural condition, tenure insecurity, water and sanitation, energy, disability access, rent burden and household composition. **Affordability variables** include income or validated income proxies, rent or mortgage payment, deposits, interest, tenor, utilities, service charges, transport and essential non-housing expenditure. **Readiness variables** include land documents, disputes, approvals, compensation, utility connections, procurement stage, contractor history, professional capacity and reporting quality. **Delivery variables** include planned, budgeted, committed, contracted, paid, ongoing, practically complete, serviced, handed over, occupied and maintained units. **Equity and governance variables** include gender, disability, age, documentation, tenure, informal-sector status, participation, grievances, appeals, audit findings and corrective-action closure.

The study will not collapse these variables into one unexamined score. It will first report separate indicators and then use an allocation model in which need, affordability, readiness, equity and budget constraints have visible roles. The first business deliverable will therefore be a source-dated reconciliation register, not a county ranking.

### 7.4 Data Collection: secondary data sources

No new household survey is proposed. The research will use secondary data, subject to data-access, ethical and licensing conditions. The principal sources are listed below.

| No. | Secondary data source | Type of data | Unit and likely period | Proposed use |
|---:|---|---|---|---|
| 1 | Kenya Housing Survey 2023/24, Kenya National Bureau of Statistics | Complex-sample household microdata | Household; 2023/24 | Need, housing conditions, affordability, tenure, services, household composition and weighted county estimates |
| 2 | Affordable Housing Act, 2024 | Statutory/legal text | National legal regime; 2024 | Levy parameters, Fund functions, Board powers, county participation and legal constraints |
| 3 | Affordable Housing Regulations, 2025 | Subsidiary regulation | National administrative regime; 2025 | Eligibility, applications, payment capacity, deposit, allocation, default and appeal procedures |
| 4 | Kenya Revenue Authority reports | Administrative financial records | Levy assessment, collection and remittance; reporting periods to be reconciled | Revenue inflow and Fund-flow reconciliation |
| 5 | National Treasury and Public Finance Management records | Budget and expenditure records | Fund, programme, county and project level where available | Allocations, releases, commitments, expenditure and budget constraints |
| 6 | Affordable Housing Board project and programme records | Administrative/project records | Project, site, phase and unit; versioned reporting dates | Project status, planned units, construction milestones, commissioning and handover |
| 7 | Auditor-General special audit and other audit reports | Audited institutional and project evidence | Project portfolio and audit date | Independent verification, status definitions, findings and corrective-action tracking |
| 8 | Controller of Budget county reports | County budget execution records | County-year and programme level | County fiscal context, absorption, releases and devolved implementation capacity |
| 9 | Boma Yangu public portal and documented snapshots | Administrative/public digital records | Applicants, projects, categories and published statuses | Publicly observable rules, project information and change-over-time documentation; not treated as a complete beneficiary register |
| 10 | KNBS census, poverty and labour-market statistics | Census and socioeconomic aggregates | County, subcounty, settlement and household-related aggregates | Context variables, poverty, population, labour and urban/rural stratification |
| 11 | Public land, planning, road, utility and hazard geospatial data | Spatial and remote-sensing data | Site, raster, road, settlement or administrative unit | Accessibility, service proximity, density, hazard exposure and site-readiness proxies |
| 12 | National Construction Authority and professional-registration records, where accessible | Administrative capacity records | Contractor, professional and county/project level | Contractor and built-environment capacity proxies, subject to coverage and licensing constraints |
| 13 | Project contracts, procurement notices, variation orders and completion certificates, where accessible | Administrative/project documentation | Contract, site, project phase and date | Procurement duration, contract changes, completion verification and delivery risk |
| 14 | Beneficiary, applicant, grievance and occupancy records, where legally accessible | Administrative outcome records | Applicant, household, unit and project | Allocation incidence, appeals, handover, occupation, affordability and post-occupation validation |
| 15 | Structured case-study documents and interviews, if approved | Qualitative secondary and/or limited primary institutional evidence | Selected project/county cases | Process tracing, participation, governance, implementation and interpretation of model results |

Each record will receive a provenance identifier, reporting date, source institution, document or table reference, unit of analysis, status definition and access condition. No figure labelled “completed” will be merged with “commissioned,” “handed over,” “serviced,” or “occupied” without preserving the original label.

### 7.5 Data understanding and exploratory analysis

The study will first construct a data inventory and a source-to-construct matrix. For the Kenya Housing Survey, exploratory data analysis (EDA) will examine distributions, missingness, outliers, sampling weights, county coverage and urban/rural differences. Planned comparisons include: income or income-proxy category against housing-cost burden; tenure status against structural quality; household size against persons per room; rent or mortgage payment against income; disability status against service access and tenure; gender of household head against affordability and dwelling condition; urban/rural status against water, sanitation and travel burden; and county against each housing-need domain.

For the project and fund-flow data, EDA will compare reported levy receipts against remittances, allocations, commitments, payments and project status by reporting period. Project timelines will be compared across land readiness, procurement duration, contract variation, utility dependency, contractor history and physical progress. The analysis will distinguish planned units from contracted units, practically complete units, serviced units, handed-over units and occupied units.

For geospatial data, EDA will examine site distance to roads, water, sanitation, electricity, employment centres and public transport; settlement density against service access; hazard exposure against site location; and travel burden against housing cost. These are exploratory and decision-support relationships, not automatic causal effects.

### 7.6 Data cleaning and preparation

The proposed cleaning pipeline will have four linked layers.

**First, administrative reconciliation.** Every headline figure will be entered into a reconciliation ledger containing source, page or table, reporting date, accounting scope, unit, status label, denominator and reconciliation note. Conflicting figures will remain side by side until their difference is explained or marked unresolved.

**Secondly, identifier crosswalking.** The study will develop identifiers linking Fund transaction, budget line, county, site, project, contract, phase, unit, applicant and beneficiary where possible. Fuzzy matching will be used only as a candidate-generation tool, followed by manual or rule-based validation. A match confidence field will prevent uncertain links from being treated as facts.

**Thirdly, survey preparation.** Variables will be screened for completeness, conceptual relevance, redundancy and leakage. Housing-cost variables used to calculate the target will not also be used as predictors of that same target. Imputation, if needed, will be fitted within training folds. Survey weights, strata and clusters will be retained for population estimates and uncertainty calculations.

**Fourthly, status harmonisation.** A controlled status taxonomy will distinguish planned, budgeted, allocated, committed, contracted, paid, ongoing, practically complete, certified complete, serviced, commissioned, handed over, occupied and maintained. Where a source uses an ambiguous label, the original label will be retained and the harmonised field marked uncertain.

### 7.7 Proposed modelling workflow

The modelling design has three linked but analytically separate stages.

#### Stage 1: household housing vulnerability and affordability

The proposed target will be a housing-cost burden and a complementary residual-resource measure. For household \(i\):

\[
HCB_i = \frac{C_i}{Y_i},
\]

where \(C_i\) is total monthly housing cost and \(Y_i\) is household income or a validated income proxy. A stress flag may be defined as:

\[
V_i = \mathbb{1}(HCB_i > \tau_1 \;\lor\; RI_i < \tau_2 \;\lor\; D_i \geq \tau_3),
\]

where \(RI_i\) is residual income, \(D_i\) is a multidimensional deprivation score and \(\tau_1, \tau_2, \tau_3\) are policy or empirically justified thresholds tested through sensitivity analysis.

The proposed predictive workflow is:

1. Define the target without using predictors that mechanically reproduce it.
2. Partition data by county or geographic cluster so that households from the same spatial unit do not appear in both training and test folds.
3. Fit transparent baselines, including regularised regression and a rule-based affordability classifier.
4. Fit gradient-boosted tree models for continuous cost burden and vulnerable-household classification.
5. Tune hyperparameters within training folds only.
6. Compare random, blocked and feature-aware spatial validation, following spatial-leakage evidence.[11]
7. Calibrate probabilities and inspect error by income group, county, urban/rural status, gender, disability, tenure and documentation status.
8. Aggregate predictions using survey weights:

\[
\widehat{N}_c = \frac{\sum_{i \in c} w_i \widehat{V}_i}{\sum_{i \in c} w_i},
\]

where \(w_i\) is the survey weight and \(\widehat{N}_c\) is the estimated county vulnerability prevalence.

The output will be a county need and affordability profile, not an automatic beneficiary list. Performance will be reported using RMSE and MAE for continuous predictions, \(R^2\) as a descriptive fit measure, area under the ROC curve, precision, recall, F1 and calibration error for classification, and subgroup false-negative and false-positive rates.

#### Stage 2: county and project delivery-readiness benchmarking

The study will first report readiness descriptively because the number of counties is small and public project data may be incomplete. Candidate readiness dimensions include legal land status, approvals, compensation, utility access, procurement progress, contractor capacity, professional supervision, budget execution, reporting timeliness and prior completion performance.

If the reconciled project panel is adequate, each county will be treated as a decision-making unit in a conditional Data Envelopment Analysis (DEA) or related frontier benchmark. Production inputs will be limited to controllable or plausibly allocatable resources such as committed funds, project pipeline, contractor/professional capacity and implementation time. Outputs will distinguish certified or practically complete units, serviced units and handed-over units. Household deprivation will not be inserted as a production input merely because it is correlated with poor outcomes; it will remain a contextual or equity variable.

A slack-based measure may be formulated as:

\[
\rho_o^* = \min \frac{1 - \frac{1}{m}\sum_{r=1}^{m}s_r^-/x_{ro}}
{1 + \frac{1}{s}\sum_{k=1}^{s}s_k^+/y_{ko}},
\]

subject to:

\[
\sum_j \lambda_j x_{rj} + s_r^- = x_{ro}, \qquad
\sum_j \lambda_j y_{kj} - s_k^+ = y_{ko}, \qquad
\lambda_j,s_r^-,s_k^+ \geq 0.
\]

Here \(x\) represents inputs, \(y\) outputs, \(s^-\) input excess, \(s^+\) output shortfall and \(\lambda\) peer weights. The study will test constant and variable returns to scale, alternative input/output definitions, leave-one-out specifications and bootstrap confidence intervals. Scores will be reported as relative, sample-dependent benchmarks, not absolute capacity ceilings or causal explanations.

If data are insufficient for DEA, the study will not manufacture a frontier. It will use a transparent readiness index with published weights and uncertainty, or a completion-risk model with clearly labelled limitations. This fallback is a methodological safeguard.

#### Stage 3: capacity-aware allocation optimisation

Let \(u_c\) be the number of units allocated to county \(c\), \(x_c\) a binary activation variable, \(B\) the available budget and \(U\) the national unit quota. A baseline mixed-integer model may maximise need coverage and equity while penalising cost and readiness risk:

\[
\max Z = \sum_{c=1}^{47}\left(\alpha G_c + \beta E_c - \gamma R_c - \delta K_c\right)u_c,
\]

subject to:

\[
\sum_{c=1}^{47} cost_c u_c \leq B,
\]

\[
\sum_{c=1}^{47} u_c \leq U,
\]

\[
0 \leq u_c \leq cap_c x_c,
\qquad u_{min}x_c \leq u_c \leq u_{max}x_c,
\qquad x_c \in \{0,1\}.
\]

Here \(G_c\) is the county housing-need or affordability gap, \(E_c\) is an equity term, \(R_c\) is readiness or delivery risk and \(K_c\) is unit cost. The parameters \(\alpha,\beta,\gamma,\delta\) will not be hidden. Their values will be varied through sensitivity analysis and goal-programming alternatives.

The study will compare at least four scenarios: a population or rule-based baseline; a need-prioritised allocation; a need-plus-readiness allocation; and a robust or two-stage allocation in which costs, capacity and demand vary by scenario. The model will record whether budget, unit quota, minimum allocation, capacity, affordability or equity constraints bind. A binding constraint is a property of the chosen scenario, not proof of an observed real-world cause.

### 7.8 Objective-to-method mapping

| Objective | Method proposed | Main variables/evidence | Evaluation test | Expected direct output |
|---|---|---|---|---|
| Reconcile levy, Fund, project and completion records | Source-dated ledger, identifier crosswalk, status taxonomy and document reconciliation | KRA, Treasury, AHB, Auditor-General, Controller of Budget, project and contract records | Reconciliation rate, unresolved-discrepancy register, inter-rater/status agreement and provenance completeness | Auditable allocation-to-outcome register |
| Measure household housing need and affordability | Survey-weighted EDA, deprivation domains, housing-cost burden, residual income and stress tests | KHS income, rent, tenure, crowding, structure, services, disability and household variables | Weighted estimates, confidence intervals, threshold sensitivity and subgroup comparisons | County need and affordability profiles |
| Predict housing vulnerability | Baselines plus gradient-boosted regression/classification with spatial or county-aware validation | KHS predictors excluding target-defining leakage variables | MAE, RMSE, AUC, F1, calibration, spatial generalisation and subgroup error | Calibrated vulnerability estimates with model card |
| Benchmark delivery readiness and relative efficiency | Readiness index; conditional SBM-DEA if data adequacy permits; bootstrap and sensitivity analysis | Land, approvals, utilities, procurement, funds, contractors, professionals, progress and outputs | Bootstrap intervals, returns-to-scale sensitivity, rank stability and peer/slack diagnostics | Relative delivery benchmark and readiness constraints |
| Simulate equitable allocations | MILP baseline, goal programming, robust/two-stage scenarios | Need, affordability, cost, quota, budget, readiness, equity and uncertainty parameters | Feasibility, optimality gap, scenario regret, coverage, cost, fairness and binding constraints | Transparent alternative allocation scenarios |
| Validate policy usefulness and fairness | External case-study comparison, outcome consistency checks, governance audit and stakeholder interpretation | Independent project evidence, handover/occupation/complaints, participation and subgroup outcomes | Correlation not causation, subgroup inclusion/exclusion, rank stability and evidence completeness | Policy interpretation, caveats and improvement priorities |

### 7.9 Performance evaluation

Evaluation will occur at each stage rather than only after the final optimiser runs. The data register will be evaluated for provenance completeness and unresolved conflicts. The vulnerability model will be evaluated on unseen geographic units, calibration and subgroup error. The readiness benchmark will be evaluated for frontier sensitivity, confidence intervals, peer plausibility and specification stability. The allocation model will be evaluated for feasibility, optimality, scenario stability, equity, affordability coverage, expected completion and downside risk.

A fairness audit will report false-negative and false-positive rates by relevant groups where a classification task is used. Allocation fairness will report per-capita and need-adjusted allocation, coverage of high-need households, geographic concentration, and the distribution of minimum service or allocation guarantees. These statistics will not be interpreted as a single universal fairness score; they will make trade-offs visible.

An external consistency check will compare scenario rankings with independently documented project progress, completion, service readiness, handover or occupation. This will be reported as correlation or predictive consistency, not causal validation. A causal claim would require a longitudinal county-project panel, a defensible treatment date, a comparison group, pre-trend evidence and outcomes observed before and after implementation.

### 7.10 Conceptual deployment workflow

The proposed deployment is a controlled decision-support process rather than automatic eligibility determination. A versioned data snapshot will be ingested, validated and assigned a release identifier. The model card will record training data, target definitions, exclusions, geographic validation, performance, subgroup errors and known limitations. An authorised user will inspect the evidence register, select a policy scenario, view county/project results, examine the assumptions and compare alternative allocations. Every output will retain a provenance link to the source data and model version. Human review, appeals and correction of source records will remain part of the process.

The proposed workflow is:

1. Ingest a dated source snapshot.
2. Run schema, status, identifier and missingness checks.
3. Generate need, affordability and readiness indicators.
4. Run validated models and attach uncertainty intervals.
5. Select a legal and policy scenario.
6. Solve the allocation model and record binding constraints and sensitivity.
7. Display county/project evidence, allocations, beneficiaries’ aggregate subgroup effects and caveats.
8. Record the decision, reviewer, scenario, model version and any override.
9. Capture appeal, correction and audit feedback for the next data version.

No household-level public display is proposed. Outputs should be aggregated and privacy-protected, with access controls for any sensitive administrative records.

## 8. Expected Outcomes

### 8.1 Primary expected outcomes

The first expected outcome is a **source-dated allocation-to-outcome register** for Kenya’s Affordable Housing Programme. It will distinguish levy assessment, collection, remittance, investment, allocation, commitment, payment, construction, completion, service readiness, commissioning, handover, occupation and maintenance. It will retain conflicting source claims rather than silently replacing them with one preferred number.

The second expected outcome is a **county housing-need and affordability profile** based on the 2023/24 Kenya Housing Survey and supporting contextual data. It will show how crowding, structural condition, tenure, services, housing-cost burden, residual resources, disability, household composition and urban/rural conditions vary across counties. It will provide uncertainty intervals and will not imply that a survey estimate is an AHP beneficiary count.

The third expected outcome is a **validated household vulnerability model**. The model will be judged not only by random cross-validation but by its ability to generalise across counties or spatial clusters. Its model card will state which variables were used, how missing values were handled, how leakage was prevented, how well the model was calibrated and which groups experience higher prediction error.

The fourth expected outcome is a **delivery-readiness and relative-efficiency assessment**. Where project data are adequate, the study will identify peer benchmarks, input excesses and output shortfalls. Where data are inadequate, it will report the limitation and use a transparent readiness framework rather than presenting an unsupported DEA ranking. The output will distinguish high-need/low-readiness counties from low-need/high-readiness counties so that capacity-building is not confused with allocation denial.

The fifth expected outcome is a **set of transparent allocation scenarios**. The study will show how county allocations change under population-based, need-based, readiness-aware, equity-constrained and robust/two-stage rules. It will report expected need coverage, cost, unit distribution, geographic concentration, affordability risk, capacity use, downside risk and which constraints bind under each scenario.

The sixth expected outcome is an **equity and governance audit**. It will identify whether documentation, digital access, informal employment, gender, disability, age, tenure, rural residence or settlement location are associated with exclusion or higher risk. It will also identify whether participation influenced decisions, whether grievances were resolved, and whether audit findings led to corrective action.

### 8.2 Expected scientific contribution

The scientific contribution will be an integrated but bounded decision-support method. It will show how household-level vulnerability estimation, county/project readiness benchmarking and allocation optimisation can be chained without pretending that the chain identifies causality. It will provide an empirical demonstration of spatially aware validation in an African housing-allocation setting, a transparent separation of need and readiness, and a way to include uncertainty and equity in public-resource allocation.

### 8.3 Expected policy and institutional contribution

The practical contribution will be a reproducible framework that institutions can use to ask better questions before committing resources. It should show whether a proposed allocation is responding to need, readiness, affordability, equity or an undocumented combination. It should also identify what additional data are needed to make stronger claims, especially project identifiers, completion certificates, service readiness, beneficiary and occupancy records, affordability after occupation, and audit-finding closure.

### 8.4 Expected limitations and non-outcomes

The study is not expected to prove that the Affordable Housing Levy caused a particular housing outcome unless an appropriate longitudinal design becomes possible. It is not expected to produce a legally binding beneficiary list. It is not expected to treat a completed or commissioned unit as automatically occupied, affordable or adequate. It is not expected to transfer Singapore’s institutional model to Kenya. It is not expected to estimate absolute county capacity from a relative efficiency frontier. These are deliberate boundaries that protect the credibility of the study.

### 8.5 Success criteria

The study will be considered successful if it produces: (1) a traceable and reproducible source register; (2) clearly defined and separately measured need, affordability, readiness, efficiency and equity constructs; (3) a vulnerability model whose geographic generalisation and subgroup error are reported honestly; (4) a readiness benchmark that survives reasonable specification tests or a documented decision not to use DEA; (5) feasible allocation scenarios with visible assumptions and uncertainty; (6) a governance and fairness audit; and (7) a decision-support specification that preserves human review, appeals, source correction and model accountability.

## 9. Proposed Timeline

The proposed study will be conducted over six months, with validation treated as a continuous activity rather than a final-stage check.

| Period | Proposed milestone |
|---|---|
| Month 1 | Business and data understanding; source inventory; ethics submission; Kenya Housing Survey preparation; project and fund-flow source acquisition. |
| Month 2 | Data reconciliation, identifier crosswalk, status taxonomy, missingness analysis and leakage audit; exploratory analysis of need, affordability and project records. |
| Month 3 | Vulnerability and affordability model development; baseline comparison; spatial validation; calibration and subgroup-error analysis. |
| Month 4 | Delivery-readiness specification; data-adequacy assessment; conditional DEA or transparent readiness benchmark; bootstrap and sensitivity analysis. |
| Month 5 | Allocation scenarios; deterministic and robust/two-stage optimisation; fairness, feasibility, regret and binding-constraint analysis; independent consistency checks. |
| Month 6 | Integration, documentation, final evaluation, supervisor review, revisions and thesis preparation. |

## 10. Ethical Considerations

The study is designed primarily as a secondary-data study using de-identified Kenya Housing Survey microdata and public administrative, audit and legal records. No new household survey is proposed. Where restricted administrative or beneficiary records are required, access will be sought through the relevant data custodians and institutional ethics procedures.

Household income, tenure, disability, documentation and housing-condition variables can create stigma or privacy risks if reported at excessively fine geographic resolution. The study will therefore use minimum reportable-cell rules, aggregate outputs, privacy-preserving identifiers and access controls. It will not publish individual vulnerability scores or an automatic beneficiary list. Any approved qualitative case-study work will use informed consent, voluntary participation, secure storage and a clear separation between research participation and access to housing benefits.

The proposed machine-learning model will not make an unreviewed legal eligibility decision. Model outputs will be accompanied by reason codes, performance information, subgroup error rates, uncertainty and an appeal or correction pathway. The study will also document the risk that incomplete digital or administrative records could reproduce exclusion for informal workers, persons with disabilities, renters, undocumented households or residents with limited connectivity.

## 11. Proposed Resourcing and Tools

The analytical pipeline is proposed for implementation in Python using reproducible scripts, environment capture and version-controlled data dictionaries. Survey preparation and modelling may use pandas, NumPy, scikit-learn and a gradient-boosting implementation such as XGBoost or LightGBM. Spatial validation will use grouped or blocked cross-validation utilities and geospatial processing libraries where permitted by the data. Explainability will be used diagnostically rather than as proof of causality.

The readiness stage will use an open-source data-envelopment implementation or a transparent readiness index if the project panel is insufficient for a defensible frontier. Bootstrap procedures will be documented and seeded for reproducibility. The optimisation stage will use a mixed-integer linear-programming interface such as PuLP with an open-source or institutionally available solver. The final deliverables will include a data dictionary, source register, cleaning log, model card, scenario assumptions, evaluation report and reproducibility instructions.

The study will not require a live public deployment for the proposal. Any future institutional interface would be a controlled, versioned decision-support layer with authentication, source provenance, human review and audit logging.


## References

[1]: https://doi.org/10.25034/ijcua.2020.v4n2-5 "Agayi and Karakayacı, The Role of Changing Housing Policies in Housing Affordability and Accessibility in Developing Countries: The Case of Kenya"
[2]: https://doi.org/10.1016/j.jue.2020.103268 "Bird and Venables, Land tenure and land-use in a developing city: A quantitative spatial model applied to Kampala, Uganda"
[3]: https://doi.org/10.1038/s41586-025-09465-2 "Bettencourt and Marchio, Infrastructure deficits and informal settlements in sub-Saharan Africa"
[4]: https://doi.org/10.1080/10168737.2021.1916774 "Nguena, Tchana Tchana and Zeufack, Housing Finance and Inclusive Growth in Africa: Benchmarking, Determinants and Effects"
[5]: https://doi.org/10.3390/land9030085 "Uwayezu and de Vries, Access to Affordable Houses for the Low-Income Urban Dwellers in Kigali: Analysis Based on Sale Prices"
[6]: https://doi.org/10.3828/idpr.2024.3 "Smith, Brown and Owen, Scaling low-income housing delivery in Kenya and the Philippines: Community Participation and Livelihoods Outcomes"
[7]: https://doi.org/10.1016/j.cities.2022.103799 "Wainaina, Truffer and Lüthi, The Role of Institutional Logics During Participation in Urban Processes and Projects"
[8]: https://doi.org/10.1177/09562478231175041 "Wainaina, Truffer, Lüthi and Mang’ira, The Lack of Organizational Learning in Slum Upgrading Success"
[9]: https://doi.org/10.4102/apsdpr.v11i1.659 "Mvuyana, Theory of Change as a Monitoring and Evaluation Tool Aimed at Achieving Sustainable Human Settlements"
[10]: https://doi.org/10.1038/s41586-022-04484-9 "Aiken and colleagues, Machine Learning and Phone Data Can Improve Targeting of Humanitarian Aid"
[11]: https://doi.org/10.1186/s12961-024-01272-x "Thapa and colleagues, Do Targeted Intergovernmental Fiscal Transfers Improve Health Outcomes? Evidence from Kenyan Decentralization"
[12]: https://doi.org/10.3389/fceng.2020.622241 "Li and Grossmann, A Review of Stochastic Programming Methods for Optimization of Process Systems Under Uncertainty"
[13]: https://doi.org/10.1177/00420980221117918 "Tan, Do Ethnic Integration Policies Also Improve Socio-economic Integration? A Study of Residential Segregation in Singapore"
[14]: https://doi.org/10.1108/JPPEL-04-2023-0017 "Ti and See, Promoting Ethnic Diversity in Public Housing: Singapore and England Compared"
[15]: https://doi.org/10.1016/j.jag.2023.103364 "Wang, Khodadadzadeh and Zurita-Milla, Spatial+: A New Cross-validation Method to Evaluate Geospatial Machine Learning Models"
[16]: https://new.kenyalaw.org/akn/ke/act/2024/2/eng@2024-03-21 "Affordable Housing Act, 2024, Kenya Law"
[17]: https://kenyalaw.org/akn/ke/act/ln/2025/114/eng@2025-07-09/source "Affordable Housing Regulations, 2025, Legal Notice No. 114 of 2025"
[18]: https://libraryir.parliament.go.ke/items/c9ea11ce-03f6-4042-9b4b-41bb6084b7b2 "Office of the Auditor-General, Special Audit Report on the Affordable Housing Programme Project Status as at 31st March 2025"
[19]: https://statistics.knbs.or.ke/nada/index.php/catalog/184 "Kenya National Bureau of Statistics, Kenya Housing Survey 2023/24 Catalogue"
[20]: https://www.bomayangu.go.ke/ "Boma Yangu Affordable Housing Programme Portal"

> **Citation note.** References [1]–[15] are the scientific DOI-bearing sources used in this literature review. References [16]–[20] are official contextual sources and are not counted among the fifteen scientific sources. The DOI resolver links were verified during the literature-research workflow; before formal submission, the final bibliography should be checked once more against the institution’s required citation style.
[21]: https://www.un.org/sustainabledevelopment/cities/ "United Nations, Sustainable Development Goal 11: Sustainable Cities and Communities"
[22]: https://new.kenyalaw.org/akn/ke/act/2010/0/eng@2010-08-27 "Constitution of Kenya, 2010, Article 43"
[23]: https://thedocs.worldbank.org/en/doc/088090623169399368-0560011988/original/WorldBankGroupArchivesfolder1098192.pdf "World Bank, Brazil housing finance and National Housing Bank archival record"
[24]: https://doi.org/10.1080/02673037.2017.1364712 "Mosciaro and Aalbers, Asset-based Welfare in Brazil"
[25]: https://openknowledge.worldbank.org/entities/publication/7d780350-c353-5ce4-93cd-37b6cafc0f38 "World Bank, Stocktaking of the Housing Sector in Sub-Saharan Africa"
[26]: https://unhabitat.org/sites/default/files/download-manager-files/Affordable%20Land%20and%20Housing%20in%20Africa.pdf "UN-Habitat, Affordable Land and Housing in Africa"
[27]: https://new.kenyalaw.org/akn/ke/act/2024/2/eng@2024-03-21 "Affordable Housing Act, 2024"
[28]: https://kenyalaw.org/akn/ke/act/ln/2025/114/eng@2025-07-09 "Affordable Housing Regulations, 2025"
[29]: https://libraryir.parliament.go.ke/handle/123456789/39367 "Office of the Auditor-General, Special Audit Report on Affordable Housing Programme Project Status"
[30]: https://www.parliament.go.ke/sites/default/files/2026-02/The%202026%20Budget%20Policy%20Statement_0.pdf "Parliament of Kenya, 2026 Budget Policy Statement"
[31]: https://affordablehousingboard.go.ke/mukuru-affordable-housing-estate-phase-ii-officially-unveiled "Affordable Housing Board, Mukuru Affordable Housing Estate Phase II officially unveiled"
[32]: https://affordablehousingboard.go.ke/ly-ed "Affordable Housing Board, Emgwen Affordable Housing Project commissioned"
[33]: https://affordablehousingboard.go.ke/vihiga-estate-affordable-housing-project-commissioned "Affordable Housing Board, Vihiga Estate Affordable Housing Project commissioned"
[34]: https://www.bomayangu.go.ke/project/91 "Boma Yangu, Mukuru Met Site Social Housing Project"
[35]: https://housingandurban.go.ke/projects "State Department of Housing and Urban Development, Projects Register"
[36]: https://www.knbs.or.ke/wp-content/uploads/2025/01/2023-24-Kenya-Housing-Survey-Basic-Report1.pdf "Kenya National Bureau of Statistics, 2023/24 Kenya Housing Survey Basic Report"
