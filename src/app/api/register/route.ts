import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { users } from "@/lib/store";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  if (users.findByEmail(email))
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  const hashed = await bcrypt.hash(password, 10);
  const user = users.create({ email, name: name || null, password: hashed, image: null });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
