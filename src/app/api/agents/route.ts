import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { agents, messages, conversations } from "@/lib/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = agents.findAll(session.user.id).map(a => ({
    ...a,
    conversationCount: conversations.findByAgent(a.id).length,
  }));
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { name, systemPrompt, description, firstMessage, userPrompt, llmProvider, llmModel, temperature, maxTokens,
    thinkingBudget, enableBackupLlm, backupLlmProvider, backupLlmModel, voiceEnabled, voiceId, language,
    voiceStability, voiceSimilarityBoost, voiceStyleExaggeration, voiceSpeakerBoost, turnTaking,
    allowInterrupt, silenceTimeout, responseTimeout, maxDuration, endCallOnGoodbye, ambientSound,
    analysisLanguage, enableAnalysis, evaluationCriteria, dataCollectionPoints, knowledgeBaseId } = body;
  if (!name || !systemPrompt) return NextResponse.json({ error: "Name and system prompt required" }, { status: 400 });
  const agent = agents.create({
    name, description: description || null, systemPrompt,
    firstMessage: firstMessage || "Hello! How can I assist you today?",
    userPrompt: userPrompt || "",
    llmProvider: llmProvider || "openai", llmModel: llmModel || "gpt-4o",
    temperature: temperature ?? 0.7, maxTokens: maxTokens || 1000, thinkingBudget: thinkingBudget || null,
    enableBackupLlm: enableBackupLlm ?? true, backupLlmProvider: backupLlmProvider || "openai",
    backupLlmModel: backupLlmModel || "gpt-4o-mini", voiceEnabled: voiceEnabled ?? true,
    voiceId: voiceId || null, language: language || "en", voiceStability: voiceStability ?? 50,
    voiceSimilarityBoost: voiceSimilarityBoost ?? 75, voiceStyleExaggeration: voiceStyleExaggeration ?? 0,
    voiceSpeakerBoost: voiceSpeakerBoost ?? true, turnTaking: turnTaking || "auto",
    allowInterrupt: allowInterrupt ?? true, silenceTimeout: silenceTimeout ?? 5,
    responseTimeout: responseTimeout || 30, maxDuration: maxDuration || 600,
    endCallOnGoodbye: endCallOnGoodbye ?? true, ambientSound: ambientSound || null,
    analysisLanguage: analysisLanguage || "auto", enableAnalysis: enableAnalysis ?? true,
    isPublic: false, isActive: true, publicId: null, publishedAt: null,
    widgetTheme: "light", widgetColor: "#2563eb", widgetPosition: "bottom-right",
    knowledgeBaseId: knowledgeBaseId || null,
    avatar: null, userId: session.user.id,
  });
  if (evaluationCriteria?.length) {
    for (const c of evaluationCriteria) agents.addCriterion(agent.id, { name: c.name, description: c.description || null, prompt: c.prompt, type: c.type || "boolean", isActive: c.isActive ?? true });
  }
  if (dataCollectionPoints?.length) {
    for (const p of dataCollectionPoints) agents.addDataPoint(agent.id, { name: p.name, description: p.description || null, dataType: p.dataType || "string", prompt: p.prompt, isRequired: p.isRequired ?? false, isActive: p.isActive ?? true });
  }
  // Suppress unused import warning
  void messages;
  return NextResponse.json(agents.findById(agent.id), { status: 201 });
}
