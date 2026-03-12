import { NextResponse } from "next/server";
import { conversations, messages } from "@/lib/store";

const mockResponses = [
  "I understand your concern. Based on what you've described, I recommend scheduling an appointment with your healthcare provider for a proper evaluation.",
  "Thank you for sharing that information. While I can provide general guidance, please remember that this doesn't replace professional medical advice.",
  "That's a great question! Here's what I can tell you based on general medical knowledge...",
  "I'm here to help. Could you provide more details about your symptoms so I can better assist you?",
  "Based on the information you've provided, here are some general recommendations. However, please consult with your doctor for personalized advice.",
];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(messages.findByConversation(id));
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { role, content, isVoiceInput } = body;
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });
  const conv = conversations.findById(id);
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  const userMessage = messages.create({
    conversationId: id, role: role || "user", content: content.trim(),
    audioUrl: null, audioDuration: null, isVoiceInput: isVoiceInput ?? false,
    toolCall: null, ragContext: null,
  });
  let assistantMessage = null;
  if (role === "user") {
    await new Promise(r => setTimeout(r, 400));
    const responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    assistantMessage = messages.create({
      conversationId: id, role: "assistant", content: responseText,
      audioUrl: null, audioDuration: null, isVoiceInput: false, toolCall: null, ragContext: null,
    });
    conversations.update(id, { duration: (conv.duration || 0) + Math.floor(Math.random() * 30) + 10 });
  }
  return NextResponse.json({ userMessage, assistantMessage }, { status: 201 });
}
