import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { agents, conversations } from "@/lib/store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const convs = conversations.findByAgent(id);
  const totalDuration = convs.reduce((sum, c) => sum + (c.duration || 0), 0);
  return NextResponse.json({ ...agent, conversationCount: convs.length, totalDuration });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const body = await request.json();
  return NextResponse.json(agents.update(id, body));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  agents.delete(id);
  return NextResponse.json({ success: true });
}
