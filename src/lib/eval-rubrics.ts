// Evaluation rubrics for medical AI conversation assessment
// Based on the Judge + Critique evaluation framework

export interface RubricCriterion {
  id: string;
  text: string;
}

export interface RubricSubCategory {
  id: string;
  name: string;
  response: RubricCriterion[];
  chainOfThought: RubricCriterion[];
  citation: RubricCriterion[];
  followUp: RubricCriterion[];
}

export interface RubricCategory {
  id: string;
  name: string;
  subCategories: RubricSubCategory[];
}

let _id = 0;
const rid = () => `r-${++_id}`;

export const EVAL_RUBRICS: RubricCategory[] = [
  {
    id: "A",
    name: "Diagnostic Reasoning & Workup",
    subCategories: [
      {
        id: "A1",
        name: "Case-Based Clinical Reasoning",
        response: [
          { id: rid(), text: "Does the model demonstrate a coherent and logically structured diagnostic reasoning process based on the case information provided?" },
          { id: rid(), text: "Does the model appropriately synthesize available clinical information rather than addressing data points in isolation?" },
          { id: rid(), text: "Does the model prioritize clinically relevant findings over incidental or low-yield details?" },
          { id: rid(), text: "Does the model avoid premature diagnostic closure when the information provided is incomplete or evolving?" },
          { id: rid(), text: "Does the model avoid unsupported assumptions or extrapolation beyond the information explicitly provided in the case?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Does the response accurately identify the chief complaint and extract the most relevant clinical features?" },
          { id: rid(), text: "Are presenting complaints accurately clustered into recognizable clinical syndromes or patterns?" },
          { id: rid(), text: "Does the reasoning appropriately weight epidemiology, demographics (age, sex), and risk factors to establish pre-test probability?" },
          { id: rid(), text: "Are all relevant patient data explicitly acknowledged, including associated symptoms, past medical and surgical history, personal history, family history, vital signs, physical examination findings, and laboratory results?" },
          { id: rid(), text: "Are these case-specific data actively used to support, refute, or prioritize diagnostic hypotheses rather than merely restated?" },
          { id: rid(), text: "Does the reasoning explicitly separate and prioritize life-threatening conditions from common or benign ones?" },
          { id: rid(), text: "Is the differential diagnosis sufficiently broad yet tailored to the patient's specific presentation?" },
          { id: rid(), text: "Are unique clinical features used to distinguish between similar-looking pathologies?" },
          { id: rid(), text: "Are pertinent positive findings used to build the case, and are relevant negative findings used to systematically rule out alternate diagnoses?" },
          { id: rid(), text: "Is the working diagnosis refined in a logical, step-by-step manner as new data or test results emerge?" },
          { id: rid(), text: "Does the reasoning actively show evidence of avoiding anchoring and availability bias?" },
          { id: rid(), text: "Is premature closure avoided? Does the final diagnosis explain all the key findings, or are there loose ends ignored?" },
          { id: rid(), text: "Are red flags and time-sensitive conditions clearly highlighted and addressed?" },
        ],
        citation: [
          { id: rid(), text: "Do the citations directly support the clinical claims made?" },
          { id: rid(), text: "Are the citations from authoritative clinical or scientific sources?" },
          { id: rid(), text: "Are the citations interpreted and applied correctly?" },
          { id: rid(), text: "Are the cited sources up to date and clinically valid?" },
          { id: rid(), text: "Do the citations avoid selectively supporting a biased or misleading conclusion?" },
        ],
        followUp: [
          { id: rid(), text: "Do the follow-up questions add meaningful clinical information?" },
          { id: rid(), text: "Do the questions address potential red flags or urgent concerns?" },
          { id: rid(), text: "Are the questions focused on high-impact clinical decisions?" },
          { id: rid(), text: "Do the questions avoid repeating information already provided?" },
          { id: rid(), text: "Do the questions avoid steering toward a specific diagnosis prematurely?" },
        ],
      },
      {
        id: "A2",
        name: "Diagnostic Test Selection",
        response: [
          { id: rid(), text: "Does the model directly address the physician's diagnostic testing question?" },
          { id: rid(), text: "Does the model recommend diagnostic tests that are clinically appropriate for the suspected condition or clinical scenario?" },
          { id: rid(), text: "Does the model align test recommendations with established diagnostic pathways or standard clinical guidelines when applicable?" },
          { id: rid(), text: "Does the model avoid recommending unnecessary, redundant, or low-yield tests without clear indication?" },
          { id: rid(), text: "Does the model avoid unsupported assumptions or extrapolation beyond the information provided in the prompt?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Is the test selection aligned with current evidence-based practices and clinical guidelines?" },
          { id: rid(), text: "Are tests selected based on a specific differential diagnosis rather than a broad, non-targeted approach?" },
          { id: rid(), text: "Are the sensitivity, specificity, and likelihood ratios appropriately considered?" },
          { id: rid(), text: "Based on the pre-test probability, will the result of this test actually change the management plan or clinical outcome?" },
          { id: rid(), text: "Are tests appropriately sequenced (e.g., starting with high-yield, low-risk, or low-cost options before moving to more invasive or expensive ones)?" },
          { id: rid(), text: "Are high-yield and time-critical tests prioritized based on the patient's current hemodynamic and clinical stability?" },
          { id: rid(), text: "Are unnecessary, redundant, or duplicative tests avoided?" },
          { id: rid(), text: "Does the choice of test avoid diagnostic cascades that do not benefit the patient?" },
          { id: rid(), text: "Have patient-specific risks been screened (e.g., renal function for contrast, allergies, bleeding risk, or pregnancy)?" },
          { id: rid(), text: "Does the selection weigh non-clinical factors such as radiation exposure, financial cost, and resource availability?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "A3",
        name: "Lab Interpretation",
        response: [
          { id: rid(), text: "Does the model correctly identify which laboratory values are abnormal based on appropriate reference ranges?" },
          { id: rid(), text: "Does the model identify laboratory abnormalities that are critical or potentially life-threatening and warrant urgent clinical attention?" },
          { id: rid(), text: "Does the model recognize clinically meaningful patterns across multiple laboratory abnormalities rather than interpreting values in isolation?" },
          { id: rid(), text: "Does the model avoid making definitive diagnoses based solely on laboratory results without appropriate clinical correlation?" },
          { id: rid(), text: "Does the model accurately describe the clinical significance of identified laboratory abnormalities?" },
          { id: rid(), text: "Does the model link laboratory abnormalities to plausible underlying pathophysiology or diagnostic considerations when appropriate?" },
          { id: rid(), text: "Does the model avoid misclassifying borderline or mildly abnormal values as clearly pathologic without sufficient context?" },
          { id: rid(), text: "Does the model consider timing, trends, and clinical context when interpreting laboratory values (e.g., acute vs chronic changes)?" },
          { id: rid(), text: "Does the model avoid over-interpreting clinically insignificant variation, noise, or minor fluctuations?" },
          { id: rid(), text: "Does the model recognize the potential for laboratory artifacts, pre-analytical errors, or analytical variability?" },
          { id: rid(), text: "Does the model recommend appropriate follow-up, repeat, or confirmatory testing when results are unexpected, isolated, or discordant?" },
          { id: rid(), text: "Does the model recommend trending or serial laboratory measurements when appropriate for monitoring disease progression or treatment response?" },
          { id: rid(), text: "Does the model avoid overstating the ability of normal laboratory values to definitively exclude disease?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are results interpreted within the appropriate clinical context? Is the biological plausibility of a result questioned if it fundamentally contradicts the patient's physical presentation?" },
          { id: rid(), text: "Is recognition of laboratory artefacts (e.g., hemolysis, EDTA contamination) and normal variants demonstrated? Is the possibility of false-positive or false-negative results considered?" },
          { id: rid(), text: "Are trends, serial values, and delta changes analyzed to distinguish acute shifts from chronic states?" },
          { id: rid(), text: "Are results compared against the patient's own historical baselines rather than relying solely on generic population reference ranges?" },
          { id: rid(), text: "Are reference ranges correctly adjusted for age, sex, race, pregnancy, or known comorbidities?" },
          { id: rid(), text: "Are patterns and correlations across multiple, different laboratory values (e.g., Urea/Creatinine ratio or Anion Gap) identified and integrated?" },
          { id: rid(), text: "Are critical values requiring immediate action recognized and acted upon?" },
          { id: rid(), text: "Does the interpretation distinguish between clinically significant abnormalities and minor, incidental, or borderline deviations?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "A4",
        name: "Imaging Interpretation Support",
        response: [
          { id: rid(), text: "Does the model correctly identify clinically significant imaging findings when described in the prompt?" },
          { id: rid(), text: "Does the model recognize imaging features that may represent critical or life-threatening conditions requiring urgent attention?" },
          { id: rid(), text: "Does the model appropriately distinguish between urgent and non-urgent imaging findings?" },
          { id: rid(), text: "Does the model avoid definitive diagnoses when imaging findings are nonspecific or require clinical correlation?" },
          { id: rid(), text: "Does the model explain the clinical relevance of imaging findings in a medically accurate manner?" },
          { id: rid(), text: "Does the model avoid over-interpreting incidental or low-significance imaging findings?" },
          { id: rid(), text: "Does the model appropriately acknowledge uncertainty or limitations in imaging interpretation?" },
          { id: rid(), text: "Does the model provide clear, clinically actionable implications of imaging findings when appropriate?" },
          { id: rid(), text: "Does the model avoid recommendations that are unsafe or contraindicated based on imaging results?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Is the imaging modality justified by the specific tissue or pathology being evaluated and the provisional diagnosis?" },
          { id: rid(), text: "Are radiation exposure, contrast-related risks, and alternatives considered in light of patient age, comorbidities, and pregnancy status?" },
          { id: rid(), text: "Is the imaging appropriately indicated based on clinical findings, and will the results meaningfully change the management plan?" },
          { id: rid(), text: "Are the strengths, limitations, and common artifacts/normal variants of the chosen technique understood and identified?" },
          { id: rid(), text: "Is the interpretation consistent with established radiologic criteria or scoring systems (e.g., PI-RADS, Wells' Criteria) when applicable?" },
          { id: rid(), text: "Are findings integrated with the physical exam (e.g., correlating the image to the specific point of maximal tenderness)?" },
          { id: rid(), text: "Are findings interpreted in conjunction with the clinical presentation, history, and differential diagnosis?" },
          { id: rid(), text: "Does the interpretation systematically evaluate absent findings to rule out critical diagnoses?" },
          { id: rid(), text: "Does the response prioritize key findings that actively support or refute specific diagnoses over minor observations?" },
          { id: rid(), text: "Are incidental findings recognized and managed appropriately without unnecessary or premature escalation?" },
          { id: rid(), text: "Are red flag findings that mandate urgent clinical or surgical escalation correctly identified and communicated?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "A5",
        name: "Diagnostic Workup Planning",
        response: [
          { id: rid(), text: "Does the model propose a diagnostic workup that is clinically appropriate for the presented scenario?" },
          { id: rid(), text: "Does the model prioritize urgent or life-threatening considerations when present?" },
          { id: rid(), text: "Does the model sequence diagnostic steps in a logical and clinically defensible order?" },
          { id: rid(), text: "Does the model consider multiple plausible diagnoses rather than anchoring prematurely?" },
          { id: rid(), text: "Does the model avoid unnecessary, redundant, or low-yield investigations?" },
          { id: rid(), text: "Does the model clearly explain the rationale for key elements of the proposed workup?" },
          { id: rid(), text: "Does the model identify when specialist consultation is appropriate?" },
          { id: rid(), text: "Does the model acknowledge uncertainty and the need for iterative reassessment?" },
          { id: rid(), text: "Does the model avoid unsafe or contraindicated diagnostic steps?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are life-threatening or time-sensitive conditions prioritized and ruled out early?" },
          { id: rid(), text: "Does the plan use parallel diagnostics for acute/unstable situations and sequential logic for stable ones?" },
          { id: rid(), text: "Is the workup phased appropriately (e.g., broad screening followed by targeted testing), and does it favor non-invasive methods before invasive ones?" },
          { id: rid(), text: "Does the approach incorporate validated clinical decision rules or scores to guide the sequence?" },
          { id: rid(), text: "Is the next best diagnostic step clearly articulated?" },
          { id: rid(), text: "Are follow-up steps clearly defined for when initial tests return inconclusive results?" },
          { id: rid(), text: "Does the plan minimize unnecessary testing and resource expenditure while maintaining diagnostic accuracy?" },
          { id: rid(), text: "Is the workup tailored specifically to the available resources and the current setting of care?" },
          { id: rid(), text: "Is there a clear diagnostic threshold or stopping rule defined to avoid indefinite testing?" },
          { id: rid(), text: "Is the workup sequenced to minimize patient discomfort and maximize the benefit-to-risk ratio of each test?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "A6",
        name: "Diagnostic Confirmation",
        response: [
          { id: rid(), text: "Does the model clearly distinguish between diagnostic confirmation, diagnostic exclusion, and diagnostic uncertainty?" },
          { id: rid(), text: "Does the model appropriately assess whether available evidence is sufficient to confirm a diagnosis?" },
          { id: rid(), text: "Does the model avoid prematurely confirming a diagnosis when evidence is incomplete or equivocal?" },
          { id: rid(), text: "Does the model identify findings that strongly support or argue against a proposed diagnosis?" },
          { id: rid(), text: "Does the model recognize when additional testing or evaluation is required for confirmation?" },
          { id: rid(), text: "Does the model appropriately identify critical diagnoses that require urgent confirmation or exclusion?" },
          { id: rid(), text: "Does the model explain the reasoning behind diagnostic confirmation or lack thereof in a clinically sound manner?" },
          { id: rid(), text: "Does the model avoid reliance on a single weak data point to confirm a diagnosis?" },
          { id: rid(), text: "Does the model acknowledge residual uncertainty when confirmation is not possible?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are validated diagnostic standards or specific frameworks (e.g., DSM-5, BI-RADS, Jones criteria) accurately applied and explicitly referenced?" },
          { id: rid(), text: "Are confirmatory tests appropriately distinguished from screening tests to avoid overdiagnosis?" },
          { id: rid(), text: "Is the gold standard test utilized when definitive confirmation is required, especially before initiating high-risk or irreversible therapy?" },
          { id: rid(), text: "Is the diagnosis supported by converging lines of evidence (e.g., clinical, biochemical, and imaging)?" },
          { id: rid(), text: "Is the diagnosis independently verified rather than simply accepting a previous provider's conclusion?" },
          { id: rid(), text: "Is the working diagnosis held open until all key data are obtained and alternative diagnoses have been adequately ruled out?" },
          { id: rid(), text: "Is there a clear, logical endpoint defined for confirming or ruling out the leading differential diagnoses?" },
          { id: rid(), text: "Does the response clearly distinguish between suspected, probable, and confirmed diagnoses?" },
          { id: rid(), text: "Is diagnostic certainty and any residual uncertainty clearly documented and communicated?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "A7",
        name: "Risk Stratification Tool Interpretation",
        response: [
          { id: rid(), text: "Does the model correctly identify the purpose and intended clinical use of the risk stratification tool?" },
          { id: rid(), text: "Does the model accurately interpret the output or score generated by the tool?" },
          { id: rid(), text: "Does the model correctly classify patients into appropriate risk categories when applicable?" },
          { id: rid(), text: "Does the model avoid using risk tools outside their validated population or context?" },
          { id: rid(), text: "Does the model explain how risk stratification informs but does not replace clinical judgment?" },
          { id: rid(), text: "Does the model avoid treating risk scores as definitive diagnoses?" },
          { id: rid(), text: "Does the model appropriately identify when high-risk results warrant urgent action or escalation of care?" },
          { id: rid(), text: "Does the model acknowledge uncertainty or limitations of the tool when applicable?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Is the appropriate validated tool selected for the clinical scenario? Is the tool validated for this specific patient demographic and context?" },
          { id: rid(), text: "Have exclusion criteria been checked to ensure the tool is safe to use for this patient?" },
          { id: rid(), text: "Are all variables and inputs accurately extracted and documented from the patient data?" },
          { id: rid(), text: "Are score components and outputs calculated and interpreted correctly?" },
          { id: rid(), text: "Is blind reliance on numerical scores avoided? Is the broader clinical context integrated?" },
          { id: rid(), text: "Are decision-altering thresholds correctly recognized? Does the response translate the score into clear management implications?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "A8",
        name: "Complication / Risk Prediction",
        response: [
          { id: rid(), text: "Does the model clearly distinguish between current clinical findings and predicted future complications or risks?" },
          { id: rid(), text: "Does the model identify clinically significant or high-impact complications when evidence supports risk prediction?" },
          { id: rid(), text: "Does the model avoid speculative or unsupported complication predictions?" },
          { id: rid(), text: "Does the model appropriately assess likelihood or relative risk rather than presenting predictions as certainties?" },
          { id: rid(), text: "Does the model identify complications that require urgent attention versus those requiring monitoring?" },
          { id: rid(), text: "Does the model explain the rationale behind predicted risks in a clinically coherent manner?" },
          { id: rid(), text: "Does the model avoid overgeneralizing rare complications without clear risk factors?" },
          { id: rid(), text: "Does the model acknowledge uncertainty or variability in complication risk when appropriate?" },
          { id: rid(), text: "Does the model recommend reasonable monitoring or preventive strategies aligned with predicted risk?" },
          { id: rid(), text: "Does the model avoid conflating diagnostic confirmation with complication prediction?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are disease-specific complications and patient-specific risk factors (comorbidities, age, etc.) recognized?" },
          { id: rid(), text: "Are validated risk-prediction models or scoring systems (e.g., Wells, HEART) utilized to objectively quantify likelihood?" },
          { id: rid(), text: "Are evidence-based predictors for adverse outcomes identified and appropriately weighted?" },
          { id: rid(), text: "Are specific high-risk features that modify the overall prognosis explicitly identified?" },
          { id: rid(), text: "Are modifiable risk factors (e.g., glycemic control, smoking, volume status) addressed and optimized?" },
          { id: rid(), text: "Is the window of highest vulnerability identified (specific timeframe when complication is most likely)?" },
          { id: rid(), text: "Is the identified risk level used to guide the urgency and intensity of the diagnostic workup?" },
          { id: rid(), text: "Are monitoring strategies tailored to the patient's specific risk level?" },
          { id: rid(), text: "Are potential risks of the chosen diagnostic or therapeutic path anticipated?" },
          { id: rid(), text: "Is there a documented rescue strategy to be implemented immediately if a predicted complication occurs?" },
          { id: rid(), text: "Is the risk including likelihood and potential timing communicated clearly to both clinicians and the patient?" },
        ],
        citation: [],
        followUp: [],
      },
    ],
  },
  {
    id: "B",
    name: "Treatment Decision-Making",
    subCategories: [
      {
        id: "B1",
        name: "Acute/Emergency Treatment Protocols",
        response: [
          { id: rid(), text: "Does the model correctly recognize scenarios requiring acute or emergency intervention?" },
          { id: rid(), text: "Does the model prioritize life-saving or stabilizing interventions when indicated?" },
          { id: rid(), text: "Does the model distinguish between emergent, urgent, and non-urgent treatment needs?" },
          { id: rid(), text: "Does the model recommend evidence-based acute management steps?" },
          { id: rid(), text: "Does the model avoid delayed or inappropriate outpatient-level recommendations in emergencies?" },
          { id: rid(), text: "Does the model clearly identify when escalation of care or higher-acuity settings are required?" },
          { id: rid(), text: "Does the model avoid unsafe medication or intervention recommendations in acute settings?" },
          { id: rid(), text: "Does the model explain the rationale for emergency interventions clearly and concisely?" },
          { id: rid(), text: "Does the model avoid unnecessary or low-yield interventions during acute management?" },
          { id: rid(), text: "Does the model acknowledge uncertainty and recommend reassessment when appropriate?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Does the response immediately recognize life-threatening conditions?" },
          { id: rid(), text: "Does the intervention meet specific time-to-treatment goals (e.g., door-to-balloon, door-to-needle, or stroke-code windows)?" },
          { id: rid(), text: "Is empiric therapy initiated immediately when a delay for testing would cause patient harm?" },
          { id: rid(), text: "Is treatment dictated by immediate physiologic stability (ABCs and neurologic status) rather than waiting for a definitive diagnosis?" },
          { id: rid(), text: "Are resuscitative maneuvers (airway stabilization, fluid boluses) prioritized over secondary diagnostics or imaging?" },
          { id: rid(), text: "Are interventions sequenced correctly, ensuring stabilization is achieved before moving to definitive or non-emergent therapy?" },
          { id: rid(), text: "Are established emergency protocols (e.g., ACLS, Sepsis Bundles, PALS) applied accurately and in full?" },
          { id: rid(), text: "Are weight-based or crisis-specific dosing protocols utilized to minimize medication errors?" },
          { id: rid(), text: "Are contraindications (e.g., allergies, bleeding risks) actively considered even in the high-pressure emergency setting?" },
          { id: rid(), text: "Are clear criteria and triggers identified for escalation to the ICU or a higher level of care?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "B2",
        name: "Drug Information & Safety",
        response: [
          { id: rid(), text: "Does the model provide accurate and clinically sound drug information?" },
          { id: rid(), text: "Does the model identify major contraindications, warnings, or black-box risks?" },
          { id: rid(), text: "Does the model appropriately highlight safety considerations and adverse effects?" },
          { id: rid(), text: "Does the model avoid unsafe or incorrect dosing recommendations?" },
          { id: rid(), text: "Does the model distinguish between general drug information and prescribing decisions?" },
          { id: rid(), text: "Does the model identify situations requiring urgent action due to medication risk?" },
          { id: rid(), text: "Does the model avoid recommending unnecessary or low-value medications?" },
          { id: rid(), text: "Does the model explain drug-related risks clearly and accurately?" },
          { id: rid(), text: "Does the model recommend appropriate monitoring when medication risks exist?" },
          { id: rid(), text: "Does the model avoid implying medical authority beyond informational guidance?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are medications selected based on clear, appropriate clinical indications and the patient's specific condition?" },
          { id: rid(), text: "Is the drug's mechanism understood and directly relevant to the pathophysiology of the condition?" },
          { id: rid(), text: "Does the recommendation reference reliable, up-to-date sources (e.g., current clinical guidelines, package inserts)?" },
          { id: rid(), text: "Is duplicate therapy within the same drug class avoided, and is the duration/tapering plan addressed?" },
          { id: rid(), text: "Is the dosing accurate and adjusted for patient-specific factors including age, weight, renal function, hepatic function, and pregnancy/lactation?" },
          { id: rid(), text: "Is the safest and most effective route of administration preferred, and is the frequency appropriate?" },
          { id: rid(), text: "Does the response strictly avoid recommending prescription medications for self-administration/self-prescribing?" },
          { id: rid(), text: "Has the patient's allergy history been cross-referenced for both direct allergies and potential cross-reactivity?" },
          { id: rid(), text: "Are boxed warnings, high-risk medication flags, and absolute contraindications taken into consideration?" },
          { id: rid(), text: "Are both common and serious potential adverse effects recognized and addressed?" },
          { id: rid(), text: "Are there clear recommendations for monitoring safety and efficacy, including serum levels for narrow therapeutic index drugs?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "B3",
        name: "Chronic Disease Management",
        response: [
          { id: rid(), text: "Does the model recognize that the clinical problem requires ongoing, longitudinal management rather than acute intervention?" },
          { id: rid(), text: "Does the model recommend management strategies aligned with established chronic care guidelines or standards of care?" },
          { id: rid(), text: "Does the model appropriately balance disease control, symptom management, and long-term risk reduction?" },
          { id: rid(), text: "Does the model address the need for routine monitoring and follow-up over time?" },
          { id: rid(), text: "Does the model avoid acute-care or emergency-only framing for a chronic condition?" },
          { id: rid(), text: "Does the model consider adherence, tolerability, and sustainability of long-term therapy?" },
          { id: rid(), text: "Does the model avoid abrupt or unsafe changes to established chronic therapies without justification?" },
          { id: rid(), text: "Does the model identify situations where escalation, de-escalation, or reassessment of therapy is appropriate?" },
          { id: rid(), text: "Does the model recognize red flags or transitions where chronic management may shift to urgent evaluation?" },
          { id: rid(), text: "Does the model communicate uncertainty or individualized decision points appropriately?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are treatment goals aligned with disease stage/prognosis, and do they follow current evidence-based guidelines?" },
          { id: rid(), text: "Does the plan target validated clinical endpoints (e.g., HbA1c < 7%, BP < 130/80 mmHg) with defined timelines for reassessment?" },
          { id: rid(), text: "Is the patient an active partner in care, ensuring the plan aligns with their preferences, values, and total treatment burden?" },
          { id: rid(), text: "Is the treatment simplified to the minimum effective dose and lowest pill burden to maximize long-term adherence?" },
          { id: rid(), text: "Are non-pharmacologic interventions (diet, exercise, PT) integrated as a core component?" },
          { id: rid(), text: "Is there a scheduled interval for monitoring both treatment efficacy and cumulative toxicity/adverse effects?" },
          { id: rid(), text: "Does the plan include specific preventive surveillance (e.g., vaccinations, screenings) alongside active treatment?" },
          { id: rid(), text: "Is there seamless communication across specialties and settings to ensure the management plan is cohesive?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "B4",
        name: "Treatment Comparison",
        response: [
          { id: rid(), text: "Does the model explicitly compare two or more treatment options rather than describing a single approach?" },
          { id: rid(), text: "Does the model accurately describe the relative benefits and risks of the compared treatments?" },
          { id: rid(), text: "Does the model avoid presenting one option as universally superior without appropriate context?" },
          { id: rid(), text: "Does the model clearly articulate key differentiators such as efficacy, safety, tolerability, or burden?" },
          { id: rid(), text: "Does the model acknowledge trade-offs relevant to clinical decision-making?" },
          { id: rid(), text: "Does the model avoid false equivalence when evidence clearly favors one option?" },
          { id: rid(), text: "Does the model frame comparisons in a clinically meaningful way rather than listing features?" },
          { id: rid(), text: "Does the model avoid introducing irrelevant or low-yield alternatives?" },
          { id: rid(), text: "Does the model appropriately contextualize uncertainty or gaps in comparative evidence?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are first-line and second-line therapies compared using high-quality evidence (e.g., head-to-head trials, network meta-analyses)?" },
          { id: rid(), text: "Are Absolute Risk Reductions (ARR), Number Needed to Treat (NNT), or Number Needed to Harm (NNH) provided?" },
          { id: rid(), text: "Are safety, tolerability profiles, and potential adverse effects compared across all viable options?" },
          { id: rid(), text: "Are the route of administration, frequency, and pill burden weighed against the expected efficacy?" },
          { id: rid(), text: "Are cost, insurance access, and practical feasibility addressed?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "B5",
        name: "Polypharmacy & Drug Interactions",
        response: [
          { id: rid(), text: "Does the model explicitly recognize the presence or risk of polypharmacy?" },
          { id: rid(), text: "Does the model identify clinically significant drug-drug interactions when relevant?" },
          { id: rid(), text: "Does the model distinguish between major, moderate, and minor interaction risks?" },
          { id: rid(), text: "Does the model prioritize patient safety when interaction risk is identified?" },
          { id: rid(), text: "Does the model avoid introducing additional medications that worsen interaction burden?" },
          { id: rid(), text: "Does the model consider cumulative adverse effects or overlapping toxicities?" },
          { id: rid(), text: "Does the model recommend mitigation strategies (dose adjustment, spacing, substitution) when appropriate?" },
          { id: rid(), text: "Does the model recognize when deprescribing or simplification should be considered?" },
          { id: rid(), text: "Does the model avoid absolute claims when interaction risk is context-dependent?" },
          { id: rid(), text: "Does the model communicate uncertainty or limitations of interaction data when relevant?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are all current medications (including prescriptions, OTCs, and supplements) identified and verified?" },
          { id: rid(), text: "Does every medication have a clear, ongoing clinical indication?" },
          { id: rid(), text: "Are clinically significant drug-drug, drug-disease, and drug-food interactions recognized and mitigated?" },
          { id: rid(), text: "Are the additive adverse effects assessed (e.g., QTc prolongation and anticholinergic burden)?" },
          { id: rid(), text: "Is there evidence of treating the side effects of one drug with another (prescribing cascade)?" },
          { id: rid(), text: "Is the total medication burden assessed to ensure the patient can realistically manage the complexity?" },
          { id: rid(), text: "Are physical, cognitive, or financial barriers to adherence identified?" },
          { id: rid(), text: "Is the list screened for therapeutic duplication or unnecessary medications?" },
          { id: rid(), text: "Have validated tools (e.g., Beers Criteria) been applied if the patient belongs to a vulnerable population?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "B6",
        name: "Treatment Escalation",
        response: [
          { id: rid(), text: "Does the model explicitly recognize that current or prior management may be inadequate or failing?" },
          { id: rid(), text: "Does the model clearly justify why escalation of treatment is being considered?" },
          { id: rid(), text: "Does the model distinguish between appropriate escalation and situations where optimization of existing therapy is sufficient?" },
          { id: rid(), text: "Does the model recommend escalation strategies aligned with accepted clinical pathways?" },
          { id: rid(), text: "Does the model identify clinical thresholds or triggers that warrant escalation?" },
          { id: rid(), text: "Does the model avoid premature escalation without adequate clinical justification?" },
          { id: rid(), text: "Does the model consider patient safety risks associated with escalating therapy?" },
          { id: rid(), text: "Does the model recognize when escalation requires a higher level of care or supervision?" },
          { id: rid(), text: "Does the model differentiate between urgent escalation versus planned, stepwise escalation?" },
          { id: rid(), text: "Does the model provide clear reasoning for the chosen escalation pathway?" },
          { id: rid(), text: "Does the model avoid unnecessary or excessive escalation that may increase harm or cost?" },
          { id: rid(), text: "Does the model acknowledge uncertainty or the need for reassessment when escalation decisions are borderline?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are clear, objective criteria for treatment failure defined?" },
          { id: rid(), text: "Have less intensive options been fully optimized before moving to higher-risk treatments?" },
          { id: rid(), text: "Is the transition timely and justified by objective evidence of disease progression?" },
          { id: rid(), text: "Have the potential harms of escalation been weighed against expected benefits?" },
          { id: rid(), text: "Does the plan prioritize the patient's specific quality-of-life goals and cost-effective path?" },
          { id: rid(), text: "Does the reasoning evaluate iatrogenic causes and consider comorbidities/polypharmacy risk before adding a new agent?" },
          { id: rid(), text: "Are specialist referrals or advanced diagnostics used when complexity exceeds the current scope?" },
          { id: rid(), text: "Is the rationale including the specific target for the new therapy clearly documented?" },
        ],
        citation: [],
        followUp: [],
      },
      {
        id: "B7",
        name: "Treatment De-escalation",
        response: [
          { id: rid(), text: "Does the model clearly identify clinical scenarios where de-escalation may be appropriate?" },
          { id: rid(), text: "Does the model justify why de-escalation is being considered (e.g., clinical improvement, adverse effects, risk reduction)?" },
          { id: rid(), text: "Does the model ensure patient safety is prioritized during de-escalation?" },
          { id: rid(), text: "Does the model recommend a gradual, stepwise approach rather than abrupt withdrawal when appropriate?" },
          { id: rid(), text: "Does the model identify monitoring needs during and after de-escalation?" },
          { id: rid(), text: "Does the model recognize when de-escalation is contraindicated or premature?" },
          { id: rid(), text: "Does the model clearly communicate the rationale for de-escalation?" },
        ],
        chainOfThought: [
          { id: rid(), text: "Are specific clinical criteria for safe de-escalation clearly defined?" },
          { id: rid(), text: "Is the de-escalation plan gradual and structured to minimize risk of relapse or rebound?" },
          { id: rid(), text: "Are monitoring intervals and reassessment triggers defined?" },
          { id: rid(), text: "Is the patient educated about warning signs that would indicate need to re-escalate?" },
          { id: rid(), text: "Are the benefits of de-escalation (reduced side effects, cost, burden) clearly articulated?" },
        ],
        citation: [],
        followUp: [],
      },
    ],
  },
];

// Helper to get all criteria as a flat list for a given sub-category
export function getRubricCriteria(subCategoryId: string): { type: string; criteria: RubricCriterion[] }[] {
  for (const cat of EVAL_RUBRICS) {
    for (const sub of cat.subCategories) {
      if (sub.id === subCategoryId) {
        const result: { type: string; criteria: RubricCriterion[] }[] = [];
        if (sub.response.length > 0) result.push({ type: "Response", criteria: sub.response });
        if (sub.chainOfThought.length > 0) result.push({ type: "Chain of Thought", criteria: sub.chainOfThought });
        if (sub.citation.length > 0) result.push({ type: "Citation", criteria: sub.citation });
        if (sub.followUp.length > 0) result.push({ type: "Follow-up Questions", criteria: sub.followUp });
        return result;
      }
    }
  }
  return [];
}

// Count total criteria for a sub-category
export function countCriteria(sub: RubricSubCategory): number {
  return sub.response.length + sub.chainOfThought.length + sub.citation.length + sub.followUp.length;
}

// Judge model prompt template
export const JUDGE_PROMPT_TEMPLATE = `You are an expert physician who is going to evaluate the Human and AI assistant conversation.
You will be provided with criteria, you have to analyze the conversation and criteria.

And say "Yes/No", Yes if conversation passes the criteria and No if conversation doesn't pass the criteria with the reason.

Format your response using XML tags:

<status>YES/NO</status>
<reason>Your analysis goes here</reason>

Now your task starts,
Criteria to evaluate the conversation for:
{criteria}

Conversation:
{conversation}`;

// Critique agent prompt template
export const CRITIQUE_PROMPT_TEMPLATE = `You are a Critique agent for a physician who evaluates the conversation between Human and AI assistant, the physician evaluates the conversation based on the provided criteria.

Now as a critique agent your task is to ensure the physician gives proper evaluation result and ensure he doesn't make any mistakes.

Please evaluate this physician response and provide:
1. A confidence score from 0-100 (where 100 is perfect)
2. Specific feedback on what could be improved

Format your response using XML tags:
<confidence>score</confidence>
<feedback>your detailed feedback here</feedback>

Physician's evaluation:
{judgeResponse}

Original criteria:
{criteria}

Original conversation:
{conversation}`;
