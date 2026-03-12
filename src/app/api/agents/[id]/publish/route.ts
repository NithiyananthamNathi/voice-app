import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { agents } from "@/lib/store";
import crypto from "crypto";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const publicId = agent.publicId || crypto.randomBytes(6).toString("hex");
  agents.update(id, { isPublic: true, publicId, publishedAt: new Date().toISOString() });
  return NextResponse.json({ success: true, publicId, publicUrl: `/consult/${publicId}` });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const agent = agents.findById(id);
  if (!agent || agent.userId !== session.user.id) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  agents.update(id, { isPublic: false, publishedAt: null });
  return NextResponse.json({ success: true });
}
