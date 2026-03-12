import { NextResponse } from "next/server";
import { conversations } from "@/lib/store";
import { generateMockAnalysis } from "@/lib/mock-analysis";
import { generateConversationIntelligence } from "@/lib/mock-intelligence";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = conversations.findById(id);
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  return NextResponse.json(conv);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  
  // Generate intelligence when conversation ends
  let intelligence = null;
  if (body.status === "ended") {
    // TODO: In production, determine session number from user's conversation history
    const sessionNumber = 1; // For now, treat each as first session
    intelligence = generateConversationIntelligence(id, sessionNumber);
  }
  
  const conv = conversations.update(id, {
    ...body,
    endedAt: body.status === "ended" ? new Date().toISOString() : undefined,
    intelligence: body.status === "ended" ? intelligence : undefined,
  });
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  // Trigger mock analysis when conversation ends
  if (body.status === "ended") {
    generateMockAnalysis(conv.id, conv.agentId);
  }

  return NextResponse.json(conv);
}
