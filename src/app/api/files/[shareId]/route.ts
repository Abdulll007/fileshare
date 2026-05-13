import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  const file = await db.query.files.findFirst({
    where: eq(files.shareId, params.shareId),
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Check expiry — if expired, clean up immediately
  if (file.expiresAt && new Date() > file.expiresAt) {
    // Delete from UploadThing and DB on access
    await utapi.deleteFiles(file.utKey);
    await db.delete(files).where(eq(files.id, file.id));

    return NextResponse.json({ error: "File has expired" }, { status: 410 });
  }

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
    url: isPasswordProtected ? null : file.utUrl,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  const { password } = await req.json();

  const file = await db.query.files.findFirst({
    where: eq(files.shareId, params.shareId),
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Check expiry here too
  if (file.expiresAt && new Date() > file.expiresAt) {
    await utapi.deleteFiles(file.utKey);
    await db.delete(files).where(eq(files.id, file.id));
    return NextResponse.json({ error: "File has expired" }, { status: 410 });
  }

  if (!file.password) {
    return NextResponse.json({ url: file.utUrl });
  }

  const isValid = await bcrypt.compare(password, file.password);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await db
    .update(files)
    .set({ downloadCount: (file.downloadCount ?? 0) + 1 })
    .where(eq(files.shareId, params.shareId));

  return NextResponse.json({ url: file.utUrl });
}