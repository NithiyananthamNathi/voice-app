import { NextResponse } from "next/server";
import { agents } from "@/lib/store";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const agent = agents.findByPublicId(publicId);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  const { id, name, description, avatar, firstMessage, language, widgetTheme, widgetColor, widgetPosition,
    voiceEnabled, voiceId, voiceStability, voiceSimilarityBoost, voiceStyleExaggeration, voiceSpeakerBoost,
    allowInterrupt, silenceTimeout, endCallOnGoodbye } = agent;
  return NextResponse.json({ id, name, description, avatar, firstMessage, language, widgetTheme, widgetColor, widgetPosition,
    voiceEnabled, voiceId, voiceStability, voiceSimilarityBoost, voiceStyleExaggeration, voiceSpeakerBoost,
    allowInterrupt, silenceTimeout, endCallOnGoodbye });
}
