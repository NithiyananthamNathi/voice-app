import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { knowledgeBases } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kbs = knowledgeBases.findAll();
    
    // Include assigned agents for each KB
    const kbsWithAgents = kbs.map(kb => ({
      ...kb,
      assignedAgents: knowledgeBases.getAgentsUsingKB(kb.id).map(a => ({
        id: a.id,
        name: a.name,
      })),
    }));

    return NextResponse.json({ knowledgeBases: kbsWithAgents });
  } catch (error) {
    console.error("Error in /api/knowledge:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
