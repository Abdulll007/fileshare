import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { fileId, password } = await req.json();

  if (!fileId || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db
    .update(files)
    .set({ password: hashed })
    .where(eq(files.id, fileId));

  return NextResponse.json({ success: true });
}