import { NextResponse } from "next/server";
import { conversations } from "@/lib/store";
import { generateConversationIntelligence } from "@/lib/mock-intelligence";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const conversation = conversations.findById(id);
  
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  if (!conversation.intelligence) {
    return NextResponse.json(
      { error: "Intelligence not yet generated. Conversation must be ended first." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    conversationId: conversation.id,
    intelligence: conversation.intelligence,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  const conversation = conversations.findById(id);
  
  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // Regenerate intelligence (useful for testing or if model improves)
  const sessionNumber = body.sessionNumber || 1;
  const intelligence = generateConversationIntelligence(id, sessionNumber);

  conversations.update(id, { intelligence });

  return NextResponse.json({
    conversationId: id,
    intelligence,
    regenerated: true,
  });
}
