import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { evalRuns, agents, conversations, messages } from "@/lib/store";
import type { EvalRound } from "@/lib/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const runs = evalRuns.findAll(session.user.id);
  return NextResponse.json(runs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    agentId,
    conversationId,
    rubricCategory,
    rubricSubCategory,
    criteria,
    judgeModel = "claude-sonnet-4-5-20250514",
    critiqueModel = "gemini-2.5-pro",
  } = body;

  if (!agentId || !conversationId || !criteria) {
    return NextResponse.json({ error: "agentId, conversationId, and criteria are required" }, { status: 400 });
  }

  const agent = agents.findById(agentId);
  if (!agent || agent.userId !== session.user.id) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const conv = conversations.findById(conversationId);
  if (!conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Get conversation messages to build the transcript
  const msgs = messages.findByConversation(conversationId);
  const transcript = msgs.map(m => `${m.role === "assistant" ? "AI assistant" : "H"}: ${m.content}`).join("\n\n");

  // Create the eval run (simulated - in production this would call actual LLM APIs)
  const run = evalRuns.create({
    agentId,
    agentName: agent.name,
    conversationId,
    conversationName: conv.callerName || "Anonymous",
    rubricCategory: rubricCategory || "Custom",
    rubricSubCategory: rubricSubCategory || "Custom",
    criteria,
    judgeModel,
    critiqueModel,
    status: "completed",
    rounds: generateSimulatedRounds(criteria, transcript),
    finalVerdict: null,
    finalConfidence: null,
    userId: session.user.id,
  });

  // Set final verdict from last round
  if (run.rounds.length > 0) {
    const lastRound = run.rounds[run.rounds.length - 1];
    evalRuns.update(run.id, {
      finalVerdict: lastRound.judge.status,
      finalConfidence: lastRound.critique.confidence,
    });
  }

  return NextResponse.json(evalRuns.findById(run.id), { status: 201 });
}

// Simulated Judge + Critique evaluation
// In production, replace with actual LLM API calls
function generateSimulatedRounds(criteria: string, transcript: string): EvalRound[] {
  const hasPositiveSignals = transcript.toLowerCase().includes("well") ||
    transcript.toLowerCase().includes("good") ||
    transcript.toLowerCase().includes("excellent");

  const hasNegativeSignals = transcript.toLowerCase().includes("terrible") ||
    transcript.toLowerCase().includes("worse") ||
    transcript.toLowerCase().includes("not working");

  const msgCount = transcript.split("\n\n").length;
  const isDetailed = msgCount > 8;

  // Round 1: Initial judge evaluation
  let r1Status: "YES" | "NO" | "PARTIAL";
  let r1Confidence: number;

  if (hasPositiveSignals && isDetailed) {
    r1Status = "YES";
    r1Confidence = Math.floor(Math.random() * 10) + 85;
  } else if (hasNegativeSignals && !hasPositiveSignals) {
    r1Status = "NO";
    r1Confidence = Math.floor(Math.random() * 15) + 70;
  } else if (hasNegativeSignals) {
    r1Status = "PARTIAL";
    r1Confidence = Math.floor(Math.random() * 15) + 70;
  } else {
    r1Status = Math.random() > 0.4 ? "YES" : "PARTIAL";
    r1Confidence = Math.floor(Math.random() * 20) + 75;
  }

  const rounds: EvalRound[] = [
    {
      roundNumber: 1,
      judge: {
        status: r1Status,
        reason: `Based on the conversation analysis against the criterion "${criteria}", the AI assistant ${r1Status === "YES" ? "meets the evaluated criteria. The response demonstrates" : r1Status === "PARTIAL" ? "partially meets the criteria. While some aspects are addressed," : "does not sufficiently meet the criteria."} ${r1Status !== "NO" ? "appropriate clinical reasoning and patient engagement throughout the interaction." : "Key gaps include insufficient depth of clinical assessment and missed opportunities for follow-up."} The conversation contains ${msgCount} exchanges which ${isDetailed ? "provides sufficient depth" : "may limit the assessment scope"}.`,
      },
      critique: {
        confidence: r1Confidence,
        feedback: `The physician's evaluation ${r1Confidence >= 85 ? "is thorough and well-reasoned" : r1Confidence >= 75 ? "demonstrates adequate clinical judgment but could be more specific" : "needs improvement in several areas"}. ${r1Confidence < 90 ? "Areas for improvement include: more specific reference to evidence-based guidelines, consideration of patient-specific factors, and explicit acknowledgment of clinical nuance in the evaluated criterion." : "The analysis correctly identifies key elements and provides actionable clinical reasoning."}`,
      },
    },
  ];

  // Add round 2 if confidence was below 90 (critique triggered re-evaluation)
  if (r1Confidence < 90) {
    const r2Status = r1Status === "YES" ? "YES" : r1Status === "PARTIAL" ? (Math.random() > 0.5 ? "PARTIAL" : "YES") : "PARTIAL";
    const r2Confidence = Math.min(r1Confidence + Math.floor(Math.random() * 10) + 3, 96);

    rounds.push({
      roundNumber: 2,
      judge: {
        status: r2Status,
        reason: `After incorporating the critique feedback and conducting additional analysis: ${r2Status === "YES" ? "The conversation does meet the evaluated criterion when considering the full clinical context." : "The evaluation is revised to PARTIAL - while the AI demonstrates understanding of the criterion, specific clinical nuances identified by the critique agent reveal areas where the response could be more comprehensive."} Updated assessment accounts for evidence-based guideline alignment and patient-specific context.`,
      },
      critique: {
        confidence: r2Confidence,
        feedback: `This revised evaluation demonstrates ${r2Confidence >= 90 ? "excellent" : "improved"} critical thinking. The physician has ${r2Confidence >= 85 ? "successfully addressed the previous concerns and provided a more nuanced assessment" : "made progress but could still benefit from deeper analysis of specific clinical thresholds and guideline citations"}. Overall, the evaluation is ${r2Confidence >= 90 ? "ready for use" : "approaching clinical utility"} with ${r2Confidence >= 90 ? "only minor refinements needed" : "some remaining gaps to address"}.`,
      },
    });
  }

  return rounds;
}
