import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { agents, conversations, evaluationResults, collectedData } from "@/lib/store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  // Get all conversations for this agent
  const convs = conversations.findByAgent(id);

  // Aggregate evaluation results per criterion
  const criteriaResults: Record<string, { name: string; total: number; passed: number; failed: number }> = {};
  for (const conv of convs) {
    const results = evaluationResults.findByConversation(conv.id);
    for (const r of results) {
      if (!criteriaResults[r.criterionId]) {
        criteriaResults[r.criterionId] = { name: r.criterionName, total: 0, passed: 0, failed: 0 };
      }
      criteriaResults[r.criterionId].total++;
      if (r.result === true) criteriaResults[r.criterionId].passed++;
      else criteriaResults[r.criterionId].failed++;
    }
  }

  // Aggregate collected data per data point
  const dataPointResults: Record<string, { name: string; dataType: string; collected: number; total: number; sampleValues: string[] }> = {};
  for (const conv of convs) {
    const data = collectedData.findByConversation(conv.id);
    for (const d of data) {
      if (!dataPointResults[d.dataPointId]) {
        dataPointResults[d.dataPointId] = { name: d.dataPointName, dataType: d.dataType, collected: 0, total: 0, sampleValues: [] };
      }
      dataPointResults[d.dataPointId].total++;
      dataPointResults[d.dataPointId].collected++;
      if (dataPointResults[d.dataPointId].sampleValues.length < 5) {
        dataPointResults[d.dataPointId].sampleValues.push(d.value);
      }
    }
    // Count conversations without this data point
    for (const key of Object.keys(dataPointResults)) {
      if (!data.find(d => d.dataPointId === key)) {
        dataPointResults[key].total++;
      }
    }
  }

  // Per-conversation breakdown
  const conversationAnalysis = convs.slice(0, 50).map(conv => {
    const results = evaluationResults.findByConversation(conv.id);
    const data = collectedData.findByConversation(conv.id);
    const passed = results.filter(r => r.result === true).length;
    return {
      conversationId: conv.id,
      callerName: conv.callerName,
      createdAt: conv.createdAt,
      mode: conv.mode,
      evaluationResults: results,
      collectedData: data,
      summary: {
        totalCriteria: results.length,
        passed,
        failed: results.length - passed,
        passRate: results.length > 0 ? Math.round((passed / results.length) * 100) : null,
      },
    };
  });

  return NextResponse.json({
    analysisLanguage: agent.analysisLanguage,
    enableAnalysis: agent.enableAnalysis,
    evaluationCriteria: agent.evaluationCriteria,
    dataCollectionPoints: agent.dataCollectionPoints,
    // Aggregated results
    criteriaResults: Object.values(criteriaResults),
    dataPointResults: Object.values(dataPointResults),
    conversationAnalysis,
    totalConversations: convs.length,
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const { analysisLanguage, enableAnalysis, evaluationCriteria, dataCollectionPoints } = await request.json();
  agents.update(id, { analysisLanguage: analysisLanguage || "auto", enableAnalysis: enableAnalysis ?? true });
  if (evaluationCriteria) {
    agent.evaluationCriteria = [];
    for (const c of evaluationCriteria) agents.addCriterion(id, { name: c.name, description: c.description || null, prompt: c.prompt, type: c.type || "boolean", isActive: c.isActive ?? true });
  }
  if (dataCollectionPoints) {
    agent.dataCollectionPoints = [];
    for (const p of dataCollectionPoints) agents.addDataPoint(id, { name: p.name, description: p.description || null, dataType: p.dataType || "string", prompt: p.prompt, isRequired: p.isRequired ?? false, isActive: p.isActive ?? true });
  }
  return NextResponse.json(agents.findById(id));
}
