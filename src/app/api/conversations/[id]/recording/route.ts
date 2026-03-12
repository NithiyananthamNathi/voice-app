import { NextResponse } from "next/server";
import { conversations } from "@/lib/store";

// PUT /api/conversations/[id]/recording  — save the audio data URL
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { audioUrl } = await request.json();
  const conv = conversations.update(id, { audioUrl });
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
