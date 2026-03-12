import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { agents, documents } from "@/lib/store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json(documents.forAgent(id));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const { documentId } = await request.json();
  if (!documentId) return NextResponse.json({ error: "Document ID required" }, { status: 400 });
  const doc = documents.findById(documentId);
  if (!doc || doc.userId !== session.user.id) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  const linked = documents.linkToAgent(id, documentId);
  if (!linked) return NextResponse.json({ error: "Already linked" }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");
  if (!documentId) return NextResponse.json({ error: "Document ID required" }, { status: 400 });
  documents.unlinkFromAgent(id, documentId);
  return NextResponse.json({ success: true });
}
