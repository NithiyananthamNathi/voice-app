/**
 * Mock Conversation Intelligence Generator
 * 
 * Generates realistic, varied conversation intelligence data based on:
 * - Weighted probability distributions for each dimension
 * - Persona-Intent correlations (Anxious Worrier → EMOTIONAL_SUPPORT 65%)
 * - Emotional arc transitions (MILDLY_ANXIOUS → 70% Reassured)
 * - Trust progression over time (first session = neutral, later = high)
 * - Healthcare compliance (HIPAA-ready, no PII in intelligence data)
 * 
 * Based on X-Health AI Conversation Intelligence specification
 */

import type {
  PersonaArchetype,
  PrimaryIntent,
  SecondaryIntent,
  EmotionalState,
  InnateDesire,
  HealthLiteracyLevel,
  ReadinessToAct,
  TrustSignal,
  EngagementDepth,
  ConversationIntelligence,
} from "./store";

// ── Weighted Probability Distributions ─────────────────────────────────────────

const PERSONA_WEIGHTS: Record<PersonaArchetype, number> = {
  anxious_worrier: 32,      // Most common in health AI
  information_seeker: 24,
  newly_diagnosed: 18,
  caregiver: 12,
  action_taker: 6,
  veteran_patient: 4,
  emotional_processor: 3,
  skeptic: 1,
};

// Intent correlations by persona (probability %)
const PERSONA_INTENT_MAP: Record<PersonaArchetype, Record<PrimaryIntent, number>> = {
  anxious_worrier: {
    EMOTIONAL_SUPPORT: 65,
    SYMPTOM_UNDERSTANDING: 20,
    EMERGENCY_GUIDANCE: 10,
    LEARN_BASICS: 5,
    UNDERSTAND_TRIGGERS: 0,
    MEDICATION_EDUCATION: 0,
    LIFESTYLE_MANAGEMENT: 0,
    CAREGIVER_SUPPORT: 0,
    DOCTOR_PREP: 0,
    DEVICE_EDUCATION: 0,
    MYTH_BUSTING: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
  information_seeker: {
    LEARN_BASICS: 30,
    UNDERSTAND_TRIGGERS: 25,
    MEDICATION_EDUCATION: 20,
    LIFESTYLE_MANAGEMENT: 15,
    DEVICE_EDUCATION: 10,
    EMOTIONAL_SUPPORT: 0,
    SYMPTOM_UNDERSTANDING: 0,
    EMERGENCY_GUIDANCE: 0,
    CAREGIVER_SUPPORT: 0,
    DOCTOR_PREP: 0,
    MYTH_BUSTING: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
  newly_diagnosed: {
    LEARN_BASICS: 50,
    EMOTIONAL_SUPPORT: 25,
    SYMPTOM_UNDERSTANDING: 15,
    LIFESTYLE_MANAGEMENT: 10,
    UNDERSTAND_TRIGGERS: 0,
    MEDICATION_EDUCATION: 0,
    EMERGENCY_GUIDANCE: 0,
    CAREGIVER_SUPPORT: 0,
    DOCTOR_PREP: 0,
    DEVICE_EDUCATION: 0,
    MYTH_BUSTING: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
  caregiver: {
    CAREGIVER_SUPPORT: 40,
    LEARN_BASICS: 25,
    SYMPTOM_UNDERSTANDING: 20,
    LIFESTYLE_MANAGEMENT: 15,
    EMOTIONAL_SUPPORT: 0,
    UNDERSTAND_TRIGGERS: 0,
    MEDICATION_EDUCATION: 0,
    EMERGENCY_GUIDANCE: 0,
    DOCTOR_PREP: 0,
    DEVICE_EDUCATION: 0,
    MYTH_BUSTING: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
  action_taker: {
    LIFESTYLE_MANAGEMENT: 40,
    UNDERSTAND_TRIGGERS: 30,
    DEVICE_EDUCATION: 20,
    DOCTOR_PREP: 10,
    LEARN_BASICS: 0,
    EMOTIONAL_SUPPORT: 0,
    SYMPTOM_UNDERSTANDING: 0,
    MEDICATION_EDUCATION: 0,
    EMERGENCY_GUIDANCE: 0,
    CAREGIVER_SUPPORT: 0,
    MYTH_BUSTING: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
  veteran_patient: {
    MEDICATION_EDUCATION: 30,
    LIFESTYLE_MANAGEMENT: 25,
    UNDERSTAND_TRIGGERS: 20,
    DEVICE_EDUCATION: 15,
    DOCTOR_PREP: 10,
    LEARN_BASICS: 0,
    EMOTIONAL_SUPPORT: 0,
    SYMPTOM_UNDERSTANDING: 0,
    EMERGENCY_GUIDANCE: 0,
    CAREGIVER_SUPPORT: 0,
    MYTH_BUSTING: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
  emotional_processor: {
    EMOTIONAL_SUPPORT: 80,
    SYMPTOM_UNDERSTANDING: 15,
    LEARN_BASICS: 5,
    UNDERSTAND_TRIGGERS: 0,
    MEDICATION_EDUCATION: 0,
    LIFESTYLE_MANAGEMENT: 0,
    EMERGENCY_GUIDANCE: 0,
    CAREGIVER_SUPPORT: 0,
    DOCTOR_PREP: 0,
    DEVICE_EDUCATION: 0,
    MYTH_BUSTING: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
  skeptic: {
    MYTH_BUSTING: 40,
    MEDICATION_EDUCATION: 30,
    LEARN_BASICS: 20,
    LIFESTYLE_MANAGEMENT: 10,
    EMOTIONAL_SUPPORT: 0,
    SYMPTOM_UNDERSTANDING: 0,
    UNDERSTAND_TRIGGERS: 0,
    EMERGENCY_GUIDANCE: 0,
    CAREGIVER_SUPPORT: 0,
    DOCTOR_PREP: 0,
    DEVICE_EDUCATION: 0,
    SEEK_DIAGNOSIS: 0,
    SEEK_PRESCRIPTION: 0,
    SMALL_TALK: 0,
    UNKNOWN: 0,
  },
};

// Emotional arc transitions (given starting state, what's likely end state?)
const EMOTIONAL_ARC_MAP: Record<EmotionalState, Record<EmotionalState, number>> = {
  MILDLY_ANXIOUS: {
    CALM_CURIOUS: 70,      // Successful de-escalation
    MILDLY_ANXIOUS: 20,    // No change
    HIGHLY_ANXIOUS: 10,    // Escalation (failure case)
    FRUSTRATED: 0,
    OVERWHELMED: 0,
    HOPEFUL: 0,
    DEFEATED: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  HIGHLY_ANXIOUS: {
    MILDLY_ANXIOUS: 50,    // Partial de-escalation
    HIGHLY_ANXIOUS: 30,    // Still anxious
    OVERWHELMED: 15,       // Worsened
    CALM_CURIOUS: 5,       // Rare but possible
    FRUSTRATED: 0,
    HOPEFUL: 0,
    DEFEATED: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  CALM_CURIOUS: {
    CALM_CURIOUS: 60,      // Maintained
    HOPEFUL: 30,           // Positive progression
    MILDLY_ANXIOUS: 10,    // Discovered concern
    FRUSTRATED: 0,
    OVERWHELMED: 0,
    HIGHLY_ANXIOUS: 0,
    DEFEATED: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  FRUSTRATED: {
    CALM_CURIOUS: 40,      // Validated and calmed
    FRUSTRATED: 30,        // Still frustrated
    HOPEFUL: 20,           // Found a path forward
    DEFEATED: 10,          // Worsened
    OVERWHELMED: 0,
    MILDLY_ANXIOUS: 0,
    HIGHLY_ANXIOUS: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  OVERWHELMED: {
    CALM_CURIOUS: 45,      // Simplified for them
    MILDLY_ANXIOUS: 30,    // Partial improvement
    OVERWHELMED: 20,       // No change
    DEFEATED: 5,           // Worsened
    FRUSTRATED: 0,
    HOPEFUL: 0,
    HIGHLY_ANXIOUS: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  HOPEFUL: {
    HOPEFUL: 70,           // Maintained hope
    CALM_CURIOUS: 20,      // Settled into curiosity
    FRUSTRATED: 10,        // Hope dashed
    MILDLY_ANXIOUS: 0,
    OVERWHELMED: 0,
    HIGHLY_ANXIOUS: 0,
    DEFEATED: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  DEFEATED: {
    HOPEFUL: 35,           // Reignited hope (best outcome)
    CALM_CURIOUS: 25,      // Found grounding
    FRUSTRATED: 20,        // Emotional shift
    DEFEATED: 20,          // No change
    OVERWHELMED: 0,
    MILDLY_ANXIOUS: 0,
    HIGHLY_ANXIOUS: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  URGENT: {
    CALM_CURIOUS: 50,      // De-escalated successfully
    MILDLY_ANXIOUS: 30,    // Partially calmed
    HIGHLY_ANXIOUS: 20,    // Still urgent
    FRUSTRATED: 0,
    OVERWHELMED: 0,
    HOPEFUL: 0,
    DEFEATED: 0,
    URGENT: 0,
    NEUTRAL: 0,
    GRIEVING: 0,
  },
  NEUTRAL: {
    NEUTRAL: 50,
    CALM_CURIOUS: 30,
    HOPEFUL: 15,
    MILDLY_ANXIOUS: 5,
    FRUSTRATED: 0,
    OVERWHELMED: 0,
    HIGHLY_ANXIOUS: 0,
    DEFEATED: 0,
    URGENT: 0,
    GRIEVING: 0,
  },
  GRIEVING: {
    HOPEFUL: 40,           // Found some hope
    CALM_CURIOUS: 25,      // Space helped
    GRIEVING: 20,          // Still grieving
    FRUSTRATED: 15,        // Shifted to frustration
    OVERWHELMED: 0,
    MILDLY_ANXIOUS: 0,
    HIGHLY_ANXIOUS: 0,
    DEFEATED: 0,
    URGENT: 0,
    NEUTRAL: 0,
  },
};

// ── Helper Functions ────────────────────────────────────────────────────────────

function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * total;
  
  for (const [value, weight] of entries) {
    random -= weight;
    if (random <= 0) return value;
  }
  
  return entries[entries.length - 1][0]; // Fallback
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ── Main Generator Function ─────────────────────────────────────────────────────

export function generateConversationIntelligence(
  conversationId: string,
  sessionNumber = 1 // For tracking user progression over time
): ConversationIntelligence {
  
  // 1. Generate Persona (weighted distribution)
  const personaArchetype = weightedRandom(PERSONA_WEIGHTS);
  
  // 2. Generate Primary Intent (correlated with persona)
  const intentWeights = PERSONA_INTENT_MAP[personaArchetype];
  const primaryIntent = weightedRandom(intentWeights);
  
  // 3. Generate Secondary Intent (30% chance)
  const secondaryIntents: SecondaryIntent[] = [
    "COMPARISON",
    "PERSONAL_STORY",
    "CHILD_CONTEXT",
    "ELDERLY_CONTEXT",
    "NEWLY_DIAGNOSED",
    "LONG_TERM_PATIENT",
    "SEEKING_REASSURANCE",
  ];
  const secondaryIntent = Math.random() < 0.3 
    ? randomChoice(secondaryIntents)
    : null;
  
  // 4. Generate Emotional State (start)
  const emotionalStateStart = generateEmotionalStateForPersona(personaArchetype);
  
  // 5. Generate Emotional State (end) based on arc transitions
  const endStateWeights = EMOTIONAL_ARC_MAP[emotionalStateStart];
  const emotionalStateEnd = weightedRandom(endStateWeights);
  
  // 6. Create Conversation Arc string
  const conversationArc = `${emotionalStateStart} → ${formatEmotionalState(emotionalStateEnd)}`;
  
  // 7. Generate Innate Desire (correlated with persona and intent)
  const innateDesire = generateInnateDesire(personaArchetype, primaryIntent);
  
  // 8. Generate Health Literacy (correlated with persona)
  const healthLiteracy = generateHealthLiteracy(personaArchetype, sessionNumber);
  
  // 9. Generate Readiness to Act (correlated with persona)
  const readinessToAct = generateReadinessToAct(personaArchetype);
  
  // 10. Generate Trust Signal (progresses over sessions)
  const trustSignal = generateTrustSignal(personaArchetype, sessionNumber);
  
  // 11. Generate Engagement Depth
  const engagementDepth = generateEngagementDepth(personaArchetype);
  
  return {
    personaArchetype,
    primaryIntent,
    secondaryIntent,
    emotionalStateStart,
    emotionalStateEnd,
    conversationArc,
    innateDesire,
    healthLiteracy,
    readinessToAct,
    trustSignal,
    engagementDepth,
    generatedAt: new Date().toISOString(),
  };
}

// ── Specialized Generators ──────────────────────────────────────────────────────

function generateEmotionalStateForPersona(persona: PersonaArchetype): EmotionalState {
  // Persona influences starting emotional state
  const emotionalStateMap: Record<PersonaArchetype, EmotionalState[]> = {
    anxious_worrier: ["MILDLY_ANXIOUS", "HIGHLY_ANXIOUS", "OVERWHELMED"],
    newly_diagnosed: ["MILDLY_ANXIOUS", "OVERWHELMED", "CALM_CURIOUS"],
    veteran_patient: ["CALM_CURIOUS", "NEUTRAL", "FRUSTRATED"],
    skeptic: ["NEUTRAL", "FRUSTRATED", "CALM_CURIOUS"],
    caregiver: ["MILDLY_ANXIOUS", "OVERWHELMED", "CALM_CURIOUS"],
    information_seeker: ["CALM_CURIOUS", "NEUTRAL", "HOPEFUL"],
    action_taker: ["CALM_CURIOUS", "HOPEFUL", "NEUTRAL"],
    emotional_processor: ["FRUSTRATED", "GRIEVING", "DEFEATED", "OVERWHELMED"],
  };
  
  return randomChoice(emotionalStateMap[persona]);
}

function generateInnateDesire(
  persona: PersonaArchetype,
  intent: PrimaryIntent
): InnateDesire {
  // Innate desire is the "beneath-the-question" layer
  if (intent === "EMOTIONAL_SUPPORT") return "FEAR_RELIEF";
  if (intent === "MEDICATION_EDUCATION" && persona === "skeptic") return "CONTROL";
  if (intent === "CAREGIVER_SUPPORT") return "CONNECTION";
  if (intent === "LIFESTYLE_MANAGEMENT") return "PROGRESS";
  if (intent === "EMERGENCY_GUIDANCE") return "SAFETY";
  
  // Default mapping
  const desireMap: Record<PersonaArchetype, InnateDesire[]> = {
    anxious_worrier: ["FEAR_RELIEF", "VALIDATION", "SAFETY"],
    newly_diagnosed: ["FEAR_RELIEF", "SIMPLICITY", "CONNECTION"],
    veteran_patient: ["CONTROL", "PROGRESS", "IDENTITY"],
    skeptic: ["CONTROL", "VALIDATION"],
    caregiver: ["CONNECTION", "SIMPLICITY", "SAFETY"],
    information_seeker: ["CONTROL", "IDENTITY"],
    action_taker: ["PROGRESS", "CONTROL"],
    emotional_processor: ["VALIDATION", "CONNECTION", "FEAR_RELIEF"],
  };
  
  return randomChoice(desireMap[persona]);
}

function generateHealthLiteracy(
  persona: PersonaArchetype,
  sessionNumber: number
): HealthLiteracyLevel {
  // Literacy can grow over time
  const literacyProgressionBonus = Math.min(sessionNumber - 1, 2) * 0.15;
  
  const literacyWeights: Record<PersonaArchetype, Record<HealthLiteracyLevel, number>> = {
    newly_diagnosed: { beginner: 80, intermediate: 15, advanced: 5 },
    anxious_worrier: { beginner: 60, intermediate: 30, advanced: 10 },
    veteran_patient: { beginner: 5, intermediate: 25, advanced: 70 },
    information_seeker: { beginner: 10, intermediate: 40, advanced: 50 },
    skeptic: { beginner: 20, intermediate: 50, advanced: 30 },
    caregiver: { beginner: 50, intermediate: 40, advanced: 10 },
    action_taker: { beginner: 30, intermediate: 50, advanced: 20 },
    emotional_processor: { beginner: 55, intermediate: 35, advanced: 10 },
  };
  
  // Apply progression bonus (shifts toward advanced)
  const baseWeights = literacyWeights[persona];
  const adjustedWeights = {
    beginner: Math.max(0, baseWeights.beginner - literacyProgressionBonus * 100),
    intermediate: baseWeights.intermediate,
    advanced: baseWeights.advanced + literacyProgressionBonus * 100,
  };
  
  return weightedRandom(adjustedWeights);
}

function generateReadinessToAct(persona: PersonaArchetype): ReadinessToAct {
  const readinessMap: Record<PersonaArchetype, ReadinessToAct[]> = {
    newly_diagnosed: ["pre_contemplation", "contemplation"],
    anxious_worrier: ["contemplation", "preparation"],
    veteran_patient: ["action", "maintenance"],
    skeptic: ["pre_contemplation", "contemplation"],
    caregiver: ["contemplation", "preparation", "action"],
    information_seeker: ["preparation", "action"],
    action_taker: ["preparation", "action", "maintenance"],
    emotional_processor: ["pre_contemplation", "contemplation"],
  };
  
  return randomChoice(readinessMap[persona]);
}

function generateTrustSignal(
  persona: PersonaArchetype,
  sessionNumber: number
): TrustSignal {
  // Trust generally improves over sessions
  if (sessionNumber === 1) {
    // First session: mostly neutral or low
    return persona === "skeptic" 
      ? randomChoice(["low", "active_distrust", "neutral"])
      : randomChoice(["neutral", "neutral", "low", "high"]); // 50% neutral, 25% low, 25% high
  } else if (sessionNumber >= 3) {
    // Later sessions: mostly high
    return persona === "skeptic"
      ? randomChoice(["neutral", "neutral", "low", "high"]) // Still skeptical
      : randomChoice(["high", "high", "high", "neutral"]); // 75% high
  } else {
    // Middle sessions
    return randomChoice(["neutral", "high", "high"]);
  }
}

function generateEngagementDepth(persona: PersonaArchetype): EngagementDepth {
  const depthMap: Record<PersonaArchetype, EngagementDepth[]> = {
    newly_diagnosed: ["moderate", "moderate", "deep"], // Highly engaged
    anxious_worrier: ["moderate", "deep", "vulnerable"],
    veteran_patient: ["surface", "moderate", "moderate"], // Efficient
    skeptic: ["surface", "moderate"],
    caregiver: ["moderate", "deep"],
    information_seeker: ["moderate", "deep", "deep"], // Very engaged
    action_taker: ["moderate", "moderate", "surface"], // Goal-oriented
    emotional_processor: ["deep", "deep", "vulnerable"], // Very deep
  };
  
  return randomChoice(depthMap[persona]);
}

function formatEmotionalState(state: EmotionalState): string {
  // Convert SCREAMING_CASE to Title Case for display
  return state
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

// ── Batch Generator for Testing ─────────────────────────────────────────────────

export function generateBatchIntelligence(count: number): ConversationIntelligence[] {
  const batch: ConversationIntelligence[] = [];
  
  for (let i = 0; i < count; i++) {
    // Simulate users with varying session numbers (1-5)
    const sessionNumber = Math.floor(Math.random() * 5) + 1;
    const intelligence = generateConversationIntelligence(`test-conv-${i}`, sessionNumber);
    batch.push(intelligence);
  }
  
  return batch;
}
