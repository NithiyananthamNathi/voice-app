import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { documents } from "@/lib/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(documents.findAll(session.user.id));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
  let textContent = "";
  if (["txt", "md", "csv", "json"].includes(ext)) {
    textContent = buffer.toString("utf-8");
  } else {
    textContent = `[${ext.toUpperCase()} document: ${file.name}]`;
  }
  const doc = documents.create({
    name: name || file.name, type: ext, content: textContent,
    url: null, fileSize: buffer.length, charCount: textContent.length,
    status: "ready", userId: session.user.id,
  });
  return NextResponse.json(doc, { status: 201 });
}
