import crypto from "crypto";
import { generateConversationIntelligence } from "./mock-intelligence";

function uid() {
  return crypto.randomBytes(12).toString("hex");
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  image: string | null;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  firstMessage: string;
  userPrompt: string;
  systemPrompt: string;
  llmProvider: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  thinkingBudget: string | null;
  enableBackupLlm: boolean;
  backupLlmProvider: string;
  backupLlmModel: string;
  voiceEnabled: boolean;
  voiceId: string | null;
  language: string;
  voiceStability: number;
  voiceSimilarityBoost: number;
  voiceStyleExaggeration: number;
  voiceSpeakerBoost: boolean;
  turnTaking: string;
  allowInterrupt: boolean;
  silenceTimeout: number;
  responseTimeout: number;
  maxDuration: number;
  endCallOnGoodbye: boolean;
  ambientSound: string | null;
  analysisLanguage: string;
  enableAnalysis: boolean;
  isPublic: boolean;
  isActive: boolean;
  publicId: string | null;
  publishedAt: string | null;
  widgetTheme: string;
  widgetColor: string;
  widgetPosition: string;
  knowledgeBaseId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  evaluationCriteria: EvaluationCriterion[];
  dataCollectionPoints: DataCollectionPoint[];
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  type: string;
  isActive: boolean;
  agentId: string;
  createdAt: string;
}

export interface DataCollectionPoint {
  id: string;
  name: string;
  description: string | null;
  dataType: string;
  prompt: string;
  isRequired: boolean;
  isActive: boolean;
  agentId: string;
  createdAt: string;
}

// ── Conversation Intelligence Types ─────────────────────────────────────────────
// Based on X-Health AI Conversation Intelligence specification

export type PersonaArchetype =
  | "newly_diagnosed"      // Just found out, don't know much, fear/confusion
  | "veteran_patient"      // Medical terminology, long history, nuanced questions
  | "anxious_worrier"      // 'What if' questions, catastrophising, repeated fears
  | "skeptic"              // Questions medical advice, 'natural' alternatives
  | "caregiver"            // 'My child', 'my mother', third-person questions
  | "information_seeker"   // Rapid detailed questions, mechanism interest
  | "action_taker"         // 'What can I do', 'give me steps', prevention focus
  | "emotional_processor"; // Shares personal story, expresses frustration/grief

export type PrimaryIntent =
  | "LEARN_BASICS"             // Foundational education
  | "UNDERSTAND_TRIGGERS"      // Trigger-specific knowledge
  | "MEDICATION_EDUCATION"     // How medications work (not what to take)
  | "SYMPTOM_UNDERSTANDING"    // What symptoms mean (not diagnosis)
  | "LIFESTYLE_MANAGEMENT"     // Diet, exercise, environment, routines
  | "EMERGENCY_GUIDANCE"       // Severe/acute situation
  | "CAREGIVER_SUPPORT"        // Helping someone else with the condition
  | "EMOTIONAL_SUPPORT"        // Anxious, scared, overwhelmed
  | "DOCTOR_PREP"              // Preparing for medical appointment
  | "DEVICE_EDUCATION"         // Inhalers, spacers, nebulizers etc.
  | "MYTH_BUSTING"             // Common misconceptions
  | "SEEK_DIAGNOSIS"           // Asking for a diagnosis (HARD REDIRECT)
  | "SEEK_PRESCRIPTION"        // Asking what medication to take (HARD REDIRECT)
  | "SMALL_TALK"               // Off-topic conversation
  | "UNKNOWN";                 // Intent unclear

export type SecondaryIntent =
  | "COMPARISON"           // User is comparing two options
  | "PERSONAL_STORY"       // User is sharing their experience
  | "CHILD_CONTEXT"        // Question is about a child
  | "ELDERLY_CONTEXT"      // Question is about an older person
  | "NEWLY_DIAGNOSED"      // Recent diagnosis (user or someone close)
  | "LONG_TERM_PATIENT"    // Years of condition management
  | "SEEKING_REASSURANCE"; // User wants to feel calmer

export type EmotionalState =
  | "CALM_CURIOUS"      // Relaxed phrasing, exploratory questions, no urgency
  | "MILDLY_ANXIOUS"    // Some worry words, seeking normalisation
  | "HIGHLY_ANXIOUS"    // Fear language, catastrophising, fast questions
  | "FRUSTRATED"        // 'Nothing works', 'I'm tired of this'
  | "OVERWHELMED"       // 'Too much', 'I can't cope', topic overload
  | "HOPEFUL"           // Positive framing, seeking progress
  | "DEFEATED"          // 'Given up', 'nothing helps', hopelessness
  | "URGENT"            // Fast typing signals, acute situation described
  | "NEUTRAL"           // No strong emotional signals
  | "GRIEVING";         // Processing diagnosis, loss, worsening condition

export type InnateDesire =
  | "FEAR_RELIEF"    // To be told this is not as bad as they think
  | "CONTROL"        // To understand so they can act
  | "VALIDATION"     // To feel their concern is legitimate
  | "CONNECTION"     // To not feel alone with this condition
  | "SIMPLICITY"     // To have the complexity reduced for them
  | "PROGRESS"       // To know things are improving or can improve
  | "SAFETY"         // To know what the danger signs are
  | "IDENTITY";      // To understand how this condition fits their life

export type HealthLiteracyLevel =
  | "beginner"      // Lay vocabulary, broad questions, 'what is' framing
  | "intermediate"  // Knows condition name, tracks some metrics, uneven knowledge
  | "advanced";     // Medical terminology used correctly, mechanism-level questions

export type ReadinessToAct =
  | "pre_contemplation"  // Not considering change; may be in denial
  | "contemplation"      // Aware, weighing options, 'I should probably'
  | "preparation"        // Ready to act, asking 'how do I start'
  | "action"             // Actively changing, tracking, engaging
  | "maintenance";       // Sustaining change, asking about relapse

export type TrustSignal =
  | "high"             // Accepts information without challenge, asks follow-up
  | "neutral"          // No explicit trust signals either way
  | "low"              // Questions accuracy, mentions 'but I read that', asks for sources
  | "active_distrust"; // Challenges AI identity, expresses frustration with AI advice

export type EngagementDepth =
  | "surface"      // Single question, accepted answer, no follow-up
  | "moderate"     // 2-4 follow-up questions, some personal disclosure
  | "deep"         // Personal story, multi-turn exploration, questions evolve
  | "vulnerable";  // Emotional disclosure, health anxiety, personal fear sharing

export interface ConversationIntelligence {
  // Core identity and intent
  personaArchetype: PersonaArchetype;
  primaryIntent: PrimaryIntent;
  secondaryIntent: SecondaryIntent | null;
  
  // Emotional journey
  emotionalStateStart: EmotionalState;
  emotionalStateEnd: EmotionalState;
  conversationArc: string; // e.g., "MILDLY_ANXIOUS → Reassured"
  
  // Psychological depth
  innateDesire: InnateDesire;
  healthLiteracy: HealthLiteracyLevel;
  
  // Behavioral signals
  readinessToAct: ReadinessToAct;
  trustSignal: TrustSignal;
  engagementDepth: EngagementDepth;
  
  // Metadata
  generatedAt: string;
}

export interface Conversation {
  id: string;
  mode: string;
  status: string;
  duration: number | null;
  callerName: string | null;
  callerEmail: string | null;
  callerPhone: string | null;
  summary: string | null;
  sentiment: string | null;
  resolved: boolean;
  source: string;
  agentId: string;
  userId: string | null;
  createdAt: string;
  endedAt: string | null;
  audioUrl: string | null;
  intelligence: ConversationIntelligence | null; // Generated after conversation ends
}

export interface Message {
  id: string;
  role: string;
  content: string;
  audioUrl: string | null;
  audioDuration: number | null;
  isVoiceInput: boolean;
  toolCall: string | null;
  ragContext: string | null;
  conversationId: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  content: string | null;
  url: string | null;
  fileSize: number | null;
  charCount: number;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDocument {
  agentId: string;
  documentId: string;
}

export interface EvaluationResult {
  id: string;
  conversationId: string;
  criterionId: string;
  criterionName: string;
  type: string; // "boolean" | "score"
  result: boolean | null; // pass/fail for boolean type
  score: number | null; // 0-10 for score type
  analysis: string;
  createdAt: string;
}

export interface CollectedData {
  id: string;
  conversationId: string;
  dataPointId: string;
  dataPointName: string;
  dataType: string; // "text" | "number" | "boolean" | "array"
  value: string; // JSON-encoded value
  createdAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  category: string;
  documentCount: number;
  charCount: number;
  source: string; // "directus" | "local"
  directusId: string | null;
  status: string; // "ready" | "syncing" | "error"
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── In-memory store ──────────────────────────────────────────────────────────
const g = globalThis as unknown as {
  _store: {
    users: User[];
    agents: Agent[];
    conversations: Conversation[];
    messages: Message[];
    documents: Document[];
    agentDocuments: AgentDocument[];
    evaluationResults: EvaluationResult[];
    collectedData: CollectedData[];
    knowledgeBases: KnowledgeBase[];
  } | undefined;
};

if (!g._store) {
  g._store = {
    // Seed a default demo account so login always works after restart
    users: [{
      id: "demo-user-001",
      email: "demo@voiceai.com",
      name: "Demo User",
      password: "$2b$10$FzNGsJwMnLOq7pp7.HG6QeQyYRyjaVVo0zj0ZOhLrUgOIysycLukO", // password123
      image: null,
      createdAt: new Date().toISOString(),
    }],
    agents: [],
    conversations: [],
    messages: [],
    documents: [],
    agentDocuments: [],
    evaluationResults: [],
    collectedData: [],
    knowledgeBases: [],
  };

  // Auto-seed demo agent with full data
  seedDemoData(g._store);
}

function seedDemoData(s: NonNullable<typeof g._store>) {
  const now = new Date();
  const agentId = "demo-agent-001";

  // -- Knowledge Bases (Mock Directus data) --
  s.knowledgeBases.push(
    {
      id: "kb-001",
      name: "Depression Management",
      description: "Comprehensive knowledge base covering depression diagnosis, treatment protocols, medication management, and therapeutic approaches.",
      category: "Mental Health",
      documentCount: 24,
      charCount: 156000,
      source: "directus",
      directusId: "dir-depression-001",
      status: "ready",
      lastSyncedAt: new Date(now.getTime() - 3600000).toISOString(),
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000).toISOString(),
    },
    {
      id: "kb-002",
      name: "Weight Loss Programs",
      description: "Evidence-based weight management strategies, nutrition guidelines, exercise protocols, and behavioral modification techniques.",
      category: "Wellness",
      documentCount: 18,
      charCount: 98000,
      source: "directus",
      directusId: "dir-weightloss-001",
      status: "ready",
      lastSyncedAt: new Date(now.getTime() - 7200000).toISOString(),
      createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 7200000).toISOString(),
    },
    {
      id: "kb-003",
      name: "Migraine Treatment",
      description: "Complete migraine management protocols including triggers, medication options, preventive strategies, and emergency interventions.",
      category: "Neurology",
      documentCount: 31,
      charCount: 187000,
      source: "directus",
      directusId: "dir-migraine-001",
      status: "ready",
      lastSyncedAt: new Date(now.getTime() - 1800000).toISOString(),
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 1800000).toISOString(),
    },
    {
      id: "kb-004",
      name: "Asthma Care Guidelines",
      description: "Clinical guidelines for asthma assessment, inhaler techniques, action plans, trigger avoidance, and emergency protocols.",
      category: "Respiratory",
      documentCount: 27,
      charCount: 142000,
      source: "directus",
      directusId: "dir-asthma-001",
      status: "ready",
      lastSyncedAt: new Date(now.getTime() - 900000).toISOString(),
      createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 900000).toISOString(),
    },
    {
      id: "kb-005",
      name: "Diabetes Management",
      description: "Comprehensive diabetes care protocols covering glucose monitoring, insulin management, dietary guidelines, and complication prevention.",
      category: "Endocrinology",
      documentCount: 35,
      charCount: 203000,
      source: "directus",
      directusId: "dir-diabetes-001",
      status: "ready",
      lastSyncedAt: new Date(now.getTime() - 5400000).toISOString(),
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 5400000).toISOString(),
    },
    {
      id: "kb-006",
      name: "Hypertension Control",
      description: "Blood pressure management guidelines, lifestyle modifications, medication protocols, and cardiovascular risk reduction strategies.",
      category: "Cardiology",
      documentCount: 22,
      charCount: 118000,
      source: "directus",
      directusId: "dir-hypertension-001",
      status: "ready",
      lastSyncedAt: new Date(now.getTime() - 10800000).toISOString(),
      createdAt: new Date(now.getTime() - 75 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 10800000).toISOString(),
    }
  );

  // -- Demo Agent --
  s.agents.push({
    id: agentId,
    name: "Asthma Consultation Agent",
    description: "AI-powered asthma consultation and patient assessment agent for respiratory health management.",
    avatar: null,
    firstMessage: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?",
    userPrompt: "",
    systemPrompt: "You are a compassionate and knowledgeable asthma consultation assistant. Your role is to:\n\n1. Assess the patient's current asthma symptoms and severity\n2. Check their rescue inhaler usage and medication adherence\n3. Provide safety education about asthma triggers and management\n4. Collect relevant health data for the medical team\n5. Determine if the patient needs urgent medical attention\n\nAlways be empathetic, ask clear questions, and provide actionable advice. If symptoms suggest an emergency, direct the patient to seek immediate medical care.",
    llmProvider: "anthropic",
    llmModel: "claude-sonnet-4-6",
    temperature: 0.7,
    maxTokens: 1000,
    thinkingBudget: null,
    enableBackupLlm: true,
    backupLlmProvider: "openai",
    backupLlmModel: "gpt-4o-mini",
    voiceEnabled: true,
    voiceId: "rachel",
    language: "en",
    voiceStability: 50,
    voiceSimilarityBoost: 75,
    voiceStyleExaggeration: 0,
    voiceSpeakerBoost: true,
    turnTaking: "auto",
    allowInterrupt: true,
    silenceTimeout: 5,
    responseTimeout: 30,
    maxDuration: 600,
    endCallOnGoodbye: true,
    ambientSound: null,
    analysisLanguage: "auto",
    enableAnalysis: true,
    isPublic: true,
    isActive: true,
    publicId: "asthma-consult-demo",
    publishedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    widgetTheme: "light",
    widgetColor: "#2563eb",
    widgetPosition: "bottom-right",
    knowledgeBaseId: "kb-004",
    userId: "demo-user-001",
    createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    evaluationCriteria: [],
    dataCollectionPoints: [],
  });

  // -- Evaluation Criteria --
  const criteria = [
    { id: "crit-001", name: "Symptom Assessment Completed", description: "Agent thoroughly asked about current asthma symptoms", prompt: "Did the agent ask about and assess the patient's current asthma symptoms including frequency, severity, and triggers?" },
    { id: "crit-002", name: "Rescue Inhaler Checked", description: "Agent checked rescue inhaler usage and availability", prompt: "Did the agent ask about the patient's rescue inhaler usage, frequency of use, and whether they have it available?" },
    { id: "crit-003", name: "Safety Education Correct", description: "Agent provided accurate safety information", prompt: "Did the agent provide correct and helpful safety education about asthma management, triggers, or medication use?" },
    { id: "crit-004", name: "Session Length Appropriate", description: "Consultation was neither too short nor too long", prompt: "Was the consultation an appropriate length - thorough enough to cover key topics but not unnecessarily long?" },
    { id: "crit-005", name: "User Engagement Quality", description: "Agent maintained good engagement throughout", prompt: "Did the agent maintain good patient engagement, show empathy, and encourage the patient to share information?" },
  ];

  const agent = s.agents[0];
  for (const c of criteria) {
    agent.evaluationCriteria.push({
      id: c.id, name: c.name, description: c.description, prompt: c.prompt,
      type: "boolean", isActive: true, agentId, createdAt: agent.createdAt,
    });
  }

  // -- Data Collection Points --
  const dataPoints = [
    { id: "dp-001", name: "Rescue Inhaler Use", description: "How often patient uses rescue inhaler", dataType: "string", prompt: "Extract how frequently the patient uses their rescue inhaler" },
    { id: "dp-002", name: "Night Symptoms", description: "Whether patient has nighttime symptoms", dataType: "boolean", prompt: "Determine if the patient experiences nighttime asthma symptoms" },
    { id: "dp-003", name: "Symptom Severity", description: "Overall severity rating of symptoms", dataType: "string", prompt: "Assess the overall severity of the patient's asthma symptoms (none, mild, moderate, severe)" },
    { id: "dp-004", name: "Vaccination Status (Biologic)", description: "Whether patient is on biologic therapy", dataType: "boolean", prompt: "Determine if the patient is currently on or interested in biologic therapy" },
  ];

  for (const dp of dataPoints) {
    agent.dataCollectionPoints.push({
      id: dp.id, name: dp.name, description: dp.description, dataType: dp.dataType,
      prompt: dp.prompt, isRequired: true, isActive: true, agentId, createdAt: agent.createdAt,
    });
  }

  // -- Conversations with messages and analysis --
  const convTemplates = [
    {
      name: "Sarah Johnson", email: "sarah.johnson@email.com", mode: "voice", sentiment: "positive",
      summary: "Patient reported mild symptoms, uses rescue inhaler once weekly. Good adherence to controller medication. No nighttime symptoms.",
      daysAgo: 0, duration: 178, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "Hi! I've been doing pretty well actually. Just occasional wheezing when I exercise." },
        { role: "assistant", content: "That's good to hear you're generally doing well. Exercise-induced symptoms are common. How often would you say you experience this wheezing during exercise?" },
        { role: "user", content: "Maybe once or twice a week, usually when I go for a run." },
        { role: "assistant", content: "I see. And do you use your rescue inhaler before exercising, or only when symptoms occur?" },
        { role: "user", content: "I usually use it before running as a precaution. My doctor recommended that." },
        { role: "assistant", content: "That's a great approach! Using your rescue inhaler 15-20 minutes before exercise can help prevent symptoms. Do you experience any nighttime symptoms or wake up due to breathing difficulties?" },
        { role: "user", content: "No, I sleep well. No nighttime issues at all." },
        { role: "assistant", content: "Excellent! It sounds like your asthma is well-controlled. Keep up with your current medication routine and the pre-exercise inhaler use. If symptoms change or worsen, don't hesitate to reach out." },
      ],
      evalResults: [true, true, true, true, true],
      dataValues: ["Once weekly before exercise", "false", "mild", "false"],
    },
    {
      name: "Michael Chen", email: "m.chen@email.com", mode: "voice", sentiment: "neutral",
      summary: "Patient experiencing increased nighttime symptoms. Rescue inhaler use has increased to daily. Referred for medication review.",
      daysAgo: 0, duration: 245, resolved: false,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "Not great honestly. I've been waking up at night coughing more often." },
        { role: "assistant", content: "I'm sorry to hear that. Nighttime symptoms can really affect your quality of life. How many nights per week are you experiencing this coughing?" },
        { role: "user", content: "Almost every night this past week. It's been getting worse." },
        { role: "assistant", content: "That's concerning. Frequent nighttime symptoms suggest your asthma may not be well-controlled. How often are you using your rescue inhaler?" },
        { role: "user", content: "I've been using it every day, sometimes twice a day." },
        { role: "assistant", content: "Using your rescue inhaler that frequently is a sign that we need to review your treatment plan. Are you currently taking a controller medication, like an inhaled corticosteroid?" },
        { role: "user", content: "Yes, but I admit I sometimes forget to take it." },
        { role: "assistant", content: "Consistent use of your controller medication is really important for managing symptoms. I'd strongly recommend scheduling an appointment with your doctor to review your medication plan. In the meantime, please try to take your controller medication every day as prescribed." },
      ],
      evalResults: [true, true, true, true, false],
      dataValues: ["Daily, sometimes twice daily", "true", "moderate", "false"],
    },
    {
      name: "Emily Rodriguez", email: "emily.r@email.com", mode: "text", sentiment: "positive",
      summary: "New patient onboarding. Discussed asthma basics, trigger identification, and action plan setup. Patient engaged well.",
      daysAgo: 1, duration: 312, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "I was just diagnosed with asthma last month. I'm not sure what I should be doing." },
        { role: "assistant", content: "Welcome, and don't worry - we'll help you understand everything. First, can you tell me what symptoms you've been experiencing that led to your diagnosis?" },
        { role: "user", content: "Shortness of breath, coughing, and tightness in my chest. Mostly in the morning." },
        { role: "assistant", content: "Those are classic asthma symptoms. Morning symptoms can be related to overnight allergen exposure. Have you identified any triggers yet?" },
        { role: "user", content: "My doctor mentioned dust and pollen could be triggers." },
        { role: "assistant", content: "That's a great start. Common indoor triggers include dust mites, pet dander, and mold. Outdoor triggers include pollen and air pollution. Consider using allergen-proof bedding covers and keeping windows closed on high pollen days." },
      ],
      evalResults: [true, false, true, true, true],
      dataValues: ["Newly prescribed, not yet used", "false", "mild", "false"],
    },
    {
      name: "James Wilson", email: "j.wilson@email.com", mode: "voice", sentiment: "negative",
      summary: "Patient frustrated with recurring symptoms. Controller medication not effective. Escalation recommended for specialist referral.",
      daysAgo: 2, duration: 189, resolved: false,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "Terrible. I've been on medication for months and nothing is working." },
        { role: "assistant", content: "I'm really sorry you're going through this. Let's try to figure out what might be going on. Can you tell me which medications you're currently taking?" },
        { role: "user", content: "I'm on fluticasone and albuterol. The albuterol helps temporarily but the fluticasone doesn't seem to do anything." },
        { role: "assistant", content: "I understand your frustration. How long have you been on the fluticasone, and are you using proper inhaler technique? Sometimes the medication takes time to show full effect." },
        { role: "user", content: "About 3 months now. I think I'm using it correctly." },
        { role: "assistant", content: "Three months should be enough time to see improvement. I'd recommend scheduling an appointment with a pulmonologist for a more thorough evaluation. They may consider stepping up your therapy or exploring biologic treatments." },
      ],
      evalResults: [true, true, false, false, false],
      dataValues: ["Multiple times daily", "true", "severe", "false"],
    },
    {
      name: "Anna Roberts", email: "anna.r@email.com", mode: "voice", sentiment: "positive",
      summary: "Follow-up consultation. Patient's symptoms improved after medication adjustment. Rescue inhaler use decreased significantly.",
      daysAgo: 3, duration: 156, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "So much better! Since my doctor adjusted my medication, I've been feeling great." },
        { role: "assistant", content: "That's wonderful to hear! What specific improvements have you noticed?" },
        { role: "user", content: "I can exercise without wheezing and I barely need my rescue inhaler anymore." },
        { role: "assistant", content: "Excellent improvement! How often are you using your rescue inhaler now?" },
        { role: "user", content: "Maybe once every two weeks, if that." },
        { role: "assistant", content: "That's a great sign of well-controlled asthma. Keep up with your controller medication and continue monitoring your symptoms. Remember to always carry your rescue inhaler just in case." },
      ],
      evalResults: [true, true, true, true, true],
      dataValues: ["Once every two weeks", "false", "none", "false"],
    },
    {
      name: "David Kim", email: "d.kim@email.com", mode: "text", sentiment: "neutral",
      summary: "Patient inquired about biologic therapy options. Provided information on eligibility criteria and next steps.",
      daysAgo: 5, duration: 267, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "I'm doing okay but I've heard about biologic treatments for asthma. Can you tell me more?" },
        { role: "assistant", content: "Of course! Biologic therapies are newer treatments designed for specific types of severe asthma. They target particular pathways in the immune system that cause airway inflammation." },
        { role: "user", content: "Am I a candidate for these treatments?" },
        { role: "assistant", content: "Biologic therapies are typically considered for patients with severe asthma that isn't well-controlled with standard medications. Your doctor would need to evaluate your specific asthma type through blood tests and lung function assessments." },
        { role: "user", content: "I see. My asthma is moderate and generally controlled. Maybe I should discuss this with my specialist." },
        { role: "assistant", content: "That's a wise approach. Your specialist can review your history and determine if biologics might benefit you in the future. For now, continue with your current treatment plan and keep tracking your symptoms." },
      ],
      evalResults: [false, true, true, true, true],
      dataValues: ["Twice weekly", "false", "moderate", "true"],
    },
    {
      name: "Lisa Thompson", email: "l.thompson@email.com", mode: "voice", sentiment: "positive",
      summary: "Routine check-in. Patient managing well with current treatment. Discussed seasonal trigger preparation.",
      daysAgo: 7, duration: 198, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "Pretty good! Spring is coming though and I'm worried about pollen season." },
        { role: "assistant", content: "It's great that you're thinking ahead! Spring pollen can definitely trigger asthma symptoms. Let's talk about preparing for the season. Do you currently take any allergy medications?" },
        { role: "user", content: "I take cetirizine when it gets bad." },
        { role: "assistant", content: "That's helpful. Starting your antihistamine before pollen season peaks can be more effective. Also, check pollen counts daily, keep windows closed, and shower after spending time outdoors." },
        { role: "user", content: "Good tips! Should I adjust my asthma medication too?" },
        { role: "assistant", content: "Discuss with your doctor about potentially stepping up your controller medication during peak pollen season. Having a clear action plan for when symptoms worsen is key to staying on top of things." },
      ],
      evalResults: [true, false, true, true, true],
      dataValues: ["Rarely, well controlled", "false", "mild", "false"],
    },
    {
      name: "Robert Garcia", email: "r.garcia@email.com", mode: "voice", sentiment: "neutral",
      summary: "Patient reported workplace triggers. Discussed occupational asthma considerations and referral for workplace assessment.",
      daysAgo: 10, duration: 223, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "My asthma seems to get worse at work. I work in a factory and there's a lot of dust." },
        { role: "assistant", content: "That's an important observation. Occupational asthma or work-aggravated asthma is more common than people think. Do your symptoms improve on weekends or holidays?" },
        { role: "user", content: "Yes, actually. I feel much better on weekends." },
        { role: "assistant", content: "That pattern strongly suggests your workplace environment is a significant trigger. Do you use any respiratory protection at work?" },
        { role: "user", content: "We have masks available but I don't always wear one." },
        { role: "assistant", content: "I'd strongly recommend wearing proper respiratory protection consistently. You should also speak with your employer about an occupational health assessment. Your doctor can refer you to an occupational medicine specialist." },
      ],
      evalResults: [true, true, true, true, false],
      dataValues: ["Daily at work", "false", "moderate", "false"],
    },
    {
      name: "Jennifer Lee", email: "j.lee@email.com", mode: "text", sentiment: "positive",
      summary: "Patient inquired about exercise-induced asthma management. Provided comprehensive exercise guidance and warm-up protocols.",
      daysAgo: 14, duration: 187, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "I want to start training for a marathon but I'm worried about my asthma." },
        { role: "assistant", content: "That's an exciting goal! Many athletes with asthma compete at high levels. The key is proper preparation and management. Do you currently experience exercise-induced symptoms?" },
        { role: "user", content: "Yes, I usually start wheezing about 10 minutes into running." },
        { role: "assistant", content: "A proper warm-up can significantly reduce exercise-induced symptoms. Start with 10-15 minutes of gradually increasing intensity. Also, using your rescue inhaler 15 minutes before exercise is an effective preventive strategy." },
        { role: "user", content: "That's helpful! Anything else I should know?" },
        { role: "assistant", content: "Breathe through your nose when possible, avoid exercising in cold dry air or high pollution days, and always carry your rescue inhaler. With proper management, there's no reason you can't train for and complete a marathon!" },
      ],
      evalResults: [true, true, true, false, true],
      dataValues: ["Before exercise only", "false", "mild", "false"],
    },
    {
      name: "Thomas Brown", email: "t.brown@email.com", mode: "voice", sentiment: "negative",
      summary: "Emergency-like symptoms reported. Patient experiencing severe shortness of breath. Directed to seek immediate medical attention.",
      daysAgo: 18, duration: 95, resolved: false,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "I can barely breathe right now. My inhaler isn't helping." },
        { role: "assistant", content: "I'm very concerned about your symptoms. If your rescue inhaler isn't providing relief, this could be a medical emergency. Are you able to speak in full sentences right now?" },
        { role: "user", content: "Not... really. Having to... take breaks." },
        { role: "assistant", content: "Please call 911 or have someone take you to the emergency room immediately. This sounds like a severe asthma attack that requires emergency medical care. Do not wait - seek help right now." },
        { role: "user", content: "Okay, I'll call for help." },
        { role: "assistant", content: "Good. While waiting for help, try to sit upright, stay calm, and continue using your rescue inhaler every 20 minutes if needed. You're doing the right thing by seeking help." },
      ],
      evalResults: [true, true, true, true, true],
      dataValues: ["Multiple times with no relief", "true", "severe", "false"],
    },
    {
      name: "Karen Mitchell", email: "k.mitchell@email.com", mode: "voice", sentiment: "positive",
      summary: "Medication review consultation. Patient well-managed on current regimen. Discussed importance of annual flu vaccination.",
      daysAgo: 21, duration: 210, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "Very well, thanks! I'm here for my regular check-in." },
        { role: "assistant", content: "Wonderful! Regular check-ins are important. Let's review how things have been. How often have you needed your rescue inhaler in the past month?" },
        { role: "user", content: "Only used it once, and that was during a cold." },
        { role: "assistant", content: "That's excellent control! Speaking of colds, have you had your flu vaccination this year? Respiratory infections can be particularly problematic for asthma patients." },
        { role: "user", content: "Not yet, I keep forgetting." },
        { role: "assistant", content: "I'd strongly recommend getting it soon. The flu can trigger severe asthma flare-ups. Most pharmacies offer walk-in flu shots. It's one of the best preventive measures you can take." },
      ],
      evalResults: [true, true, true, true, true],
      dataValues: ["Once in past month", "false", "none", "false"],
    },
    {
      name: "Peter Anderson", email: "p.anderson@email.com", mode: "text", sentiment: "neutral",
      summary: "Patient asked about switching from MDI to dry powder inhaler. Discussed pros and cons of different inhaler devices.",
      daysAgo: 25, duration: 175, resolved: true,
      messages: [
        { role: "assistant", content: "Hello! I'm here to help you with your asthma management. How have you been feeling recently?" },
        { role: "user", content: "Fine, but I'm struggling with my inhaler technique. My doctor mentioned switching to a dry powder inhaler." },
        { role: "assistant", content: "Inhaler technique is crucial for effective medication delivery. Dry powder inhalers (DPIs) can be easier for some patients since they're breath-activated. What specific difficulties are you having with your current MDI?" },
        { role: "user", content: "I have trouble coordinating the press-and-breathe action." },
        { role: "assistant", content: "That's very common! A DPI eliminates the coordination issue since you just need to breathe in quickly and deeply. Another option is using a spacer with your MDI, which also removes the coordination challenge." },
        { role: "user", content: "I think I'd prefer the dry powder option. Are there any downsides?" },
        { role: "assistant", content: "DPIs require a strong enough inhalation to activate the dose, which can be difficult during severe attacks. It's recommended to keep an MDI with spacer as backup for emergencies. Your doctor can help choose the right DPI for your needs." },
      ],
      evalResults: [false, true, true, true, true],
      dataValues: ["Twice weekly", "false", "mild", "false"],
    },
  ];

  const severities = ["none", "mild", "moderate", "severe"];

  for (let i = 0; i < convTemplates.length; i++) {
    const t = convTemplates[i];
    const createdAt = new Date(now.getTime() - t.daysAgo * 86400000 - Math.random() * 43200000);
    const convId = `demo-conv-${String(i + 1).padStart(3, "0")}`;

    s.conversations.push({
      id: convId,
      agentId,
      userId: null,
      mode: t.mode,
      source: "widget",
      callerName: t.name,
      callerEmail: t.email,
      callerPhone: null,
      status: "ended",
      duration: t.duration,
      summary: t.summary,
      sentiment: t.sentiment,
      resolved: t.resolved,
      createdAt: createdAt.toISOString(),
      endedAt: new Date(createdAt.getTime() + t.duration * 1000).toISOString(),
      audioUrl: null,
      intelligence: null, // Will be generated below for ended conversations
    });

    // Messages
    let msgTime = createdAt.getTime();
    for (let j = 0; j < t.messages.length; j++) {
      const msg = t.messages[j];
      msgTime += Math.floor(Math.random() * 6000) + 2000;
      s.messages.push({
        id: `demo-msg-${String(i + 1).padStart(3, "0")}-${String(j + 1).padStart(2, "0")}`,
        conversationId: convId,
        role: msg.role,
        content: msg.content,
        audioUrl: null,
        audioDuration: null,
        isVoiceInput: msg.role === "user" && t.mode === "voice",
        toolCall: null,
        ragContext: null,
        createdAt: new Date(msgTime).toISOString(),
      });
    }

    // Evaluation results
    for (let k = 0; k < criteria.length; k++) {
      const passed = t.evalResults[k];
      s.evaluationResults.push({
        id: `demo-eval-${String(i + 1).padStart(3, "0")}-${String(k + 1).padStart(2, "0")}`,
        conversationId: convId,
        criterionId: criteria[k].id,
        criterionName: criteria[k].name,
        type: "boolean",
        result: passed,
        score: null,
        analysis: passed
          ? `The agent successfully ${criteria[k].name.toLowerCase()} during the conversation.`
          : `The agent did not fully address ${criteria[k].name.toLowerCase()} in this conversation.`,
        createdAt: new Date(msgTime + 1000).toISOString(),
      });
    }

    // Collected data
    for (let k = 0; k < dataPoints.length; k++) {
      const val = t.dataValues[k];
      s.collectedData.push({
        id: `demo-data-${String(i + 1).padStart(3, "0")}-${String(k + 1).padStart(2, "0")}`,
        conversationId: convId,
        dataPointId: dataPoints[k].id,
        dataPointName: dataPoints[k].name,
        dataType: dataPoints[k].dataType,
        value: JSON.stringify(val === "true" ? true : val === "false" ? false : val),
        createdAt: new Date(msgTime + 1000).toISOString(),
      });
    }
  }

  // Generate intelligence for all ended conversations
  s.conversations.forEach((conv, index) => {
    if (conv.status === "ended") {
      const sessionNumber = Math.floor(index / 3) + 1; // Simulate returning users
      conv.intelligence = generateConversationIntelligence(conv.id, sessionNumber);
    }
  });
}

// Store is guaranteed to be defined after the initialization above
const store = g._store!;

// ── Users ────────────────────────────────────────────────────────────────────
export const users = {
  findByEmail: (email: string) => store.users.find(u => u.email === email) ?? null,
  findById: (id: string) => store.users.find(u => u.id === id) ?? null,
  create: (data: Omit<User, "id" | "createdAt">) => {
    const user: User = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.users.push(user);
    return user;
  },
};

// ── Agents ───────────────────────────────────────────────────────────────────
export const agents = {
  findAll: (userId: string) =>
    store.agents.filter(a => a.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  findById: (id: string) => store.agents.find(a => a.id === id) ?? null,
  findByPublicId: (publicId: string) =>
    store.agents.find(a => a.publicId === publicId && a.isPublic && a.isActive) ?? null,
  create: (data: Omit<Agent, "id" | "createdAt" | "updatedAt" | "evaluationCriteria" | "dataCollectionPoints">) => {
    const now = new Date().toISOString();
    const agent: Agent = { ...data, id: uid(), createdAt: now, updatedAt: now, evaluationCriteria: [], dataCollectionPoints: [] };
    store.agents.push(agent);
    return agent;
  },
  update: (id: string, data: Partial<Agent>) => {
    const i = store.agents.findIndex(a => a.id === id);
    if (i === -1) return null;
    store.agents[i] = { ...store.agents[i], ...data, updatedAt: new Date().toISOString() };
    return store.agents[i];
  },
  delete: (id: string) => {
    const i = store.agents.findIndex(a => a.id === id);
    if (i !== -1) store.agents.splice(i, 1);
    // cascade
    store.conversations = store.conversations.filter(c => c.agentId !== id);
    store.agentDocuments = store.agentDocuments.filter(ad => ad.agentId !== id);
  },
  addCriterion: (agentId: string, data: Omit<EvaluationCriterion, "id" | "createdAt" | "agentId">) => {
    const agent = store.agents.find(a => a.id === agentId);
    if (!agent) return null;
    const criterion: EvaluationCriterion = { ...data, id: uid(), agentId, createdAt: new Date().toISOString() };
    agent.evaluationCriteria.push(criterion);
    return criterion;
  },
  addDataPoint: (agentId: string, data: Omit<DataCollectionPoint, "id" | "createdAt" | "agentId">) => {
    const agent = store.agents.find(a => a.id === agentId);
    if (!agent) return null;
    const point: DataCollectionPoint = { ...data, id: uid(), agentId, createdAt: new Date().toISOString() };
    agent.dataCollectionPoints.push(point);
    return point;
  },
};

// ── Conversations ─────────────────────────────────────────────────────────────
export const conversations = {
  findByAgent: (agentId: string) =>
    store.conversations.filter(c => c.agentId === agentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  findById: (id: string) => store.conversations.find(c => c.id === id) ?? null,
  create: (data: Omit<Conversation, "id" | "createdAt">) => {
    const conv: Conversation = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.conversations.push(conv);
    return conv;
  },
  update: (id: string, data: Partial<Conversation>) => {
    const i = store.conversations.findIndex(c => c.id === id);
    if (i === -1) return null;
    store.conversations[i] = { ...store.conversations[i], ...data };
    return store.conversations[i];
  },
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messages = {
  findByConversation: (conversationId: string) =>
    store.messages.filter(m => m.conversationId === conversationId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  create: (data: Omit<Message, "id" | "createdAt">) => {
    const msg: Message = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.messages.push(msg);
    return msg;
  },
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documents = {
  findAll: (userId: string) =>
    store.documents.filter(d => d.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  findById: (id: string) => store.documents.find(d => d.id === id) ?? null,
  create: (data: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const doc: Document = { ...data, id: uid(), createdAt: now, updatedAt: now };
    store.documents.push(doc);
    return doc;
  },
  forAgent: (agentId: string) => {
    const ids = store.agentDocuments.filter(ad => ad.agentId === agentId).map(ad => ad.documentId);
    return store.documents.filter(d => ids.includes(d.id));
  },
  linkToAgent: (agentId: string, documentId: string) => {
    if (store.agentDocuments.find(ad => ad.agentId === agentId && ad.documentId === documentId)) return false;
    store.agentDocuments.push({ agentId, documentId });
    return true;
  },
  unlinkFromAgent: (agentId: string, documentId: string) => {
    store.agentDocuments = store.agentDocuments.filter(ad => !(ad.agentId === agentId && ad.documentId === documentId));
  },
};

// ── Evaluation Results ───────────────────────────────────────────────────────
export const evaluationResults = {
  findByConversation: (conversationId: string) =>
    store.evaluationResults.filter(r => r.conversationId === conversationId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  create: (data: Omit<EvaluationResult, "id" | "createdAt">) => {
    const result: EvaluationResult = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.evaluationResults.push(result);
    return result;
  },
  bulkCreate: (items: Omit<EvaluationResult, "id" | "createdAt">[]) => {
    const now = new Date().toISOString();
    const results = items.map(data => ({ ...data, id: uid(), createdAt: now }) as EvaluationResult);
    store.evaluationResults.push(...results);
    return results;
  },
};

// ── Collected Data ───────────────────────────────────────────────────────────
export const collectedData = {
  findByConversation: (conversationId: string) =>
    store.collectedData.filter(d => d.conversationId === conversationId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  create: (data: Omit<CollectedData, "id" | "createdAt">) => {
    const item: CollectedData = { ...data, id: uid(), createdAt: new Date().toISOString() };
    store.collectedData.push(item);
    return item;
  },
  bulkCreate: (items: Omit<CollectedData, "id" | "createdAt">[]) => {
    const now = new Date().toISOString();
    const results = items.map(data => ({ ...data, id: uid(), createdAt: now }) as CollectedData);
    store.collectedData.push(...results);
    return results;
  },
};

// ── Knowledge Bases ──────────────────────────────────────────────────────────
export const knowledgeBases = {
  findAll: () => [...(store.knowledgeBases || [])].sort((a, b) => a.name.localeCompare(b.name)),
  findById: (id: string) => (store.knowledgeBases || []).find(kb => kb.id === id) ?? null,
  getAgentsUsingKB: (kbId: string) => (store.agents || []).filter(a => a.knowledgeBaseId === kbId),
  create: (data: Omit<KnowledgeBase, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const kb: KnowledgeBase = { ...data, id: uid(), createdAt: now, updatedAt: now };
    if (!store.knowledgeBases) store.knowledgeBases = [];
    store.knowledgeBases.push(kb);
    return kb;
  },
  update: (id: string, data: Partial<KnowledgeBase>) => {
    if (!store.knowledgeBases) return null;
    const i = store.knowledgeBases.findIndex(kb => kb.id === id);
    if (i === -1) return null;
    store.knowledgeBases[i] = { ...store.knowledgeBases[i], ...data, updatedAt: new Date().toISOString() };
    return store.knowledgeBases[i];
  },
  delete: (id: string) => {
    if (!store.knowledgeBases) return;
    const i = store.knowledgeBases.findIndex(kb => kb.id === id);
    if (i !== -1) store.knowledgeBases.splice(i, 1);
    // Unlink from agents
    if (store.agents) {
      store.agents.forEach(a => {
        if (a.knowledgeBaseId === id) a.knowledgeBaseId = null;
      });
    }
  },
};
