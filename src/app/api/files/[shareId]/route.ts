import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET — fetch file metadata by shareId
export async function GET(req: NextRequest,{ params }:  { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  const file = await db.query.files.findFirst({
    where: eq(files.shareId, shareId),
  });




  if (!file) { 
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Check expiry
  if (file.expiresAt && new Date() > file.expiresAt) {
    return NextResponse.json({ error: "File has expired" }, { status: 410 });
  }

  // If password protected, don't return URL yet
  const isPasswordProtected = !!file.password;

  return NextResponse.json({
    id: file.id,
    name: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    shareId: file.shareId,
    downloadCount: file.downloadCount,
    expiresAt: file.expiresAt,
    isPasswordProtected,
    // Only return URL if not password protected
    url: isPasswordProtected ? null : file.utUrl,
  });
}

// POST — verify password and return file URL
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  const { password } = await req.json();

  const file = await db.query.files.findFirst({
    where: eq(files.shareId, shareId),
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (!file.password) {
    return NextResponse.json({ url: file.utUrl });
  }

  const isValid = await bcrypt.compare(password, file.password);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Increment download count
  await db
    .update(files)
    .set({ downloadCount: (file.downloadCount ?? 0) + 1 })
    .where(eq(files.shareId, shareId));

  return NextResponse.json({ url: file.utUrl });
}