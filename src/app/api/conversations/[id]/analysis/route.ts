import { NextResponse } from "next/server";
import { conversations, evaluationResults, collectedData } from "@/lib/store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = conversations.findById(id);
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const results = evaluationResults.findByConversation(id);
  const data = collectedData.findByConversation(id);

  const totalCriteria = results.length;
  const passedCriteria = results.filter(r => r.result === true).length;
  const passRate = totalCriteria > 0 ? Math.round((passedCriteria / totalCriteria) * 100) : null;

  return NextResponse.json({
    evaluationResults: results,
    collectedData: data,
    summary: {
      totalCriteria,
      passedCriteria,
      passRate,
    },
  });
}
