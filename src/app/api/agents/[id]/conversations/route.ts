import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { agents, conversations, messages, evaluationResults } from "@/lib/store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const convs = conversations.findByAgent(id);
  const total = convs.length;
  const totalDuration = convs.reduce((sum, c) => sum + (c.duration || 0), 0);
  const avgDuration = total ? Math.round(totalDuration / total) : 0;
  return NextResponse.json({
    conversations: convs.map(c => {
      const msgs = messages.findByConversation(c.id);
      const evalResults = evaluationResults.findByConversation(c.id);
      const evalTotal = evalResults.length;
      const evalPassed = evalResults.filter(r => r.result === true).length;
      return {
        ...c,
        messages: msgs,
        messageCount: msgs.length,
        evaluation: evalTotal > 0 ? {
          total: evalTotal,
          passed: evalPassed,
          passRate: Math.round((evalPassed / evalTotal) * 100),
        } : null,
      };
    }),
    total,
    stats: { totalConversations: total, totalDuration, avgDuration },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const agent = agents.findById(id);
  if (!agent || (!agent.isPublic && agent.userId !== body.userId)) {
    return NextResponse.json({ error: "Agent not found or not published" }, { status: 404 });
  }
  const conv = conversations.create({
    agentId: id, userId: body.userId || null,
    mode: body.mode || "text", source: body.source || "widget",
    callerName: body.callerName || null, callerEmail: body.callerEmail || null,
    callerPhone: body.callerPhone || null, status: "active",
    duration: null, summary: null, sentiment: null, resolved: false, endedAt: null, audioUrl: null,
  });
  if (agent.firstMessage) {
    messages.create({ conversationId: conv.id, role: "assistant", content: agent.firstMessage,
      audioUrl: null, audioDuration: null, isVoiceInput: false, toolCall: null, ragContext: null });
  }
  return NextResponse.json(conv, { status: 201 });
}
